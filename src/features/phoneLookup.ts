import { WASocket, proto } from '@whiskeysockets/baileys';
import { ALLOWED_GROUPS } from '../config';
import { saveMessage, getSupabaseClient } from '../supabase';
import { WhatsAppMessage } from '../types';
import { markdownToWhatsApp } from '../utils/formatting';

/**
 * Clean query text of any group mentions or name mentions to avoid interference
 */
export function cleanQueryText(text: string): string {
  if (!text) return '';
  // Strip common mention formats e.g. "@Logan " or "@1234567890 "
  let cleaned = text.replace(/@\d+(\s|$)/g, '');
  cleaned = cleaned.replace(/^@\w+(\s|$)/i, '');
  return cleaned.trim();
}

/**
 * Detect if the message body represents a phone lookup query.
 * Returns the matched phone number or null if not a query.
 */
export function detectPhoneNumberQuery(body: string): string | null {
  if (!body) return null;
  
  const trimmed = body.trim();
  
  // 1. Check if the message is exactly a slash command or starts with specific phrases:
  // e.g. /lookup <number>, /رقم <number>, ابحث عن رقم <number>, كشف <number>, معلومات عن <number>
  const prefixes = [
    /^\/lookup\s+(.+)$/i,
    /^\/رقم\s+(.+)$/,
    /^ابحث\s+عن\s+رقم\s+(.+)$/i,
    /^ابحث\s+عن\s+(.+)$/i,
    /^كشف\s+رقم\s+(.+)$/i,
    /^كشف\s+(.+)$/i,
    /^معلومات\s+عن\s+رقم\s+(.+)$/i,
    /^معلومات\s+عن\s+(.+)$/i,
    /^معلومات\s+رقم\s+(.+)$/i
  ];
  
  for (const prefix of prefixes) {
    const match = trimmed.match(prefix);
    if (match && match[1]) {
      // Clean the matched part of common phone separators
      const cleaned = match[1].replace(/[\s\-()\[\]]/g, '');
      // Check if the cleaned part is a number of 9 to 15 digits, optionally with a +
      if (/^\+?\d{9,15}$/.test(cleaned)) {
        return cleaned;
      }
    }
  }
  
  // 2. Check if the entire message is just a phone number
  const cleanedBody = trimmed.replace(/[\s\-()\[\]]/g, '');
  
  // Is it a raw phone number?
  // A raw phone number must either:
  // - Start with + and be 9-15 digits (e.g. +201026672074)
  // - Be an Egyptian local number (010..., 011..., 012..., 015... - exactly 11 digits)
  // - Be an Egyptian international number (2010..., 2011..., 2012..., 2015... - exactly 12 digits)
  // - Be a general 9-15 digit international number starting with common country prefixes
  if (/^\+\d{9,15}$/.test(cleanedBody)) {
    return cleanedBody;
  }
  
  // Egyptian local number
  if (/^01[0125]\d{8}$/.test(cleanedBody)) {
    return cleanedBody;
  }
  
  // Egyptian international number
  if (/^201[0125]\d{8}$/.test(cleanedBody)) {
    return cleanedBody;
  }
  
  // Other common formats (e.g. Saudi Arabia, UAE, etc.)
  // We want to be a bit strict to not match random numbers like "123456789"
  // Let's check if it's 9-15 digits and starts with known Middle East/international country codes
  // Common country codes: 966 (KSA), 971 (UAE), 965 (Kuwait), 974 (Qatar), 972 (Israel), 962 (Jordan), 961 (Lebanon)
  if (/^(966|971|965|974|972|962|961|44|49|1|33|39|34|90)\d{7,12}$/.test(cleanedBody)) {
    return cleanedBody;
  }
  
  return null;
}

/**
 * Normalizes a phone number to standard international format (no leading +, 010xx المصري -> 2010xx)
 */
export function normalizePhoneNumber(num: string): string {
  // Remove any + sign
  let cleaned = num.replace(/^\+/, '');
  
  // If it's an Egyptian local number (starts with 01 and is 11 digits)
  if (/^01[0125]\d{8}$/.test(cleaned)) {
    // Replace leading 0 with 2
    cleaned = '2' + cleaned.substring(1);
  }
  
  return cleaned;
}

/**
 * Main entry handler for executing the phone number lookup
 */
