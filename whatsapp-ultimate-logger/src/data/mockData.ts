export interface Message {
  id: string;
  sender: string;
  senderPhone: string;
  text: string;
  timestamp: string;
  isDeleted: boolean;
  sentiment: 'positive' | 'negative' | 'threat' | 'neutral' | 'grief';
  isMe: boolean;
  type: 'text' | 'image' | 'voice' | 'location' | 'call';
  mediaUrl?: string;
  duration?: string;
  location?: { lat: number; lng: number; label: string };
  originalText?: string;
  translatedText?: string;
  voiceAnalysis?: {
    isSpoofed: boolean;
    spoofConfidence: number;
    pitchRange: string;
    transcription: string;
  };
  imageAnalysis?: {
    isModified: boolean;
    modifiedConfidence: number;
    description: string;
  };
}

export interface DeviceInfo {
  model: string;
  type: 'phone' | 'desktop' | 'tablet';
  os: string;
  ip: string;
  location: string;
  lastActive: string;
}

export interface Chat {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  isGroup: boolean;
  unreadCount: number;
  lastMessageTime: string;
  messages: Message[];
  membersRiskProfile?: GroupMemberProfile[];
  devices?: DeviceInfo[]; // Device intelligence tracker
}

export interface GroupMemberProfile {
  name: string;
  phone: string;
  role: 'admin' | 'member';
  activeHours: string;
  averageResponseTime: string;
  sentimentAlignment: 'positive' | 'negative' | 'neutral' | 'threat';
  riskScore: number;
  influenceScore: number;
  lastActive: string;
}

export interface CallLog {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  type: 'audio' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  time: string;
  duration: string;
}

export interface AutoResponseRule {
  id: string;
  trigger: string;
  reply: string;
  delay: number;
  mediaName?: string;
  active: boolean;
}

// ----------------- MASSIVE FORENSIC DATABASE SEED -----------------

