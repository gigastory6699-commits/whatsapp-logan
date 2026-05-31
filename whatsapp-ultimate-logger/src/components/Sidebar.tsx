import React from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  Network, 
  Trash2, 
  EyeOff, 
  Brain, 
  MessageSquare, 
  MapPin, 
  Phone, 
  Mic, 
  Search, 
  BarChart3, 
  FileDown, 
  Send, 
  Calendar, 
  FolderLock,
  Languages,
  ScanEye,
  Users2
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'لوحة القيادة', icon: LayoutDashboard, color: 'text-indigo-400' },
    { id: 'sessions', label: 'مدير الجلسات (Multi-Session)', icon: Network, color: 'text-emerald-400' },
    { id: 'deleted', label: 'مرصد الرسائل المحذوفة', icon: Trash2, color: 'text-rose-400', badge: '3' },
    { id: 'stealth', label: 'وضع الشبح الكامل (Stealth)', icon: EyeOff, color: 'text-slate-400' },
    { id: 'sentiment', label: 'تحليل المشاعر بالذكاء الاصطناعي', icon: Brain, color: 'text-purple-400' },
    { id: 'autoresponder', label: 'مجيب الرد التلقائي', icon: MessageSquare, color: 'text-amber-400' },
    { id: 'gps_media', label: 'متتبع المواقع والوسائط (GPS)', icon: MapPin, color: 'text-red-400' },
    { id: 'calls', label: 'تسجيل وتوثيق المكالمات', icon: Phone, color: 'text-blue-400' },
    { id: 'transcriber', label: 'تفريغ البصمات الصوتية', icon: Mic, color: 'text-teal-400' },
    { id: 'deepsearch', label: 'البحث الجنائي المتقدم (Forensic)', icon: Search, color: 'text-cyan-400' },
    { id: 'analytics', label: 'لوحة التحليلات الحية', icon: BarChart3, color: 'text-pink-400' },
    { id: 'export', label: 'تصدير التقارير الاحترافية', icon: FileDown, color: 'text-sky-400' },
    { id: 'telegram', label: 'مركز تحكم تيليجرام', icon: Send, color: 'text-cyan-500' },
    { id: 'scheduler', label: 'الجدولة الذكية للتوثيق', icon: Calendar, color: 'text-amber-500' },
    { id: 'traymode', label: 'وضع الكشك المخفي (Tray)', icon: FolderLock, color: 'text-zinc-400' },
    
    // Custom Extra Features added by the developer:
    { id: 'translator', label: 'مترجم الرسائل الذكي', icon: Languages, color: 'text-yellow-400', custom: true },
    { id: 'deepfake', label: 'كاشف التزييف الصوتي والصوري', icon: ScanEye, color: 'text-orange-400', custom: true },
    { id: 'memberprofiler', label: 'محلل سلوك الأعضاء والتهديدات', icon: Users2, color: 'text-red-500', custom: true }
  ];

  return (
    <aside className="w-80 h-full glass-panel flex flex-col border-l border-white/5 select-none relative z-10 shrink-0">
      {/* Brand header */}
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)] animate-pulse-slow">
          <Shield className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg text-white tracking-wide text-neon-glow font-tajawal">WhatsApp Ultimate</h1>
          <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-semibold font-sans">Logger & Intelligence</p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3 mb-2 font-sans">
          الوحدات التشغيلية الأساسية
        </div>
        {menuItems.filter(item => !item.custom).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group text-right ${
                isActive 
                  ? 'glass-panel-active text-white' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 duration-200 ${isActive ? 'text-indigo-400' : item.color}`} />
                <span className="text-sm font-medium font-tajawal">{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded-full animate-bounce">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-widest px-3 pt-6 mb-2 font-sans border-t border-white/5 mt-4">
          ميزات الأمان والاستخبارات الإضافية ✨
        </div>
        {menuItems.filter(item => item.custom).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group text-right ${
                isActive 
                  ? 'glass-panel-active text-white border-yellow-500/30' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 duration-200 ${isActive ? 'text-yellow-400 animate-pulse' : item.color}`} />
                <span className="text-sm font-semibold font-tajawal">{item.label}</span>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-md uppercase">
                AI +
              </span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar footer status */}
      <div className="p-4 border-t border-white/5 bg-black/20 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-semibold text-zinc-300 font-tajawal">حالة النظام الحي</span>
          </div>
          <span className="text-[10px] font-sans text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded-md">CONNECTED</span>
        </div>
        <p className="text-[10px] text-zinc-500 text-center font-sans">v3.4.0-Forensic Build</p>
      </div>
    </aside>
  );
};
