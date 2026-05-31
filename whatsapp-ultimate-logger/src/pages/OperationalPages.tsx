import React, { useState } from 'react';
import { 
  Trash2, EyeOff, MapPin, Volume2, Play, Pause, Plus, ToggleLeft, ToggleRight,
  Trash, Search, FileText, Globe, FileDown, ScanEye
} from 'lucide-react';
import { 
  mockDeletedMessagesList, 
  mockCallLogs, 
  defaultAutoResponseRules, 
  mockChats
} from '../data/mockData';

// ----------------- 1. DELETED MESSAGES PANEL -----------------
export const DeletedMessagesPanel: React.FC = () => {
  const [list, setList] = useState(mockDeletedMessagesList);
  const [playBeep, setPlayBeep] = useState(false);

  const simulateNewDeletion = () => {
    setPlayBeep(true);
    setTimeout(() => setPlayBeep(false), 800);

    const randomMessages = [
      {
        id: `del_${Date.now()}`,
        sender: 'يوسف العتيبي',
        senderPhone: '966501234567',
        text: 'الملف السري موجود في مجلد الدونلود باسم report_final.docx',
        timestamp: 'الآن',
        isDeleted: true,
        sentiment: 'neutral' as const,
        isMe: false,
        type: 'text' as const
      },
      {
        id: `del_${Date.now()}`,
        sender: 'محمد الهواري',
        senderPhone: '201123456789',
        text: 'أسرعوا في إخفاء الهويات الرقمية، هناك تتبع نشط!',
        timestamp: 'الآن',
        isDeleted: true,
        sentiment: 'threat' as const,
        isMe: false,
        type: 'text' as const
      }
    ];
    const picked = randomMessages[Math.floor(Math.random() * randomMessages.length)];
    setList(prev => [picked, ...prev]);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white font-tajawal">مرصد اعتراض الرسائل المحذوفة</h2>
          <p className="text-zinc-400 text-sm font-tajawal mt-1">وحدة استخباراتية ترصد الرسائل وتوثقها فور حذفها للجميع</p>
        </div>
        <button 
          onClick={simulateNewDeletion}
          className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition-colors font-tajawal"
        >
          <Trash2 className="w-4 h-4" />
          <span>محاكاة حذف رسالة جديدة (تنبيه صوتي)</span>
        </button>
      </div>

      {playBeep && (
        <div className="p-4 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-bold font-tajawal">🚨 تنبيه صوتي: تم اعتراض عملية حذف رسالة نشطة الآن!</span>
          </div>
          <span className="text-xs bg-rose-600 px-2 py-0.5 rounded font-sans">BEEP BEEP</span>
        </div>
      )}

      <div className="space-y-4">
        {list.map((msg) => (
          <div key={msg.id} className="glass-card rounded-2xl p-6 border-r-4 border-rose-500 flex justify-between items-start">
            <div className="flex flex-col items-start gap-1">
              <span className="text-[10px] text-zinc-500 font-sans">{msg.timestamp}</span>
              <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-tajawal font-bold mt-2">INTERCEPTED</span>
            </div>
            <div className="text-right space-y-2">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-xs text-zinc-400 font-sans">({msg.senderPhone})</span>
                <h3 className="text-sm font-extrabold text-white font-tajawal">{msg.sender}</h3>
              </div>
              <p className="text-sm text-rose-400 font-semibold bg-rose-500/5 px-4 py-2.5 rounded-xl border border-rose-500/10 font-tajawal leading-relaxed">
                {msg.text}
              </p>
              <div className="flex items-center gap-2 justify-end text-[10px] text-zinc-500 font-tajawal">
                <span>تاريخ الاستلام الأصلي: اليوم 02:08 ص</span>
                <span>•</span>
                <span>نوع التشفير: AES-256</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ----------------- 2. STEALTH MODE PANEL -----------------
export const StealthModePanel: React.FC = () => {
  const [blueTicks, setBlueTicks] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [typingIndicator, setTypingIndicator] = useState(true);

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 h-full">
      <div>
        <h2 className="text-2xl font-black text-white font-tajawal">وضع الشبح والتخفي الكامل</h2>
        <p className="text-zinc-400 text-sm font-tajawal mt-1">تجميد الوجود الرقمي للبوت بشكل مطلق لمنع تعقبه</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className={`glass-panel p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-48 ${!blueTicks ? 'border-rose-500/40 bg-rose-500/5' : 'border-white/5'}`}>
          <div className="flex items-start justify-between">
            <EyeOff className={`w-8 h-8 ${!blueTicks ? 'text-rose-400 animate-pulse' : 'text-zinc-500'}`} />
            <button onClick={() => setBlueTicks(!blueTicks)}>
              {!blueTicks ? <ToggleRight className="w-12 h-8 text-rose-500" /> : <ToggleLeft className="w-12 h-8 text-zinc-600" />}
            </button>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-tajawal">إخفاء الصحين الزرقاء</h3>
            <p className="text-[10px] text-zinc-400 font-tajawal mt-1 leading-relaxed">منع إرسال تقارير قراءة الرسائل نهائياً للطرف الآخر.</p>
          </div>
        </div>

        <div className={`glass-panel p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-48 ${!onlineStatus ? 'border-rose-500/40 bg-rose-500/5' : 'border-white/5'}`}>
          <div className="flex items-start justify-between">
            <EyeOff className={`w-8 h-8 ${!onlineStatus ? 'text-rose-400 animate-pulse' : 'text-zinc-500'}`} />
            <button onClick={() => setOnlineStatus(!onlineStatus)}>
              {!onlineStatus ? <ToggleRight className="w-12 h-8 text-rose-500" /> : <ToggleLeft className="w-12 h-8 text-zinc-600" />}
            </button>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-tajawal">قتل مؤشر "متصل الآن"</h3>
            <p className="text-[10px] text-zinc-400 font-tajawal mt-1 leading-relaxed">البقاء بوضع غير متصل (Offline) بشكل دائم أثناء التسجيل.</p>
          </div>
        </div>

        <div className={`glass-panel p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-48 ${!typingIndicator ? 'border-rose-500/40 bg-rose-500/5' : 'border-white/5'}`}>
          <div className="flex items-start justify-between">
            <EyeOff className={`w-8 h-8 ${!typingIndicator ? 'text-rose-400 animate-pulse' : 'text-zinc-500'}`} />
            <button onClick={() => setTypingIndicator(!typingIndicator)}>
              {!typingIndicator ? <ToggleRight className="w-12 h-8 text-rose-500" /> : <ToggleLeft className="w-12 h-8 text-zinc-600" />}
            </button>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-tajawal">حظر مؤشر "جاري الكتابة..."</h3>
            <p className="text-[10px] text-zinc-400 font-tajawal mt-1 leading-relaxed">منع ظهور مؤشرات الطباعة أو تسجيل الصوت أثناء الرد التلقائي.</p>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-white/5">
        <h3 className="text-sm font-bold text-white font-tajawal mb-4 border-b border-white/5 pb-3">سجل عمليات الشبح التراكمية</h3>
        <div className="space-y-2 text-xs font-mono text-zinc-400">
          <div className="flex justify-between items-center py-1">
            <span className="text-[10px] text-zinc-600">02:14:12 ص</span>
            <span>[STEALTH] تم كتم مؤشر الصح الأزرق للرقم 201012345678 بنجاح.</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-[10px] text-zinc-600">02:08:50 ص</span>
            <span>[STEALTH] حظر مؤشر "جاري الكتابة..." للمجموعة "المراقبة الفنية 🛡️".</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-[10px] text-zinc-600">01:50:00 ص</span>
            <span>[STEALTH] تجميد حالة التواجد (Offline) للجلسة الثانية نشط.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------- 3. AI SENTIMENT PANEL -----------------
export const AISentimentPanel: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 h-full">
      <div>
        <h2 className="text-2xl font-black text-white font-tajawal">محلل المشاعر والكلمات الخطيرة (AI Sentiment)</h2>
        <p className="text-zinc-400 text-sm font-tajawal mt-1">تحليل فوري للنصوص بالاعتماد على أفضل نماذج اللغة العربية</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Heatmap overview */}
        <div className="col-span-2 glass-panel p-6 rounded-2xl border border-white/5">
          <h3 className="text-sm font-bold text-white font-tajawal mb-4">التوزيع النسبي للمشاعر الكلية للمحادثات اليوم</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-zinc-400 font-tajawal mb-1">
                <span>45%</span>
                <span>إيجابي / ودود (Positive)</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-zinc-400 font-tajawal mb-1">
                <span>30%</span>
                <span>محايد / عملي (Neutral)</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-zinc-400 font-tajawal mb-1">
                <span>15%</span>
                <span>سلبي / قلق (Negative)</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-zinc-400 font-tajawal mb-1">
                <span className="text-rose-400 font-bold">10%</span>
                <span className="text-rose-400 font-bold">تهديد / ابتزاز (Threat Alert)</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-600 h-full rounded-full animate-pulse" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Dangerous Keyword list */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <h3 className="text-sm font-bold text-white font-tajawal mb-4">مرصد الكلمات الخطيرة</h3>
          <div className="space-y-2">
            {['تهديد', 'تسريب', 'تزييف', 'ابتزاز', 'خروقات', 'سري للغاية'].map((word, i) => (
              <div key={i} className="flex justify-between items-center p-2 bg-rose-500/5 border border-rose-500/10 rounded-lg text-xs font-semibold font-tajawal text-rose-400">
                <span>رصد 2 مرات</span>
                <span>{word}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-white/5">
        <h3 className="text-sm font-bold text-white font-tajawal mb-4">آخر الرسائل المصنفة كـ "تهديد/خطر"</h3>
        <div className="space-y-3">
          <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-center justify-between">
            <span className="text-xs bg-rose-600/20 text-rose-400 border border-rose-600/30 px-2 py-0.5 rounded font-tajawal font-bold">THREAT SCORE: 94%</span>
            <div className="text-right">
              <span className="text-[10px] text-zinc-500">محمد الهواري • 01:50 ص</span>
              <p className="text-xs text-white font-tajawal mt-1">التهديد قادم غداً ويجب إخفاء كل الخوادم الرئيسية فوراً وإلا سيتم كشفنا.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------- 4. AUTO RESPONDER PANEL -----------------
export const AutoResponderPanel: React.FC = () => {
  const [rules, setRules] = useState(defaultAutoResponseRules);
  const [trigger, setTrigger] = useState('');
  const [reply, setReply] = useState('');
  const [delay, setDelay] = useState(3);

  const handleAddRule = () => {
    if (!trigger || !reply) return;
    const newRule = {
      id: `rule_${Date.now()}`,
      trigger,
      reply,
      delay,
      active: true
    };
    setRules(prev => [...prev, newRule]);
    setTrigger('');
    setReply('');
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 h-full">
      <div>
        <h2 className="text-2xl font-black text-white font-tajawal">مجيب الرد التلقائي الذكي</h2>
        <p className="text-zinc-400 text-sm font-tajawal mt-1">صياغة قواعد الاستجابة الفورية وتأخير البوت بذكاء بشري</p>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Rules creator */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-white font-tajawal mb-2">إضافة قاعدة رد تلقائي جديدة</h3>
          
          <div className="space-y-3">
            <div className="text-right">
              <label className="text-xs text-zinc-400 font-tajawal">كلمة الزناد المفتاحية (Trigger Word)</label>
              <input
                type="text"
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                placeholder="مثال: الأسعار، موقعكم، هاتف"
                className="w-full h-10 px-3 text-xs glass-input text-white text-right font-tajawal mt-1"
              />
            </div>

            <div className="text-right">
              <label className="text-xs text-zinc-400 font-tajawal">نص الرد التلقائي للعميل (Auto Reply Body)</label>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="اكتب رد البوت هنا..."
                rows={4}
                className="w-full p-3 text-xs glass-input text-white text-right font-tajawal mt-1 resize-none"
              />
            </div>

            <div className="text-right">
              <label className="text-xs text-zinc-400 font-tajawal flex justify-between">
                <span className="text-[10px] text-indigo-400">{delay} ثواني</span>
                <span>التأخير البشري العشوائي (Human Delay)</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
                className="w-full mt-2 accent-indigo-500"
              />
            </div>

            <button 
              onClick={handleAddRule}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors font-tajawal"
            >
              <Plus className="w-4 h-4" />
              <span>إدراج وتفعيل القاعدة</span>
            </button>
          </div>
        </div>

        {/* Active Rules list */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-white font-tajawal mb-2">قواعد الردود النشطة والمفعلة</h3>
          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleRule(rule.id)}>
                    {rule.active ? <ToggleRight className="w-10 h-6 text-emerald-500" /> : <ToggleLeft className="w-10 h-6 text-zinc-600" />}
                  </button>
                  <button 
                    onClick={() => deleteRule(rule.id)}
                    className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-sans">تأخير: {rule.delay}ث</span>
                    <h4 className="text-xs font-bold text-white font-tajawal">الزناد: "{rule.trigger}"</h4>
                  </div>
                  <p className="text-xs text-zinc-400 font-tajawal mt-1 leading-relaxed max-w-md">{rule.reply}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------- 5. GPS & MEDIA TRACKER PANEL -----------------
export const GPSTrackerPanel: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 h-full">
      <div>
        <h2 className="text-2xl font-black text-white font-tajawal">متتبع المواقع والوسائط (GPS & Media Gallery)</h2>
        <p className="text-zinc-400 text-sm font-tajawal mt-1">تحديد إحداثيات المشتركين على الخريطة وسحب ملفات الميديا تلقائياً</p>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* GPS Maps node */}
        <div className="col-span-2 glass-panel p-6 rounded-2xl border border-white/5 h-[360px] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-tajawal border-b border-white/5 pb-3 flex items-center justify-between">
              <span className="text-xs text-indigo-400 font-sans">GPS Node Coordinates</span>
              <span>خريطة الإحداثيات المستخلصة من الرسائل</span>
            </h3>
            
            {/* Mock Vector Map Graphic */}
            <div className="mt-4 bg-space-900 border border-white/5 rounded-xl h-48 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
              
              {/* Cairo GPS Node */}
              <div className="absolute top-1/2 left-1/3 flex flex-col items-center select-none animate-bounce">
                <MapPin className="w-6 h-6 text-red-500 text-shadow-glow" />
                <span className="text-[9px] bg-red-600/80 text-white border border-red-500/30 px-1.5 py-0.5 rounded font-tajawal font-bold mt-1 shadow-lg">القاهرة (نشط)</span>
              </div>

              {/* Riad GPS Node */}
              <div className="absolute top-1/3 left-2/3 flex flex-col items-center select-none animate-bounce" style={{ animationDelay: '0.5s' }}>
                <MapPin className="w-6 h-6 text-emerald-500 text-shadow-glow" />
                <span className="text-[9px] bg-emerald-600/80 text-white border border-emerald-500/30 px-1.5 py-0.5 rounded font-tajawal font-bold mt-1 shadow-lg">الرياض (مستقر)</span>
              </div>

              <span className="text-[10px] text-zinc-500 font-mono">MAP VIEWER SIMULATOR NODE V2</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-zinc-400 font-tajawal">
            <span>المرسل: يوسف العتيبي</span>
            <span>الموقع المستقر: 30.0444° N, 31.2357° E</span>
          </div>
        </div>

        {/* Media folders gallery */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 h-[360px] overflow-y-auto space-y-4">
          <h3 className="text-sm font-bold text-white font-tajawal mb-2 border-b border-white/5 pb-3">أحدث الوسائط المسحوبة</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative group rounded-xl overflow-hidden border border-white/10 h-24">
              <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=150&q=80" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-center font-tajawal py-0.5 text-zinc-300">مبنى فني.jpg</span>
            </div>
            <div className="relative group rounded-xl overflow-hidden border border-white/10 h-24">
              <img src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=150&q=80" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-center font-tajawal py-0.5 text-zinc-300">اجتماع.png</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------- 6. CALL LOGGER PANEL -----------------
export const CallLoggerPanel: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 h-full">
      <div>
        <h2 className="text-2xl font-black text-white font-tajawal">تسجيل وتوثيق المكالمات (Call Sentry)</h2>
        <p className="text-zinc-400 text-sm font-tajawal mt-1">توثيق المكالمات الهاتفية ومكالمات الفيديو بدون تسجيل المحتوى الصوتي لأسباب أمنية</p>
      </div>

      <div className="space-y-4">
        {mockCallLogs.map((log) => (
          <div key={log.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold font-sans px-2.5 py-1 rounded-lg border ${
                log.direction === 'incoming' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                log.direction === 'outgoing' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
              }`}>
                {log.direction.toUpperCase()}
              </span>
              <span className="text-xs text-zinc-500 font-sans">{log.duration}</span>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-[10px] text-zinc-500 font-sans">{log.time}</span>
                <h3 className="text-sm font-extrabold text-white font-tajawal">{log.name}</h3>
              </div>
              <p className="text-xs text-zinc-400 font-tajawal mt-1">نوع المكالمة: {log.type === 'audio' ? 'صوتية 📞' : 'مرئية 🎬'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ----------------- 7. VOICE NOTE TRANSCRIBER PANEL -----------------
export const TranscriberPanel: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 h-full">
      <div>
        <h2 className="text-2xl font-black text-white font-tajawal">مفرغ البصمات الصوتية (Voice Transcriber)</h2>
        <p className="text-zinc-400 text-sm font-tajawal mt-1">تفريغ تلقائي لجميع البصمات والمذكرات الصوتية الواردة عبر خادم Whisper</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-white/5">
        <h3 className="text-sm font-bold text-white font-tajawal mb-4">مشغل البصمة النشط والتفريغ الفوري</h3>

        <div className="p-5 bg-black/40 border border-white/5 rounded-2xl space-y-6">
          {/* Audio player with waveform mockup */}
          <div className="flex justify-between items-center gap-6">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all duration-200"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            {/* Waveform graphic */}
            <div className="flex-1 h-12 flex items-center justify-center gap-1.5 px-4 bg-white/5 border border-white/5 rounded-xl relative overflow-hidden">
              {[15, 30, 45, 20, 35, 50, 60, 40, 25, 12, 35, 55, 45, 20, 30, 40, 10, 20, 40, 50, 20, 30].map((h, i) => (
                <div 
                  key={i} 
                  className={`w-1 rounded bg-indigo-500/60 ${isPlaying ? 'waveform-bar' : ''}`}
                  style={{ 
                    height: `${h}%`,
                    animationDelay: `${i * 0.08}s`
                  }}
                />
              ))}
            </div>

            <span className="text-xs font-mono text-zinc-500">0:34</span>
          </div>

          {/* Transcript card */}
          <div className="text-right space-y-2">
            <span className="text-[10px] text-indigo-400 font-sans tracking-widest font-bold uppercase block">Transcription (Arabic Decoded)</span>
            <p className="text-sm text-white font-tajawal font-medium leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
              "يجب تعديل بنود العقد المالي قبل نهاية الأسبوع وإلا سنواجه مشكلة في التمويل."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------- 8. SECURITY PANEL -----------------
export const SecurityPanel: React.FC = () => {
  const [pinLock, setPinLock] = useState(true);
  const [autoLock, setAutoLock] = useState(5);

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 h-full">
      <div>
        <h2 className="text-2xl font-black text-white font-tajawal">نظام التشفير والأمن العسكري</h2>
        <p className="text-zinc-400 text-sm font-tajawal mt-1">تأمين قاعدة البيانات الملحقة وحاويات الجلسات المستقلة</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
          <h3 className="text-sm font-bold text-white font-tajawal border-b border-white/5 pb-3">إعدادات الخصوصية والحظر</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <button onClick={() => setPinLock(!pinLock)}>
                {pinLock ? <ToggleRight className="w-10 h-6 text-indigo-500" /> : <ToggleLeft className="w-10 h-6 text-zinc-600" />}
              </button>
              <div className="text-right">
                <h4 className="text-xs font-bold text-white font-tajawal">رمز قفل PIN</h4>
                <p className="text-[10px] text-zinc-500 font-tajawal mt-0.5">طلب الرمز السري عند الدخول للواجهة.</p>
              </div>
            </div>

            <div className="space-y-2 text-right">
              <label className="text-xs text-zinc-400 font-tajawal flex justify-between">
                <span className="text-indigo-400 font-sans">{autoLock} دقيقة</span>
                <span>القفل التلقائي للخمول (Auto Lock)</span>
              </label>
              <input
                type="range"
                min="1"
                max="15"
                value={autoLock}
                onChange={(e) => setAutoLock(Number(e.target.value))}
                className="w-full mt-2 accent-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-tajawal border-b border-white/5 pb-3">حاويات التخفير والبيانات AES-256</h3>
            <p className="text-xs text-zinc-400 font-tajawal mt-4 leading-relaxed">
              جميع ملفات السجلات، والبصمات الصوتية المسحوبة، وقواعد الرد التلقائي مشفرة بالكامل محلياً بمفتاح تشفير رئيسي مبني على معيار AES-256-GCM.
            </p>
          </div>
          <button className="w-full h-11 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors font-tajawal mt-6">
            <Trash className="w-4 h-4" />
            <span>التدمير الذاتي العاجل لكامل السجلات (Panic Destruction)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ----------------- 9. SESSION MANAGER PANEL -----------------
export const SessionManagerPanel: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white font-tajawal">مدير الجلسات الموزع (Multi-Session Manager)</h2>
          <p className="text-zinc-400 text-sm font-tajawal mt-1">تشغيل حسابات واتساب متعددة في جلسات متصفح معزولة في آن واحد</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition-colors font-tajawal">
          <Plus className="w-4 h-4" />
          <span>توصيل حساب واتساب جديد (QR Connect)</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-emerald-500/20 flex flex-col justify-between h-48 bg-emerald-500/5">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-sans font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded-md">CONNECTED</span>
            <div className="text-right">
              <h3 className="text-sm font-bold text-white font-tajawal">الجلسة الرئيسية (أحمد)</h3>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">201012345678</p>
            </div>
          </div>
          <div className="flex justify-between items-center text-xs text-zinc-500 font-tajawal">
            <span>معدل الرسائل: 1.2msg/sec</span>
            <span>المرصود اليوم: 842 رسالة</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border-white/5 flex flex-col justify-between h-48">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-sans font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 border border-amber-500/20 rounded-md">SCANNING QR</span>
            <div className="text-right">
              <h3 className="text-sm font-bold text-white font-tajawal">جلسة المتابعة الفرعية</h3>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">غير معرف</p>
            </div>
          </div>
          {/* Fake QR Scanner Indicator */}
          <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center text-xs font-bold text-amber-300 font-tajawal">
            📷 اضغط هنا لفتح شاشة مسح كود الـ QR
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------- 10. TELEGRAM CENTER PANEL -----------------
export const TelegramPanel: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 h-full">
      <div>
        <h2 className="text-2xl font-black text-white font-tajawal">مركز تحكم بوت تيليجرام (Telegram Mirror)</h2>
        <p className="text-zinc-400 text-sm font-tajawal mt-1">توجيه السجلات وتلقي أوامر التحكم بـ "WhatsApp Ultimate Logger" عن بعد</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white font-tajawal border-b border-white/5 pb-3">إعدادات ربط البوت الخاص بك</h3>
          <div className="space-y-3">
            <div className="text-right">
              <label className="text-xs text-zinc-400 font-tajawal">توكن البوت (Bot Token)</label>
              <input
                type="password"
                value="7489512354:AAEgsk_vpvZOZ4URTvzgqlc48xyW"
                disabled
                className="w-full h-10 px-3 text-xs glass-input text-white text-left font-sans mt-1 opacity-70"
              />
            </div>
            <div className="text-right">
              <label className="text-xs text-zinc-400 font-tajawal">معرف المشرف (Admin Chat ID)</label>
              <input
                type="text"
                value="511364175"
                disabled
                className="w-full h-10 px-3 text-xs glass-input text-white text-left font-sans mt-1 opacity-70"
              />
            </div>
          </div>
        </div>

        {/* Telegram command log simulator */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col h-[280px]">
          <h3 className="text-sm font-bold text-white font-tajawal border-b border-white/5 pb-3">سجل البوت الفوري الوارد</h3>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs text-cyan-400/90 bg-black/40 rounded-xl mt-4 text-left" style={{ direction: 'ltr' }}>
            <div><span className="text-indigo-400 font-bold">&gt;&gt;</span> [02:11:42 ص] CMD: /status received from admin.</div>
            <div><span className="text-emerald-400 font-bold">&lt;&lt;</span> [02:11:43 ص] RESP: "خادم التسجيل نشط: 12,492 رسالة مصنفة." sent.</div>
            <div><span className="text-indigo-400 font-bold">&gt;&gt;</span> [01:50:12 ص] CMD: /search "تهديد" received from admin.</div>
            <div><span className="text-emerald-400 font-bold">&lt;&lt;</span> [01:50:13 ص] RESP: "تم العثور على رسالة من محمد الهواري" sent.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------- 11. SCHEDULER PANEL -----------------
export const SchedulerPanel: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 h-full">
      <div>
        <h2 className="text-2xl font-black text-white font-tajawal">الجدولة الذكية للتوثيق والمراقبة</h2>
        <p className="text-zinc-400 text-sm font-tajawal mt-1">تحديد فترات التوثيق والأرشفة التلقائية على مدار الأسبوع</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-white/5">
        <h3 className="text-sm font-bold text-white font-tajawal mb-4">جدول المراقبة الأسبوعي الموزع</h3>
        {/* Simple mock scheduler timetable */}
        <div className="grid grid-cols-7 gap-3">
          {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map((day, idx) => (
            <div key={day} className="p-4 bg-white/5 border border-white/5 rounded-xl text-center space-y-3">
              <span className="text-xs font-bold text-zinc-300 font-tajawal">{day}</span>
              <div className={`p-2 rounded-lg text-[10px] font-tajawal font-bold text-center ${
                idx === 6 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {idx === 6 ? 'مغلق (خمول)' : 'مفعل (24 ساعة)'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ----------------- 12. FORENSIC DEEP SEARCH PANEL -----------------
export const DeepSearchPanel: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = () => {
    if (!query) {
      setResults([]);
      return;
    }
    // Search mockup
    const allMsgs = mockChats.flatMap(c => c.messages.map(m => ({ ...m, chatName: c.name })));
    const regex = new RegExp(query, 'i');
    const matched = allMsgs.filter(m => regex.test(m.text) || (m.sender && regex.test(m.sender)));
    setResults(matched);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 h-full">
      <div>
        <h2 className="text-2xl font-black text-white font-tajawal">البحث الجنائي المتقدم (Forensic deep search)</h2>
        <p className="text-zinc-400 text-sm font-tajawal mt-1">البحث بالمعايير المتقدمة Regex في كامل السجلات والبيانات المحفوظة</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSearch}
            className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shrink-0 font-tajawal"
          >
            <Search className="w-4 h-4" />
            <span>تنفيذ البحث الجنائي</span>
          </button>
          
          <div className="relative flex-1">
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="اكتب كلمة البحث أو تعبير نمطي (Regex)... مثال: [0-9]{4} أو تهديد"
              className="w-full h-11 pr-10 pl-4 text-xs glass-input text-white text-right font-tajawal"
            />
          </div>
        </div>

        {results.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 font-tajawal">تم العثور على {results.length} نتائج مطابقة:</h4>
            {results.map((res, i) => (
              <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center">
                <span className="text-[10px] text-zinc-500 font-sans">{res.timestamp}</span>
                <div className="text-right">
                  <h5 className="text-xs font-bold text-white font-tajawal">{res.sender} ({res.chatName})</h5>
                  <p className="text-xs text-zinc-300 font-tajawal mt-1">{res.text}</p>
                </div>
              </div>
            ))}
          </div>
        ) : query ? (
          <p className="text-xs text-rose-400 font-tajawal">لم يتم العثور على نتائج تطابق معايير البحث.</p>
        ) : (
          <p className="text-xs text-zinc-500 font-tajawal">أدخل الكلمات المفتاحية لبدء الفحص الجنائي الرقمي.</p>
        )}
      </div>
    </div>
  );
};

// ----------------- 13. LIVE ANALYTICS PANEL -----------------
export const AnalyticsPanel: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 h-full">
      <div>
        <h2 className="text-2xl font-black text-white font-tajawal">لوحات إحصائية تفاعلية (Live Analytics)</h2>
        <p className="text-zinc-400 text-sm font-tajawal mt-1">مخططات حجم الرسائل اليومي وتصنيف العلاقات التفاعلية للمشتركين</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <h3 className="text-sm font-bold text-white font-tajawal mb-4">حجم تدفق الرسائل اليومية بالساعة</h3>
          
          {/* Simple mock SVG Chart */}
          <div className="h-48 w-full flex items-end justify-between gap-2 pt-6">
            {[45, 60, 32, 75, 90, 42, 60, 85, 100, 30, 45, 60].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-indigo-500/40 border border-indigo-500/30 rounded-t-md hover:bg-indigo-500 transition-colors cursor-pointer"
                  style={{ height: `${h * 1.4}px` }}
                />
                <span className="text-[8px] text-zinc-500 font-sans">{i*2}h</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-tajawal mb-4">أكثر جهات الاتصال تفاعلاً ومراقبة</h3>
            
            <div className="space-y-3">
              {[
                { name: 'أحمد سعيد', count: '482 رسالة', progress: '85%' },
                { name: 'يوسف العتيبي', count: '312 رسالة', progress: '60%' },
                { name: 'محمد الهواري', count: '184 رسالة', progress: '40%' }
              ].map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-tajawal">
                    <span className="text-zinc-500">{c.count}</span>
                    <span className="text-white font-bold">{c.name}</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: c.progress }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------- 14. EXPORT PANEL -----------------
export const ExportPanel: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 h-full">
      <div>
        <h2 className="text-2xl font-black text-white font-tajawal">التصدير الجنائي والتقارير الاحترافية</h2>
        <p className="text-zinc-400 text-sm font-tajawal mt-1">توليد محاضر تفريغ كاملة ومستندات رسمية للمثول والتحليل القانوني</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-white/5 text-center space-y-4">
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl inline-block text-indigo-400">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-white font-tajawal">تصدير PDF تفاعلي</h3>
          <p className="text-[10px] text-zinc-500 font-tajawal leading-relaxed">توليد تقرير PDF يحاكي شكل شاشة واتساب مع إظهار الرسائل المحذوفة بلون مميز.</p>
          <button className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors font-tajawal">
            <FileDown className="w-4 h-4" />
            <span>تصدير تقرير PDF</span>
          </button>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-white/5 text-center space-y-4">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl inline-block text-emerald-400">
            <Globe className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-white font-tajawal">تصدير ويب تفاعلي (HTML)</h3>
          <p className="text-[10px] text-zinc-500 font-tajawal leading-relaxed">توليد ملف HTML مستقل يحتوي على قاعدة بيانات مدمجة للبحث والاستماع للبصمات الصوتية.</p>
          <button className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors font-tajawal">
            <FileDown className="w-4 h-4" />
            <span>تصدير تقرير HTML</span>
          </button>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-white/5 text-center space-y-4">
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl inline-block text-rose-400">
            <FileDown className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-white font-tajawal">تصدير قاعدة البيانات (JSON)</h3>
          <p className="text-[10px] text-zinc-500 font-tajawal leading-relaxed">تصدير المحتوى الجنائي كاملاً في ملف JSON منظم يحوي كافة البيانات الوصفية والتحليلات.</p>
          <button className="w-full h-10 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors font-tajawal">
            <FileDown className="w-4 h-4" />
            <span>تصدير ملف JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ----------------- 15. TRAY MODE PANEL -----------------
export const TrayModePanel: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 h-full">
      <div>
        <h2 className="text-2xl font-black text-white font-tajawal">وضع الكشك وإخفاء الواجهة (System Tray Mode)</h2>
        <p className="text-zinc-400 text-sm font-tajawal mt-1">تهيئة التشغيل الخفي للتطبيق كخدمة خلفية على نظام التشغيل</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 max-w-2xl">
        <h3 className="text-sm font-bold text-white font-tajawal border-b border-white/5 pb-3">تخصيص الاختصارات والرموز الخلفية</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <input
              type="text"
              value="CTRL + ALT + W"
              disabled
              className="h-10 px-3 text-xs glass-input text-indigo-400 text-center font-mono opacity-80"
            />
            <div className="text-right">
              <h4 className="text-xs font-bold text-white font-tajawal">مفتاح الوصول السريع الخفي (Hotkey)</h4>
              <p className="text-[10px] text-zinc-500 font-tajawal mt-0.5">الاختصار اللازم لإظهار واجهة التطبيق فوراً عند خفائه.</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button className="px-4 py-2 bg-rose-600/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-xl font-tajawal">
              تفعيل وضع الإخفاء الفوري
            </button>
            <div className="text-right">
              <h4 className="text-xs font-bold text-white font-tajawal">وضع التشغيل السري للغاية</h4>
              <p className="text-[10px] text-zinc-500 font-tajawal mt-0.5">إلغاء النافذة فوراً والتحول لأيقونة Tray صامتة.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================
// ==================== 🌟 SPECIAL CUSTOM TOOLS 🌟 =============
// =============================================================

// ----------------- CUSTOM 1: AI LIVE CHAT TRANSLATOR -----------------
export const TranslatorPanel: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 h-full">
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded">SPECIAL AI+</span>
          <h2 className="text-2xl font-black text-white font-tajawal">مترجم الرسائل الذكي الفوري (AI Translator)</h2>
        </div>
        <p className="text-zinc-400 text-sm font-tajawal mt-1">ترجمة ثنائية فورية وعرض الرسائل باللغتين العربية والإنجليزية في فقاعات متطابقة</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
        <h3 className="text-sm font-bold text-white font-tajawal border-b border-white/5 pb-3">محاكي المحادثة المترجمة للغات الأجنبية</h3>

        <div className="space-y-4 max-w-xl mx-auto bg-black/30 p-6 rounded-2xl border border-white/5">
          {/* Outgoing Translated bubble */}
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] text-zinc-500 font-sans">أحمد سعيد • 02:00 ص</span>
            <div className="p-3.5 bg-indigo-600 text-white rounded-2xl rounded-tr-none text-right text-xs font-tajawal max-w-sm space-y-1.5 shadow-lg">
              <p className="font-bold">السلام عليكم، هل اكتملت مراجعة الكود اليوم؟</p>
              <div className="h-[1px] bg-white/20"></div>
              <p className="text-indigo-200 font-medium font-sans text-[11px] italic" style={{ direction: 'ltr' }}>
                "Peace be upon you, has the code review been completed today?"
              </p>
            </div>
          </div>

          {/* Incoming Translated bubble */}
          <div className="flex flex-col items-start gap-1">
            <span className="text-[10px] text-zinc-500 font-sans">أنت • 02:05 ص</span>
            <div className="p-3.5 bg-white/5 text-white border border-white/10 rounded-2xl rounded-tl-none text-right text-xs font-tajawal max-w-sm space-y-1.5 shadow-lg">
              <p className="font-bold">نعم، قمنا بدمج جميع الإصلاحات على الفرع الرئيسي.</p>
              <div className="h-[1px] bg-white/10"></div>
              <p className="text-zinc-400 font-medium font-sans text-[11px] italic" style={{ direction: 'ltr' }}>
                "Yes, we merged all hotfixes into the master branch."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------- CUSTOM 2: DEEPFAKE SCANNER -----------------
export const DeepfakeScannerPanel: React.FC = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const startAnalysis = () => {
    setAnalyzing(true);
    setResult(null);
    setTimeout(() => {
      setAnalyzing(false);
      setResult({
        trustScore: 11, // low trust score
        isSpoofed: true,
        pitchFrequency: '135Hz (شبه ثابت)',
        spoofMethod: 'عبر نموذج التزييف الصوتي RVC (Realtime Voice Changer)',
        advice: '⚠️ لا تعتمد محتوى البصمة، تم محاكاة طبقات الصوت رقمياً!'
      });
    }, 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 h-full">
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded">SPECIAL AI+</span>
          <h2 className="text-2xl font-black text-white font-tajawal">كاشف التزييف الصوتي والصوري (Deepfake & Metadata Analyzer)</h2>
        </div>
        <p className="text-zinc-400 text-sm font-tajawal mt-1">فحص التوقيع الرقمي للبصمات الصوتية ومطابقة التعديلات الميتافيزيقية للصور المرفقة</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Voice scanning console */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-tajawal border-b border-white/5 pb-3">تحليل البصمة الصوتية لأحمد سعيد</h3>
            <p className="text-xs text-zinc-400 font-tajawal mt-4 leading-relaxed">
              تحليل البصمات الصوتية عبر مطابقة التوافقيات الترددية وخطوط الميتافيزياء لكشف التعديلات الصوتية الرقمية ونماذج الذكاء الاصطناعي (Voice Clones).
            </p>
          </div>
          
          <div className="mt-6 space-y-4">
            {analyzing ? (
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-center text-xs font-bold text-indigo-400 font-tajawal animate-pulse">
                ⏳ جاري تحليل طبقات الصوت وفحص المعايير الرقمية...
              </div>
            ) : result ? (
              <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl space-y-2 text-right">
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-rose-600 text-white px-2.5 py-0.5 rounded font-sans font-bold">MUTATED / AI SPREAD</span>
                  <h4 className="text-xs font-bold text-rose-400 font-tajawal">تنبيه: صوت مزيف رقمياً!</h4>
                </div>
                <p className="text-xs text-zinc-300 font-tajawal mt-2"><b>نسبة الأمان:</b> {result.trustScore}% (منخفضة للغاية)</p>
                <p className="text-xs text-zinc-300 font-tajawal"><b>النموذج المستخدم:</b> {result.spoofMethod}</p>
                <p className="text-xs text-rose-400 font-tajawal font-bold mt-2">{result.advice}</p>
              </div>
            ) : (
              <button 
                onClick={startAnalysis}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors font-tajawal"
              >
                <ScanEye className="w-4 h-4" />
                <span>بدء الفحص الجنائي للبصمة الصوتية</span>
              </button>
            )}
          </div>
        </div>

        {/* Metadata scan folder */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-tajawal border-b border-white/5 pb-3">فحص التعديلات وميتاداتا الصور (Image Metadata Scan)</h3>
            <p className="text-xs text-zinc-400 font-tajawal mt-4 leading-relaxed">
              تحليل بيكسلات الصور وقراءة سجل الـ EXIF المرفق لكشف ما إذا تم حفظ الصورة أو تعديلها ببرامج فوتوشوب أو دمج مائي خفي.
            </p>
          </div>
          
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl mt-6">
            <h4 className="text-xs font-bold text-emerald-400 font-tajawal text-right">آخر فحص للصور المستخرجة:</h4>
            <p className="text-[11px] text-zinc-300 font-tajawal mt-1 leading-relaxed text-right">
              الصورة: <code className="bg-white/5 px-1 py-0.5 rounded text-emerald-300">مبنى فني.jpg</code> تم الكشف عن إخفاء معلومات سرية بنسبة تطابق بيانات EXIF معدلة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------- CUSTOM 3: MEMBER BEHAVIOR PROFILER PANEL -----------------
export const MemberProfilerPanel: React.FC = () => {
  const groupChat = mockChats.find(c => c.isGroup);
  const members = groupChat?.membersRiskProfile || [];

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 h-full">
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded">SPECIAL AI+</span>
          <h2 className="text-2xl font-black text-white font-tajawal">محلل سلوك الأعضاء وتصنيف التهديدات (Risk Profiler)</h2>
        </div>
        <p className="text-zinc-400 text-sm font-tajawal mt-1">تحديد الهيكل السلوكي لأعضاء المجموعات النشطة، وتقييم مؤشر الخطر والأثر الاستخباري</p>
      </div>

      <div className="space-y-4">
        {members.map((member, i) => (
          <div key={i} className="glass-card rounded-2xl p-6 border border-white/5">
            <div className="flex justify-between items-start">
              
              {/* Risk & Influence Scores */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <span className="text-[10px] text-zinc-500 font-tajawal">مؤشر الخطر</span>
                  <div className={`text-xl font-extrabold font-sans mt-1 px-3 py-1 rounded-lg border ${
                    member.riskScore >= 75 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse' :
                    member.riskScore >= 40 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {member.riskScore}%
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-[10px] text-zinc-500 font-tajawal">قوة التأثير (Influence)</span>
                  <div className="text-xl font-extrabold font-sans mt-1 px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {member.influenceScore}%
                  </div>
                </div>

                <button className="h-10 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-4 rounded-xl text-xs font-bold font-tajawal transition-all duration-200">
                  حظر فوري ومقاطعة
                </button>
              </div>

              {/* Member stats */}
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-[9px] bg-white/5 text-zinc-400 border border-white/10 px-2 py-0.5 rounded font-sans uppercase">{member.role}</span>
                  <h3 className="text-sm font-extrabold text-white font-tajawal">{member.name}</h3>
                </div>
                <p className="text-xs text-zinc-400 font-sans mt-1">{member.phone}</p>
                
                <div className="grid grid-cols-2 gap-4 mt-4 text-xs font-tajawal text-zinc-400">
                  <div>
                    <b>ساعات النشاط:</b> {member.activeHours}
                  </div>
                  <div>
                    <b>متوسط سرعة الاستجابة:</b> {member.averageResponseTime}
                  </div>
                  <div>
                    <b>محاذاة المشاعر:</b> <span className={
                      member.sentimentAlignment === 'threat' ? 'text-rose-400 font-bold' :
                      member.sentimentAlignment === 'positive' ? 'text-emerald-400' :
                      'text-indigo-400'
                    }>{member.sentimentAlignment.toUpperCase()}</span>
                  </div>
                  <div>
                    <b>آخر تواجد:</b> {member.lastActive}
                  </div>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