export async function handlePhoneNumberLookup(
  sock: WASocket,
  chatId: string,
  messageBody: string,
  messageKey: proto.IMessageKey,
  senderNumber: string
): Promise<boolean> {
  const cleanedText = cleanQueryText(messageBody);
  const queryNumber = detectPhoneNumberQuery(cleanedText);
  if (!queryNumber) {
    return false;
  }

  const normalizedNumber = normalizePhoneNumber(queryNumber);
  const jid = `${normalizedNumber}@s.whatsapp.net`;

  console.log(`[PhoneLookup] Intercepted lookup for number: ${queryNumber} (normalized: ${normalizedNumber})`);

  // React with 🔍 to indicate we are searching
  try {
    await sock.sendMessage(chatId, { react: { text: '🔍', key: messageKey } });
  } catch (e) {
    console.log(`[PhoneLookup] React failed (non-fatal):`, e);
  }

  // Trigger typing indicator
  try {
    await sock.sendPresenceUpdate('composing', chatId);
  } catch (e) {}

  try {
    // 1. Check if the number is on WhatsApp
    const checkResult = await sock.onWhatsApp(jid);
    const exists = checkResult && checkResult.length > 0 && checkResult[0].exists;

    if (!exists) {
      // Send a polished card stating the number is NOT registered
      const responseText = `*🔍 نتائج الاستعلام عن الرقم 🔍*\n\n` +
        `📞 *رقم الهاتف:* +${normalizedNumber}\n` +
        `🔴 *حالة الواتساب:* غير مسجل على واتساب ⚠️\n\n` +
        `هذا الرقم ليس لديه حساب واتساب نشط حالياً.`;

      const formatted = markdownToWhatsApp(responseText);
      
      let recipientJid = chatId;
      if (chatId.endsWith('@lid') && senderNumber) {
        recipientJid = `${senderNumber}@s.whatsapp.net`;
      }
      
      const result = await sock.sendMessage(recipientJid, { text: formatted });

      // Update reaction to ⚠️
      try {
        await sock.sendMessage(chatId, { react: { text: '⚠️', key: messageKey } });
      } catch (e) {}

      // Log bot response to Supabase
      await logOutgoingMessage(chatId, responseText, result?.key?.id || undefined);
      return true;
    }

    // 2. Fetch additional details in parallel if registered
    let profilePicUrl: string | null = null;
    let bioStatus: string | null = null;
    let bioDateStr: string | null = null;
    let businessProfile: any = null;

    // Database intelligence fields
    let mutualGroups: string[] = [];
    let recentChats: string[] = [];
    let recentMessages: any[] = [];

    const supabase = getSupabaseClient();
    const dbPromises = supabase ? [
      supabase.from('whatsapp_messages').select('chat_name').eq('sender_number', normalizedNumber).eq('is_group', true).order('timestamp', { ascending: false }).limit(50),
      supabase.from('whatsapp_messages').select('chat_id, chat_name').eq('sender_number', normalizedNumber).eq('is_group', false).order('timestamp', { ascending: false }).limit(50),
      supabase.from('whatsapp_messages').select('chat_name, body, timestamp').eq('sender_number', normalizedNumber).not('body', 'is', null).order('timestamp', { ascending: false }).limit(3)
    ] : [Promise.resolve(null), Promise.resolve(null), Promise.resolve(null)];

    const [picPromise, statusPromise, bizPromise, dbGroupsRes, dbDmsRes, dbMsgsRes] = await Promise.allSettled([
      sock.profilePictureUrl(jid, 'image').catch(() => null),
      sock.fetchStatus(jid).catch(() => null),
      sock.getBusinessProfile(jid).catch(() => null),
      ...dbPromises
    ]);

    if (picPromise.status === 'fulfilled' && picPromise.value) {
      profilePicUrl = picPromise.value;
    }

    if (statusPromise.status === 'fulfilled' && statusPromise.value) {
      const statusVal = statusPromise.value as any;
      bioStatus = statusVal?.status || null;
      if (statusVal?.setAt) {
        const d = new Date(statusVal.setAt);
        // Format date: YYYY-MM-DD HH:MM
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        bioDateStr = `${year}-${month}-${day} ${hours}:${minutes}`;
      }
    }

    if (bizPromise.status === 'fulfilled' && bizPromise.value) {
      businessProfile = bizPromise.value;
    }

    // Process Supabase results
    if (dbGroupsRes.status === 'fulfilled' && dbGroupsRes.value) {
      const res = dbGroupsRes.value as any;
      if (res?.data) {
        mutualGroups = Array.from(new Set<string>(res.data.map((g: any) => g.chat_name))).slice(0, 3);
      }
    }

    if (dbDmsRes.status === 'fulfilled' && dbDmsRes.value) {
      const res = dbDmsRes.value as any;
      if (res?.data) {
        recentChats = Array.from(new Set<string>(res.data.map((d: any) => d.chat_name === 'DM' ? d.chat_id.split('@')[0] : d.chat_name))).slice(0, 3);
      }
    }

    if (dbMsgsRes.status === 'fulfilled' && dbMsgsRes.value) {
      const res = dbMsgsRes.value as any;
      if (res?.data) {
        recentMessages = res.data || [];
      }
    }

    // 3. Formulate the response card
    let responseText = `*🔍 نتائج الاستعلام عن الرقم 🔍*\n\n` +
      `📞 *رقم الهاتف:* +${normalizedNumber}\n` +
      `🟢 *حالة الواتساب:* مسجل ونشط ✅\n\n`;

    if (businessProfile) {
      responseText += `👤 *نوع الحساب:* حساب تجاري (Business Profile) 🏢\n`;
      if (businessProfile.name || businessProfile.title) {
        responseText += `🏢 *الاسم التجاري:* ${businessProfile.name || businessProfile.title}\n`;
      }
      if (businessProfile.description) {
        responseText += `📝 *وصف النشاط:* ${businessProfile.description}\n`;
      }
      if (businessProfile.category) {
        responseText += `🏷️ *التصنيف:* ${businessProfile.category}\n`;
      }
      if (businessProfile.address) {
        responseText += `📍 *العنوان:* ${businessProfile.address}\n`;
      }
      if (businessProfile.email) {
        responseText += `✉️ *البريد الإلكتروني:* ${businessProfile.email}\n`;
      }
      if (businessProfile.website && businessProfile.website.length > 0) {
        const webStr = Array.isArray(businessProfile.website) ? businessProfile.website.join(', ') : businessProfile.website;
        responseText += `🌐 *الموقع الإلكتروني:* ${webStr}\n`;
      }
      responseText += `\n`;
    } else {
      responseText += `👤 *نوع الحساب:* حساب شخصي (Personal) 👤\n\n`;
    }

    // Bio status text
    if (bioStatus) {
      responseText += `📝 *البايو / الحالة (About):*\n"${bioStatus}"\n`;
      if (bioDateStr) {
        responseText += `📅 *تاريخ تحديث البايو:* ${bioDateStr}\n`;
      }
      responseText += `\n`;
    } else {
      responseText += `📝 *البايو / الحالة:* غير متوفر بسبب إعدادات الخصوصية 🔒\n\n`;
    }

    // Profile picture url
    if (profilePicUrl) {
      responseText += `🖼️ *الصورة الشخصية:* ${profilePicUrl}\n\n`;
    } else {
      responseText += `🖼️ *الصورة الشخصية:* غير متوفرة بسبب إعدادات الخصوصية 🔒\n\n`;
    }

    // Database Intelligence section
    if (supabase) {
      responseText += `*📊 السجلات الاستخباراتية النشطة في البوت:*\n`;
      
      // Mutual Groups
      if (mutualGroups.length > 0) {
        responseText += `👥 *المجموعات المشتركة المرصودة:* \n` +
          mutualGroups.map(g => `  • ${g}`).join('\n') + `\n`;
      } else {
        responseText += `👥 *المجموعات المشتركة المرصودة:* لا توجد مجموعات مرصودة مشتركة حالياً.\n`;
      }

      // Direct DM Chats / Contacts
      if (recentChats.length > 0) {
        responseText += `🔗 *جهات الاتصال النشطة بالخاص:* \n` +
          recentChats.map(c => `  • ${c}`).join('\n') + `\n`;
      }

      // Recent statements
      if (recentMessages.length > 0) {
        responseText += `💬 *آخر تصريحاته ومواضيع حديثه:* \n` +
          recentMessages.map((m, index) => {
            return `  ${index + 1}. في شات *[${m.chat_name}]*:\n  "${m.body}"`;
          }).join('\n') + `\n\n`;
      } else {
        responseText += `💬 *آخر تصريحاته في السجلات:* لا توجد رسائل مسجلة له في قاعدة البيانات حتى الآن.\n\n`;
      }
    }

    // Quick direct message link
    responseText += `💬 *رابط مراسلة سريعة:* https://wa.me/${normalizedNumber}`;

    const formatted = markdownToWhatsApp(responseText);
    
    let recipientJid = chatId;
    if (chatId.endsWith('@lid') && senderNumber) {
      recipientJid = `${senderNumber}@s.whatsapp.net`;
    }
    
    const result = await sock.sendMessage(recipientJid, { text: formatted });

    // React with ✅ to show success
    try {
      await sock.sendMessage(chatId, { react: { text: '✅', key: messageKey } });
    } catch (e) {}

    // Log bot response to Supabase
    await logOutgoingMessage(chatId, responseText, result?.key?.id || undefined);

    return true;
  } catch (error) {
    console.error(`[PhoneLookup] Error performing lookup for ${normalizedNumber}:`, error);

    // Send a polite error message
    const errorText = `❌ عذراً، واجهت خطأ أثناء الاستعلام عن الرقم. يرجى المحاولة مرة أخرى لاحقاً.`;
    const formatted = markdownToWhatsApp(errorText);
    
    let recipientJid = chatId;
    if (chatId.endsWith('@lid') && senderNumber) {
      recipientJid = `${senderNumber}@s.whatsapp.net`;
    }
    
    await sock.sendMessage(recipientJid, { text: formatted });

    // React with ❌ to show failure
    try {
      await sock.sendMessage(chatId, { react: { text: '❌', key: messageKey } });
    } catch (e) {}

    return true;
  } finally {
    // Clear typing indicator
    try {
      await sock.sendPresenceUpdate('paused', chatId);
    } catch (e) {}
  }
}