export const mockChats: Chat[] = [
  {
    id: 'chat_1',
    name: 'أحمد سعيد (مدير المشاريع)',
    phone: '201012345678',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    isGroup: false,
    unreadCount: 2,
    lastMessageTime: '02:15 ص',
    devices: [
      { model: 'iPhone 15 Pro Max', type: 'phone', os: 'iOS 17.4', ip: '197.34.12.85', location: 'القاهرة، مصر', lastActive: 'الآن' },
      { model: 'Chrome on Windows 11', type: 'desktop', os: 'Windows 11 Build 22631', ip: '197.34.12.86', location: 'القاهرة، مصر', lastActive: 'منذ دقيقة' }
    ],
    messages: [
      { id: 'm1', sender: 'أحمد سعيد', senderPhone: '201012345678', text: 'السلام عليكم، هل اكتملت مراجعة الكود اليوم؟', timestamp: '02:00 ص', isDeleted: false, sentiment: 'neutral', isMe: false, type: 'text', originalText: 'السلام عليكم، هل اكتملت مراجعة الكود اليوم؟', translatedText: 'Peace be upon you, has the code review been completed today?' },
      { id: 'm2', sender: 'أنت', senderPhone: '201000000000', text: 'أهلاً أحمد، نعم قمنا بدمج جميع الإصلاحات على الفرع الرئيسي.', timestamp: '02:05 ص', isDeleted: false, sentiment: 'positive', isMe: true, type: 'text' },
      { id: 'm3', sender: 'أحمد سعيد', senderPhone: '201012345678', text: 'تم حذف هذه الرسالة بواسطة المرسل.', timestamp: '02:10 ص', isDeleted: true, sentiment: 'negative', isMe: false, type: 'text' },
      { id: 'm4', sender: 'أحمد سعيد', senderPhone: '201012345678', text: 'أقصد هل أرسلت التقرير النهائي للعميل؟', timestamp: '02:11 ص', isDeleted: false, sentiment: 'neutral', isMe: false, type: 'text', originalText: 'أقصد هل أرسلت التقرير النهائي للعميل؟', translatedText: 'I mean, did you send the final report to the client?' },
      { id: 'm5', sender: 'أحمد سعيد', senderPhone: '201012345678', text: 'أرسلت لك بصمة صوتية توضح نقاط الخلاف مع الإدارة العامة.', timestamp: '02:14 ص', isDeleted: false, sentiment: 'negative', isMe: false, type: 'voice', duration: '0:34', voiceAnalysis: { isSpoofed: true, spoofConfidence: 89, pitchRange: '120Hz - 150Hz', transcription: 'يجب تعديل بنود العقد المالي قبل نهاية الأسبوع وإلا سنواجه مشكلة في التمويل.' } }
    ]
  },
  {
    id: 'chat_2',
    name: 'مجموعة المراقبة الفنية 🛡️',
    phone: 'group_monitoring_1',
    avatar: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=150&h=150&q=80',
    isGroup: true,
    unreadCount: 0,
    lastMessageTime: '01:50 ص',
    membersRiskProfile: [
      { name: 'يوسف العتيبي', phone: '966501234567', role: 'admin', activeHours: '10:00 ص - 04:00 م', averageResponseTime: '1.5 دقيقة', sentimentAlignment: 'positive', riskScore: 12, influenceScore: 94, lastActive: 'منذ دقيقتين' },
      { name: 'محمد الهواري', phone: '201123456789', role: 'member', activeHours: '08:00 م - 03:00 ص', averageResponseTime: '8 دقائق', sentimentAlignment: 'threat', riskScore: 84, influenceScore: 78, lastActive: 'الآن' },
      { name: 'سارة خالد', phone: '971501234567', role: 'member', activeHours: '09:00 ص - 05:00 م', averageResponseTime: '15 دقيقة', sentimentAlignment: 'neutral', riskScore: 24, influenceScore: 45, lastActive: 'منذ ساعة' },
      { name: 'خالد بن طلال', phone: '966509988776', role: 'member', activeHours: '11:00 م - 06:00 ص', averageResponseTime: '3 دقائق', sentimentAlignment: 'negative', riskScore: 56, influenceScore: 62, lastActive: 'منذ 10 دقائق' }
    ],
    messages: [
      { id: 'mg1', sender: 'يوسف العتيبي', senderPhone: '966501234567', text: 'يا شباب، تأكدوا من موقع مكتب الاتصالات الجديد.', timestamp: '01:40 ص', isDeleted: false, sentiment: 'neutral', isMe: false, type: 'text' },
      { id: 'mg2', sender: 'يوسف العتيبي', senderPhone: '966501234567', text: 'موقع الاحداثيات الفعلي للموقع البديل:', timestamp: '01:42 ص', isDeleted: false, sentiment: 'neutral', isMe: false, type: 'location', location: { lat: 30.0444, lng: 31.2357, label: 'مكتب الاتصالات الرئيسي - القاهرة' } },
      { id: 'mg3', sender: 'محمد الهواري', senderPhone: '201123456789', text: 'لقد التقطت صورة سرية للتصميم المسرب للمبنى الجديد.', timestamp: '01:45 ص', isDeleted: false, sentiment: 'threat', isMe: false, type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80', imageAnalysis: { isModified: true, modifiedConfidence: 96, description: 'تم التلاعب بالبيانات التعريفية (EXIF metadata) وتم دمج طبقة توقيع رقمي مخفي.' } },
      { id: 'mg4', sender: 'محمد الهواري', senderPhone: '201123456789', text: 'التهديد قادم غداً ويجب إخفاء كل الخوادم الرئيسية فوراً وإلا سيتم كشفنا.', timestamp: '01:50 ص', isDeleted: false, sentiment: 'threat', isMe: false, type: 'text', originalText: 'التهديد قادم غداً ويجب إخفاء كل الخوادم الرئيسية فوراً وإلا سيتم كشفنا.', translatedText: 'The threat is coming tomorrow, and all main servers must be hidden immediately, otherwise we will be exposed.' }
    ]
  },
  {
    id: 'chat_3',
    name: 'سارة خالد (مستشار قانوني)',
    phone: '971501234567',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    isGroup: false,
    unreadCount: 0,
    lastMessageTime: 'أمس 08:42 م',
    devices: [
      { model: 'Samsung Galaxy S24 Ultra', type: 'phone', os: 'Android 14', ip: '94.200.15.42', location: 'دبي، الإمارات', lastActive: 'أمس 08:45 م' }
    ],
    messages: [
      { id: 'ms1', sender: 'سارة خالد', senderPhone: '971501234567', text: 'لقد قمت بمراجعة بنود الاتفاقية الأمنية الموحدة.', timestamp: '08:30 م', isDeleted: false, sentiment: 'positive', isMe: false, type: 'text' },
      { id: 'ms2', sender: 'أنت', senderPhone: '201000000000', text: 'ممتاز سارة، هل هناك أي ثغرات قانونية تحتاج للتعديل؟', timestamp: '08:35 م', isDeleted: false, sentiment: 'neutral', isMe: true, type: 'text' },
      { id: 'ms3', sender: 'سارة خالد', senderPhone: '971501234567', text: 'أرسلت لك المسودة بالكامل في المرفق، يرجى مراجعتها بسرية.', timestamp: '08:42 م', isDeleted: false, sentiment: 'positive', isMe: false, type: 'text' }
    ]
  }
];

export const mockDeletedMessagesList: Message[] = [
  { id: 'del_1', sender: 'أحمد سعيد', senderPhone: '201012345678', text: 'لقد تم تسريب النسخة الاحتياطية من السيرفر المالي وموقعها هو المرفق.', timestamp: '02:10 ص', isDeleted: true, sentiment: 'threat', isMe: false, type: 'text' },
  { id: 'del_2', sender: 'كريم رأفت', senderPhone: '201598765432', text: 'الصورة التي أرسلتها سابقاً للعقد باطلة، لا تعتمدوها!', timestamp: '01:05 ص', isDeleted: true, sentiment: 'negative', isMe: false, type: 'text' },
  { id: 'del_3', sender: 'مجهول', senderPhone: '447123456789', text: 'رابط التحويل المالي المشفر: https://secure-crypto-node.onion/pay', timestamp: 'أمس 11:42 م', isDeleted: true, sentiment: 'threat', isMe: false, type: 'text' },
  { id: 'del_4', sender: 'محمد الهواري', senderPhone: '201123456789', text: 'الموقع البديل للمقابلة هو فندق الماسة بالقرب من العاصمة الإدارية.', timestamp: 'أمس 07:15 م', isDeleted: true, sentiment: 'neutral', isMe: false, type: 'text' },
  { id: 'del_5', sender: 'خالد بن طلال', senderPhone: '966509988776', text: 'تأكدوا من مسح كامل البيانات من الأجهزة اللوحية المصادرة.', timestamp: 'أمس 04:30 م', isDeleted: true, sentiment: 'threat', isMe: false, type: 'text' },
  { id: 'del_6', sender: 'رنا منصور', senderPhone: '971509988776', text: 'الملف المالي يحتوي على تناقضات جسيمة بمقدار 2 مليون درهم.', timestamp: '29 مايو 10:12 ص', isDeleted: true, sentiment: 'negative', isMe: false, type: 'text' },
  { id: 'del_7', sender: 'يوسف العتيبي', senderPhone: '966501234567', text: 'رابط الاتصال المشفر بالغرفة المغلقة: zoom.us/j/9988112233', timestamp: '28 مايو 09:20 م', isDeleted: true, sentiment: 'neutral', isMe: false, type: 'text' }
];

export const mockCallLogs: CallLog[] = [
  { id: 'c1', name: 'أحمد سعيد', phone: '201012345678', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80', type: 'audio', direction: 'incoming', time: '02:04 ص', duration: '5 د 23 ث' },
  { id: 'c2', name: 'يوسف العتيبي', phone: '966501234567', avatar: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=150&h=150&q=80', type: 'video', direction: 'outgoing', time: '12:12 ص', duration: '12 د 44 ث' },
  { id: 'c3', name: 'رنا منصور', phone: '971509988776', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80', type: 'audio', direction: 'missed', time: 'أمس 09:30 م', duration: 'لم يرد عليها' },
  { id: 'c4', name: 'محمد الهواري', phone: '201123456789', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80', type: 'audio', direction: 'incoming', time: 'أمس 05:14 م', duration: '1 د 12 ث' },
  { id: 'c5', name: 'سارة خالد', phone: '971501234567', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80', type: 'video', direction: 'incoming', time: 'أمس 11:20 ص', duration: '22 د 10 ث' },
  { id: 'c6', name: 'خالد بن طلال', phone: '966509988776', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80', type: 'audio', direction: 'outgoing', time: '29 مايو 03:40 م', duration: '8 د 15 ث' },
  { id: 'c7', name: 'كريم رأفت', phone: '201598765432', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80', type: 'audio', direction: 'missed', time: '28 مايو 01:10 م', duration: 'لم يرد عليها' }
];

export const defaultAutoResponseRules: AutoResponseRule[] = [
  { id: 'rule_1', trigger: 'التكلفة', reply: 'أهلاً بك! تكلفة الحزمة الأساسية تبدأ من 49$ شهرياً، تشمل الدعم الفني الكامل والتحديثات الدورية.', delay: 3, active: true },
  { id: 'rule_2', trigger: 'السعر', reply: 'تجد جميع أسعارنا التفصيلية للمنصات وخطط الاشتراك في ملف التعريف الخاص بموقعنا، أو تفضل بمراسلتنا لتزويدك بعرض سعر.', delay: 5, active: true },
  { id: 'rule_3', trigger: 'أين موقعكم', reply: 'مكتبنا الرئيسي يقع في حي الاتصالات، المبنى رقم 12، الطابق الرابع. يمكنك زيارتنا من 9 ص حتى 5 م.', delay: 2, active: false },
  { id: 'rule_4', trigger: 'الاشتراك', reply: 'لتفعيل الاشتراك الفوري، يرجى إرسال الاسم ورقم الهاتف والبريد الإلكتروني للقسم المالي لتوليد رابط الدفع الآمن.', delay: 4, active: true }
];
