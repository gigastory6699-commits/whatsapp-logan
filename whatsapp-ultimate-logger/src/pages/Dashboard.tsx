import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Trash2, 
  ShieldAlert, 
  Terminal, 
  Send, 
  EyeOff, 
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { mockDeletedMessagesList } from '../data/mockData';

export const Dashboard: React.FC = () => {
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[SYSTEM] تهيئة وحدة التشفير AES-256 بنجاح.',
    '[SYSTEM] محرك السيلينيوم نشط وجاهز للربط.',
    '[TELEGRAM] البوت متصل وخادم الأوامر نشط.'
  ]);

  useEffect(() => {
    const logs = [
      '[MONITOR] اتصال جديد قادم من الجلسة 201012345678.',
      '[INTERCEPT] رسالة واردة من أحمد سعيد - تصنيف المشاعر: محايد.',
      '[DELETED_MSG] تم رصد حذف رسالة من الرقم 201598765432! تم الحفظ في المعزل.',
      '[FORENSIC] فك تشفير بصمة صوتية بنجاح عبر محرك Whisper.',
      '[SECURITY] حظر محاولة تسجيل دخول مشبوهة للجلسة الثالثة.'
    ];

    const interval = setInterval(() => {
      const randomLog = logs[Math.floor(Math.random() * logs.length)];
      const time = new Date().toLocaleTimeString('ar-EG', { hour12: false });
      setTerminalLogs(prev => [`[${time}] ${randomLog}`, ...prev.slice(0, 15)]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 h-full">
      {/* Welcome header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white font-tajawal">لوحة القيادة والمراقبة الحية</h2>
          <p className="text-zinc-400 text-sm font-tajawal mt-1">مركز العمليات الجنائية والتوثيق الموحد</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-emerald-400 text-xs font-bold font-tajawal">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          خادم المراقبة نشط: 184 يوم بدون انقطاع
        </div>
      </div>

      {/* Top metrics stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-6 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-tajawal">إجمالي الرسائل المرصودة</span>
            <h3 className="text-3xl font-extrabold text-white text-neon-glow font-sans mt-1">12,492</h3>
            <span className="text-[10px] text-emerald-400 font-sans flex items-center gap-0.5 mt-2">
              <ArrowUpRight className="w-3 h-3" /> +12.4% اليوم
            </span>
          </div>
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-tajawal">الرسائل المحذوفة المعترضة</span>
            <h3 className="text-3xl font-extrabold text-rose-400 text-rose-glow font-sans mt-1">184</h3>
            <span className="text-[10px] text-rose-400 font-sans flex items-center gap-0.5 mt-2">
              <ArrowUpRight className="w-3 h-3" /> +3 رسائل جديدة
            </span>
          </div>
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400">
            <Trash2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-tajawal">التهديدات المكتشفة (AI)</span>
            <h3 className="text-3xl font-extrabold text-amber-400 text-shadow-glow font-sans mt-1">8</h3>
            <span className="text-[10px] text-amber-400 font-tajawal flex items-center gap-0.5 mt-2">
              ⚠️ تتطلب فحصاً جنائياً فورياً
            </span>
          </div>
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-tajawal">قنوات المزامنة النشطة</span>
            <h3 className="text-3xl font-extrabold text-emerald-400 text-teal-glow font-sans mt-1">2/3</h3>
            <span className="text-[10px] text-zinc-500 font-tajawal flex items-center gap-0.5 mt-2">
              متصل بالجلسة الموزعة
            </span>
          </div>
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
            <Send className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main double column layout */}
      <div className="grid grid-cols-3 gap-8">
        
        {/* Left Interactive Terminal */}
        <div className="col-span-2 glass-panel rounded-2xl border border-white/5 flex flex-col h-[400px]">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/30 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold font-tajawal">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>طرفية مراقبة البيانات الحية - Real-time Subprocess Logs</span>
            </div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto font-mono text-xs text-emerald-400/90 space-y-2 bg-black/40 text-left" style={{ direction: 'ltr' }}>
            {terminalLogs.map((log, index) => (
              <div key={index} className="transition-all duration-300 animate-pulse-slow">
                <span className="text-indigo-400 font-bold">&gt;&gt;</span> {log}
              </div>
            ))}
          </div>
        </div>

        {/* Right Operations Panel */}
        <div className="glass-panel rounded-2xl border border-white/5 p-6 flex flex-col justify-between h-[400px]">
          <div>
            <h3 className="text-sm font-bold text-white font-tajawal border-b border-white/5 pb-3">إجراءات التحكم السريع</h3>
            
            <div className="mt-4 space-y-3">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                <div className="text-right">
                  <h4 className="text-xs font-bold text-white font-tajawal">وضع التخفي المطلق</h4>
                  <p className="text-[10px] text-zinc-500 font-tajawal">إخفاء الصحين ومؤشرات الكتابة</p>
                </div>
                <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
                  <EyeOff className="w-4 h-4" />
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                <div className="text-right">
                  <h4 className="text-xs font-bold text-white font-tajawal">قفل قاعدة البيانات</h4>
                  <p className="text-[10px] text-zinc-500 font-tajawal">تشفير AES-256 فوري للمحاضر</p>
                </div>
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <Lock className="w-4 h-4" />
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                <div className="text-right">
                  <h4 className="text-xs font-bold text-white font-tajawal">المزامنة مع تيليجرام</h4>
                  <p className="text-[10px] text-zinc-500 font-tajawal">إرسال مرايا البيانات فورياً</p>
                </div>
                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
                  <Send className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-xl text-center">
            <span className="text-[10px] font-sans font-bold text-indigo-400 block tracking-widest uppercase">Encryption Status</span>
            <span className="text-xs font-bold text-white font-tajawal mt-1 block">🔐 قاعدة البيانات مشفرة عسكرياً 256-bit</span>
          </div>
        </div>

      </div>

      {/* Bottom recent intercepted items */}
      <div className="glass-card rounded-2xl p-6 border border-white/5">
        <h3 className="text-sm font-bold text-white font-tajawal mb-4 border-b border-white/5 pb-3">آخر الرسائل المحذوفة التي تم اعتراضها وحمايتها</h3>
        <div className="space-y-3">
          {mockDeletedMessagesList.map((msg, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 rounded-xl transition-colors">
              <span className="text-[10px] text-zinc-500 font-sans">{msg.timestamp}</span>
              <div className="text-right flex items-center gap-3">
                <div>
                  <h4 className="text-xs font-bold text-white font-tajawal">{msg.sender} <span className="text-[10px] text-zinc-400 font-sans">({msg.senderPhone})</span></h4>
                  <p className="text-xs text-rose-400 font-tajawal mt-1 font-semibold">{msg.text}</p>
                </div>
                <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-lg">
                  <Trash2 className="w-4 h-4 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};