/**
 * Log outgoing bot messages to Supabase for completeness
 */
async function logOutgoingMessage(chatId: string, response: string, messageId?: string) {
  try {
    const groupConfig = ALLOWED_GROUPS.find(g => g.id === chatId);
    const outgoingMessage: WhatsAppMessage = {
      id: messageId || `phone-lookup-${Date.now()}`,
      chat_id: chatId,
      chat_name: groupConfig?.name || (chatId.endsWith('@g.us') ? 'Unknown Group' : 'DM'),
      sender_name: 'Logan (Bot)',
      sender_number: process.env.BOT_PHONE_NUMBER || null,
      message_type: 'text',
      body: response,
      timestamp: Math.floor(Date.now() / 1000),
      from_me: true,
      is_group: chatId.endsWith('@g.us'),
      is_content: true
    };
    await saveMessage(outgoingMessage);
  } catch (e) {
    console.log(`[PhoneLookup] Error logging outgoing message:`, e);
  }
}

/**
 * Detect if the message body represents an export query.
 * Returns the matched phone number or null if not a query.
 */
export function detectExportQuery(body: string): string | null {
  if (!body) return null;
  
  const trimmed = body.trim();
  
  const prefixes = [
    /^\/export\s+(.+)$/i,
    /^\/تصدير\s+(.+)$/,
    /^تصدير\s+رقم\s+(.+)$/i,
    /^تصدير\s+محادثات\s+(.+)$/i,
    /^تصدير\s+(.+)$/i
  ];
  
  for (const prefix of prefixes) {
    const match = trimmed.match(prefix);
    if (match && match[1]) {
      const cleaned = match[1].replace(/[\s\-()\[\]]/g, '');
      if (/^\+?\d{9,15}$/.test(cleaned)) {
        return cleaned;
      }
    }
  }
  
  return null;
}

