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