/**
 * Main entry handler for executing the forensic export
 */
export async function handleForensicExport(
  sock: WASocket,
  chatId: string,
  messageBody: string,
  messageKey: proto.IMessageKey,
  senderNumber: string
): Promise<boolean> {
  const cleanedText = cleanQueryText(messageBody);
  const queryNumber = detectExportQuery(cleanedText);
  if (!queryNumber) {
    return false;
  }

  const normalizedNumber = normalizePhoneNumber(queryNumber);
  console.log(`[ForensicExport] Intercepted export request for: ${queryNumber} (normalized: ${normalizedNumber})`);

  // React with ⏳ to indicate progress
  try {
    await sock.sendMessage(chatId, { react: { text: '⏳', key: messageKey } });
  } catch (e) {
    console.log(`[ForensicExport] React failed (non-fatal):`, e);
  }

  // Trigger typing indicator
  try {
    await sock.sendPresenceUpdate('composing', chatId);
  } catch (e) {}

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }

    // 1. Fetch target messages
    const { data: targetMessages, error: msgError } = await supabase
      .from('whatsapp_messages')
      .select('chat_id, chat_name, body, timestamp, is_group, sender_name')
      .eq('sender_number', normalizedNumber)
      .order('timestamp', { ascending: false })
      .limit(300);

    if (msgError) {
      throw msgError;
    }

    if (!targetMessages || targetMessages.length === 0) {
      // Send a polite message saying no records exist for this number
      const responseText = `⚠️ *لم نجد أي سجلات أو محادثات مرصودة للرقم +${normalizedNumber}* في قاعدة البيانات حالياً.\n\n` +
        `تأكد من أن الرقم قد تفاعل سابقاً في المجموعات المشتركة التي يراقبها البوت.`;
      
      const formatted = markdownToWhatsApp(responseText);
      let recipientJid = chatId;
      if (chatId.endsWith('@lid') && senderNumber) {
        recipientJid = `${senderNumber}@s.whatsapp.net`;
      }
      
      await sock.sendMessage(recipientJid, { text: formatted });
      try {
        await sock.sendMessage(chatId, { react: { text: '❌', key: messageKey } });
      } catch (e) {}
      return true;
    }

    // Determine mutual groups and active DMs
    const uniqueGroups = new Map<string, string>();
    const uniqueDms = new Set<string>();

    targetMessages.forEach(m => {
      if (m.is_group) {
        uniqueGroups.set(m.chat_id, m.chat_name || 'Unknown Group');
      } else {
        uniqueDms.add(m.chat_id);
      }
    });

    const mutualGroupsCount = uniqueGroups.size;
    const activeChatIds = Array.from(new Set(targetMessages.map(m => m.chat_id))).slice(0, 5);

    // Fetch conversation streams for top active chats
    const chatConversations = [];
    for (const cid of activeChatIds) {
      const isGrp = cid.endsWith('@g.us');
      const chatName = uniqueGroups.get(cid) || (isGrp ? 'Unknown Group' : 'DM');
      
      const { data: chatMessages, error: chatError } = await supabase
        .from('whatsapp_messages')
        .select('sender_number, sender_name, body, timestamp, from_me')
        .eq('chat_id', cid)
        .not('body', 'is', null)
        .order('timestamp', { ascending: false })
        .limit(50);
      
      if (chatMessages && chatMessages.length > 0) {
        const chronMessages = chatMessages.reverse().map(m => {
          let role = 'interactor';
          if (m.sender_number === normalizedNumber) {
            role = 'target';
          } else if (m.from_me) {
            role = 'bot';
          }
          return {
            sender_name: m.sender_name || 'Unknown',
            sender_number: m.sender_number || 'Unknown',
            body: m.body,
            timestamp: new Date(m.timestamp * 1000).toISOString(),
            role
          };
        });

        chatConversations.push({
          chat_id: cid,
          chat_name: chatName,
          is_group: isGrp,
          messages: chronMessages
        });
      }
    }

    // Extract active friends/interactors
    const friendCounts: Record<string, { name: string; count: number; chats: Set<string> }> = {};
    for (const chat of chatConversations) {
      for (const msg of chat.messages) {
        if (msg.sender_number !== normalizedNumber && msg.sender_number !== 'bot' && msg.sender_number !== 'Unknown' && msg.role !== 'bot') {
          if (!friendCounts[msg.sender_number]) {
            friendCounts[msg.sender_number] = {
              name: msg.sender_name || 'Unknown',
              count: 0,
              chats: new Set()
            };
          }
          friendCounts[msg.sender_number].count++;
          friendCounts[msg.sender_number].chats.add(chat.chat_name);
        }
      }
    }

    const friendsList = Object.entries(friendCounts)
      .map(([num, data]) => ({
        phone: `+${num}`,
        name: data.name,
        shared_chats: Array.from(data.chats),
        interaction_score: data.count
      }))
      .sort((a, b) => b.interaction_score - a.interaction_score)
      .slice(0, 15);

    // Get most active group name
    const groupCounts: Record<string, number> = {};
    targetMessages.forEach(m => {
      if (m.is_group && m.chat_name) {
        groupCounts[m.chat_name] = (groupCounts[m.chat_name] || 0) + 1;
      }
    });
    const topActiveGroup = Object.entries(groupCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'لا يوجد';

    // Compile JSON payload
    const exportPayload = {
      target: {
        phone: `+${normalizedNumber}`,
        normalized: normalizedNumber,
        name: targetMessages[0]?.sender_name || 'غير معروف'
      },
      extraction_metadata: {
        generated_at: new Date().toISOString(),
        total_mutual_groups_found: mutualGroupsCount,
        total_logged_messages: targetMessages.length,
        total_interactors_found: friendsList.length,
        top_active_group: topActiveGroup
      },
      groups: Array.from(uniqueGroups.entries()).map(([cid, name]) => ({
        chat_id: cid,
        chat_name: name
      })),
      friends: friendsList,
      chats: chatConversations
    };

    // Send the JSON as a document
    const jsonBuffer = Buffer.from(JSON.stringify(exportPayload, null, 2), 'utf-8');
    const timeString = new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo', hour12: true });

    const captionText = `📊 *التقرير الجنائي المتكامل للتحليل والتصدير* 📊\n\n` +
      `👤 *المستهدف:* +${normalizedNumber} (${exportPayload.target.name})\n` +
      `📅 *تاريخ التصدير:* ${timeString}\n` +
      `🗂️ *الملف المرفق:* \`whatsapp_forensic_export_${normalizedNumber}.json\`\n\n` +
      `*🔍 ملخص التحليل الاستخباراتي:*\n` +
      `• *عدد المجموعات المرصود فيها:* ${mutualGroupsCount} 👥\n` +
      `• *إجمالي الرسائل المرصودة للمستهدف:* ${targetMessages.length} 💬\n` +
      `• *عدد الأصدقاء المتفاعلين المرصودين:* ${friendsList.length} 👤\n` +
      `• *أكثر المجموعات نشاطاً:* ${topActiveGroup}\n\n` +
      `*👥 قائمة أبرز الأصدقاء المتفاعلين:* \n` +
      (friendsList.length > 0 
        ? friendsList.slice(0, 5).map((f, i) => `  ${i+1}. *${f.name}* (${f.phone}) - تفاعل: ${f.interaction_score} رسالة`).join('\n')
        : `  • لا يوجد تفاعل مسجل مع مستخدمين آخرين بالدردشة.`) + `\n\n` +
      `💬 يحتوي ملف الـ *JSON* المرفق على السجل الكامل للمجموعات والدردشات مع جدول زمني دقيق للمحادثات لقراءتها بالتفصيل.`;

    const formattedCaption = markdownToWhatsApp(captionText);

    let recipientJid = chatId;
    if (chatId.endsWith('@lid') && senderNumber) {
      recipientJid = `${senderNumber}@s.whatsapp.net`;
    }

    await sock.sendMessage(recipientJid, {
      document: jsonBuffer,
      fileName: `whatsapp_forensic_export_${normalizedNumber}.json`,
      mimetype: 'application/json',
      caption: formattedCaption
    });

    // React with ✅ to show success
    try {
      await sock.sendMessage(chatId, { react: { text: '✅', key: messageKey } });
    } catch (e) {}

    // Log this action
    await logOutgoingMessage(chatId, `[Forensic Export Sent for +${normalizedNumber}]`, messageKey.id || undefined);

    return true;
  } catch (error) {
    console.error(`[ForensicExport] Error generating export for ${normalizedNumber}:`, error);

    // Send a polite error message
    const errorText = `❌ عذراً، واجهت خطأ أثناء تصدير المحادثات الجنائية للرقم. يرجى المحاولة مرة أخرى لاحقاً.`;
    const formatted = markdownToWhatsApp(errorText);
    
    let recipientJid = chatId;
    if (chatId.endsWith('@lid') && senderNumber) {
      recipientJid = `${senderNumber}@s.whatsapp.net`;
    }
    
    await sock.sendMessage(recipientJid, { text: formatted });

    // React with ❌ to show failure
    try {
      await sock.sendMessage(chatId, { react: { text: '❌', key: messageKey } });
    } catch (e) {}

    return true;
  } finally {
    // Clear typing indicator
    try {
      await sock.sendPresenceUpdate('paused', chatId);
    } catch (e) {}
  }
}

/**
 * Detect if the message body represents a graph network query.
 * Returns the matched phone number or null if not a query.
 */
export function detectGraphQuery(body: string): string | null {
  if (!body) return null;
  
  const trimmed = body.trim();
  
  const prefixes = [
    /^\/graph\s+(.+)$/i,
    /^\/مخطط\s+(.+)$/,
    /^مخطط\s+علاقات\s+(.+)$/i,
    /^مخطط\s+العلاقات\s+(.+)$/i,
    /^رسم\s+شبكة\s+(.+)$/i,
    /^شبكة\s+علاقات\s+(.+)$/i
  ];
  
  for (const prefix of prefixes) {
    const match = trimmed.match(prefix);
    if (match && match[1]) {
      const cleaned = match[1].replace(/[\s\-()\[\]]/g, '');
      if (/^\+?\d{9,15}$/.test(cleaned)) {
        return cleaned;
      }
    }
  }
  
  return null;
}

/**
 * Main entry handler for executing the relationship mapping
 */
export async function handleForensicGraph(
  sock: WASocket,
  chatId: string,
  messageBody: string,
  messageKey: proto.IMessageKey,
  senderNumber: string
): Promise<boolean> {
  const cleanedText = cleanQueryText(messageBody);
  const queryNumber = detectGraphQuery(cleanedText);
  if (!queryNumber) {
    return false;
  }

  const normalizedNumber = normalizePhoneNumber(queryNumber);
  console.log(`[ForensicGraph] Intercepted graph request for: ${queryNumber} (normalized: ${normalizedNumber})`);

  // React with ⏳ to indicate progress
  try {
    await sock.sendMessage(chatId, { react: { text: '⏳', key: messageKey } });
  } catch (e) {
    console.log(`[ForensicGraph] React failed (non-fatal):`, e);
  }

  // Trigger typing indicator
  try {
    await sock.sendPresenceUpdate('composing', chatId);
  } catch (e) {}

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }

    // 1. Fetch target messages
    const { data: targetMessages, error: msgError } = await supabase
      .from('whatsapp_messages')
      .select('chat_id, chat_name, body, timestamp, is_group, sender_name')
      .eq('sender_number', normalizedNumber)
      .order('timestamp', { ascending: false })
      .limit(300);

    if (msgError) {
      throw msgError;
    }

    if (!targetMessages || targetMessages.length === 0) {
      // Send a polite message saying no records exist for this number
      const responseText = `⚠️ *لم نجد أي سجلات أو محادثات مرصودة للرقم +${normalizedNumber}* في قاعدة البيانات حالياً لإنشاء مخطط شبكي.\n\n` +
        `تأكد من أن الرقم قد تفاعل سابقاً في المجموعات المشتركة التي يراقبها البوت.`;
      
      const formatted = markdownToWhatsApp(responseText);
      let recipientJid = chatId;
      if (chatId.endsWith('@lid') && senderNumber) {
        recipientJid = `${senderNumber}@s.whatsapp.net`;
      }
      
      await sock.sendMessage(recipientJid, { text: formatted });
      try {
        await sock.sendMessage(chatId, { react: { text: '❌', key: messageKey } });
      } catch (e) {}
      return true;
    }

    // Determine mutual groups
    const uniqueGroups = new Map<string, string>();
    targetMessages.forEach(m => {
      if (m.is_group) {
        uniqueGroups.set(m.chat_id, m.chat_name || 'Unknown Group');
      }
    });

    const activeChatIds = Array.from(new Set(targetMessages.map(m => m.chat_id))).slice(0, 5);

    // Fetch conversation streams for top active chats
    const chatConversations = [];
    for (const cid of activeChatIds) {
      const isGrp = cid.endsWith('@g.us');
      const chatName = uniqueGroups.get(cid) || (isGrp ? 'Unknown Group' : 'DM');
      
      const { data: chatMessages, error: chatError } = await supabase
        .from('whatsapp_messages')
        .select('sender_number, sender_name, body, timestamp, from_me')
        .eq('chat_id', cid)
        .not('body', 'is', null)
        .order('timestamp', { ascending: false })
        .limit(50);
      
      if (chatMessages && chatMessages.length > 0) {
        const chronMessages = chatMessages.reverse().map(m => {
          let role = 'interactor';
          if (m.sender_number === normalizedNumber) {
            role = 'target';
          } else if (m.from_me) {
            role = 'bot';
          }
          return {
            sender_name: m.sender_name || 'Unknown',
            sender_number: m.sender_number || 'Unknown',
            body: m.body,
            timestamp: new Date(m.timestamp * 1000).toISOString(),
            role
          };
        });

        chatConversations.push({
          chat_id: cid,
          chat_name: chatName,
          is_group: isGrp,
          messages: chronMessages
        });
      }
    }

    // Extract active friends/interactors
    const friendCounts: Record<string, { name: string; count: number; chats: Set<string> }> = {};
    for (const chat of chatConversations) {
      for (const msg of chat.messages) {
        if (msg.sender_number !== normalizedNumber && msg.sender_number !== 'bot' && msg.sender_number !== 'Unknown' && msg.role !== 'bot') {
          if (!friendCounts[msg.sender_number]) {
            friendCounts[msg.sender_number] = {
              name: msg.sender_name || 'Unknown',
              count: 0,
              chats: new Set()
            };
          }
          friendCounts[msg.sender_number].count++;
          friendCounts[msg.sender_number].chats.add(chat.chat_name);
        }
      }
    }

    const friendsList = Object.entries(friendCounts)
      .map(([num, data]) => ({
        phone: `+${num}`,
        name: data.name,
        shared_chats: Array.from(data.chats),
        interaction_score: data.count
      }))
      .sort((a, b) => b.interaction_score - a.interaction_score)
      .slice(0, 8); // Top 8 friends for clean circle

    // Generate stunning SVG
    const targetName = targetMessages[0]?.sender_name || 'Target';
    const totalMessages = targetMessages.length;
    const timeString = new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo', hour12: true });

    let svgLines = '';
    let svgNodes = '';
    const centerX = 400;
    const centerY = 300;
    const radius = 180;
    const totalFriends = friendsList.length;

    // Draw grid circle indicators
    let gridCircles = `<circle cx="${centerX}" cy="${centerY}" r="90" fill="none" stroke="#1e293b" stroke-width="1" stroke-dasharray="4" opacity="0.4"/>
    <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="#1e293b" stroke-width="1" stroke-dasharray="4" opacity="0.4"/>`;

    friendsList.forEach((friend, index) => {
      const theta = (2 * Math.PI * index) / totalFriends;
      const fx = Math.round(centerX + radius * Math.cos(theta));
      const fy = Math.round(centerY + radius * Math.sin(theta));

      // Calculate connection strength indicators
      const maxScore = Math.max(...friendsList.map(f => f.interaction_score), 1);
      const intensity = friend.interaction_score / maxScore;
      const lineWidth = Math.max(Math.round(intensity * 10), 2);
      const lineOpacity = Math.max(intensity, 0.4);

      // Cyber glowing lines linking target to friends
      svgLines += `
      <!-- Connection to ${friend.name} -->
      <line x1="${centerX}" y1="${centerY}" x2="${fx}" y2="${fy}" stroke="#0ea5e9" stroke-width="${lineWidth}" opacity="${lineOpacity}" filter="url(#glow)"/>
      <line x1="${centerX}" y1="${centerY}" x2="${fx}" y2="${fy}" stroke="#38bdf8" stroke-width="1" opacity="0.9"/>
      `;

      // Draw friend orbiting nodes
      svgNodes += `
      <!-- Friend Node: ${friend.name} -->
      <g transform="translate(${fx}, ${fy})">
        <circle cx="0" cy="0" r="32" fill="#09090b" stroke="#06b6d4" stroke-width="2" filter="url(#glow)"/>
        <circle cx="0" cy="0" r="28" fill="#18181b" stroke="#14b8a6" stroke-width="1"/>
        <text x="0" y="-4" fill="#f8fafc" font-family="Segoe UI, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">${friend.name.substring(0, 10)}</text>
        <text x="0" y="12" fill="#0ea5e9" font-family="Segoe UI, sans-serif" font-size="9" text-anchor="middle">${friend.phone}</text>
        <text x="0" y="22" fill="#14b8a6" font-family="Segoe UI, sans-serif" font-size="8" font-weight="bold" text-anchor="middle">وزن: ${friend.interaction_score}</text>
      </g>
      `;
    });

    // Main Target Node (Center)
    const targetNode = `
    <!-- Center Target Node -->
    <g transform="translate(${centerX}, ${centerY})">
      <circle cx="0" cy="0" r="48" fill="#0369a1" stroke="#38bdf8" stroke-width="3" filter="url(#glow-strong)"/>
      <circle cx="0" cy="0" r="42" fill="#0284c7" stroke="#0ea5e9" stroke-width="1" stroke-dasharray="2"/>
      <text x="0" y="-8" fill="#ffffff" font-family="Segoe UI, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">${targetName}</text>
      <text x="0" y="10" fill="#93c5fd" font-family="Segoe UI, sans-serif" font-size="10" text-anchor="middle">+${normalizedNumber}</text>
      <text x="0" y="24" fill="#38bdf8" font-family="Segoe UI, sans-serif" font-size="8" font-weight="bold" text-anchor="middle">الهدف (TARGET)</text>
    </g>
    `;

    // SVG Header, statistics, and watermark
    const svgHeader = `
    <!-- Header -->
    <text x="40" y="60" fill="#ffffff" font-family="Segoe UI, sans-serif" font-size="22" font-weight="bold" filter="url(#glow)">MAPPED RELATIONSHIP NETWORK</text>
    <text x="40" y="85" fill="#38bdf8" font-family="Segoe UI, sans-serif" font-size="12" font-weight="bold">مخطط شبكة العلاقات الاستخباراتية الثنائية</text>
    <line x1="40" y1="100" x2="760" y2="100" stroke="#1e293b" stroke-width="1"/>
    
    <!-- Info Panel Left -->
    <rect x="40" y="470" width="220" height="90" rx="6" fill="#09090b" stroke="#1e293b" stroke-width="1" opacity="0.8"/>
    <text x="55" y="492" fill="#94a3b8" font-family="Segoe UI, sans-serif" font-size="10">إجمالي الرسائل المرصودة:</text>
    <text x="240" y="492" fill="#06b6d4" font-family="Segoe UI, sans-serif" font-size="11" font-weight="bold" text-anchor="end">${totalMessages} رسالة</text>
    <text x="55" y="515" fill="#94a3b8" font-family="Segoe UI, sans-serif" font-size="10">المجموعات المرصودة:</text>
    <text x="240" y="515" fill="#06b6d4" font-family="Segoe UI, sans-serif" font-size="11" font-weight="bold" text-anchor="end">${uniqueGroups.size} مجموعة</text>
    <text x="55" y="538" fill="#94a3b8" font-family="Segoe UI, sans-serif" font-size="10">تاريخ توليد المخطط:</text>
    <text x="240" y="538" fill="#38bdf8" font-family="Segoe UI, sans-serif" font-size="9" text-anchor="end">${timeString.split(' ')[0]}</text>

    <!-- Logo / Watermark Right -->
    <rect x="580" y="510" width="180" height="50" rx="25" fill="#09090b" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3"/>
    <text x="670" y="533" fill="#ffffff" font-family="Segoe UI, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">MEDO AI • SUPER HERO</text>
    <circle cx="605" cy="535" r="8" fill="#38bdf8" filter="url(#glow)"/>
    <circle cx="605" cy="535" r="4" fill="#ffffff"/>
    `;

    // Combine all to SVG
    const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <!-- Glow Filters -->
      <defs>
        <radialGradient id="bg-grad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#070a13" />
          <stop offset="100%" stop-color="#020408" />
        </radialGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="glow-strong" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <!-- Premium radial background -->
      <rect width="800" height="600" fill="url(#bg-grad)" />
      
      <!-- Tech grid lines -->
      <g stroke="#1e293b" stroke-width="0.5" opacity="0.2">
        <line x1="0" y1="150" x2="800" y2="150"/>
        <line x1="0" y1="300" x2="800" y2="300"/>
        <line x1="0" y1="450" x2="800" y2="450"/>
        <line x1="200" y1="0" x2="200" y2="600"/>
        <line x1="400" y1="0" x2="400" y2="600"/>
        <line x1="600" y1="0" x2="600" y2="600"/>
      </g>
      
      ${gridCircles}
      ${svgLines}
      ${svgNodes}
      ${targetNode}
      ${svgHeader}
    </svg>
    `;

    // 3. Compile ASCII Mind-Map
    let asciiMap = ``;
    if (friendsList.length > 0) {
      asciiMap += `     [ المجموعات المشتركة: ${uniqueGroups.size} ]\n`;
      asciiMap += `                 │\n`;
      friendsList.slice(0, 3).forEach((f, idx) => {
        asciiMap += `        ${idx === 0 ? '┌' : idx === 1 ? '├' : '└'}── 👤 *${f.name}* (${f.phone}) ── وزن: ${f.interaction_score}\n`;
      });
      asciiMap += `                 │\n`;
      asciiMap += `        🎯 *${targetName}* (${normalizedNumber})\n`;
      asciiMap += `                 │\n`;
      if (friendsList.length > 3) {
        friendsList.slice(3, 6).forEach((f, idx) => {
          asciiMap += `        ${idx === 0 ? '┌' : idx === 1 ? '├' : '└'}── 👤 *${f.name}* (${f.phone}) ── وزن: ${f.interaction_score}\n`;
        });
      }
    } else {
      asciiMap += `        🎯 *المستهدف:* +${normalizedNumber}\n`;
      asciiMap += `        (لا توجد شبكة أصدقاء متفاعلة مرصودة حالياً)`;
    }

    // Beautiful Caption Report
    const captionText = `🎯 *خريطة شبكة العلاقات الاستخباراتية المتكاملة* 🎯\n\n` +
      `👤 *المستهدف:* +${normalizedNumber} (${targetName})\n` +
      `📅 *تاريخ التحليل:* ${timeString}\n` +
      `🗂️ *الملف المرفق:* مخطط علاقات فكتوريا عالي الدقة (\`forensic_graph_${normalizedNumber}.svg\`)\n\n` +
      `*📊 الهيكل التفاعلي الشجري (ASCII Mind Map):*\n\`\`\`\n${asciiMap}\n\`\`\`\n\n` +
      `*🔍 كشف وتحليل الارتباط الشبكي:*\n` +
      `• *أقوى تفاعل مرصود:* ${friendsList[0] ? `*${friendsList[0].name}* (${friendsList[0].phone})` : 'غير متوفر'}\n` +
      `• *عدد روابط الأصدقاء النشطة:* ${friendsList.length} روابط متصلة 👥\n` +
      `• *إجمالي البصمات النصية:* ${totalMessages} رسالة مرصودة بالخلفية 💬\n\n` +
      `💡 افتح ملف الـ *SVG* المرفق لعرض وتصفح مخطط العلاقات الشبكية المتكامل بتصميم نيون تفاعلي عالي الدقة!`;

    const formattedCaption = markdownToWhatsApp(captionText);

    let recipientJid = chatId;
    if (chatId.endsWith('@lid') && senderNumber) {
      recipientJid = `${senderNumber}@s.whatsapp.net`;
    }

    // Send the SVG file as a document
    const svgBuffer = Buffer.from(svgContent.trim(), 'utf-8');

    await sock.sendMessage(recipientJid, {
      document: svgBuffer,
      fileName: `forensic_graph_${normalizedNumber}.svg`,
      mimetype: 'image/svg+xml',
      caption: formattedCaption
    });

    // React with ✅ to show success
    try {
      await sock.sendMessage(chatId, { react: { text: '✅', key: messageKey } });
    } catch (e) {}

    // Log outgoing message
    await logOutgoingMessage(chatId, `[Forensic Graph Sent for +${normalizedNumber}]`, messageKey.id || undefined);

    return true;
  } catch (error) {
    console.error(`[ForensicGraph] Error generating graph for ${normalizedNumber}:`, error);

    // Send a polite error message
    const errorText = `❌ عذراً، واجهت خطأ أثناء إنشاء وتصميم خريطة العلاقات للرقم. يرجى المحاولة مرة أخرى لاحقاً.`;
    const formatted = markdownToWhatsApp(errorText);
    
    let recipientJid = chatId;
    if (chatId.endsWith('@lid') && senderNumber) {
      recipientJid = `${senderNumber}@s.whatsapp.net`;
    }
    
    await sock.sendMessage(recipientJid, { text: formatted });

    // React with ❌ to show failure
    try {
      await sock.sendMessage(chatId, { react: { text: '❌', key: messageKey } });
    } catch (e) {}

    return true;
  } finally {
    // Clear typing indicator
    try {
      await sock.sendPresenceUpdate('paused', chatId);
    } catch (e) {}
  }
}

