import React from 'react';
import { 
  Search, 
  Eye, 
  EyeOff, 
  Lock, 
  Activity, 
  Signal,
  Server
} from 'lucide-react';

interface TopbarProps {
  stealthActive: boolean;
  setStealthActive: (val: boolean) => void;
  triggerLock: () => void;
  sessionsCount: number;
}

export const Topbar: React.FC<TopbarProps> = ({
  stealthActive,
  setStealthActive,
  triggerLock,
  sessionsCount
}) => {
  return (
    <header className="h-20 w-full glass-panel border-b border-white/5 flex items-center justify-between px-8 select-none relative z-10 shrink-0">
      
      {/* Search Input and status */}
      <div className="flex items-center gap-6">
        <div className="relative w-80">
          <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="البحث الجنائي في كامل الأرشيف والمحادثات..."
            className="w-full h-10 pr-10 pl-4 text-xs glass-input text-white text-right font-tajawal"
          />
        </div>

        {/* Global connection stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg">
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-300 font-tajawal">{sessionsCount} جلسات نشطة</span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg animate-pulse-slow">
            <Signal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-300 font-tajawal">معدل البث 512Kbps</span>
          </div>
        </div>
      </div>

      {/* Title & Actions */}
      <div className="flex items-center gap-4">
        {/* Active Indicators */}
        <div className="flex items-center gap-2 text-right">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-400 font-tajawal">حالة البث للمحرك الرئيسي</span>
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-xs font-bold text-white font-tajawal">تسجيل حي ونشط</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
          </div>
          <Activity className="w-8 h-8 text-emerald-500/30 p-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl" />
        </div>

        <div className="h-8 w-[1px] bg-white/5 mx-2"></div>

        {/* Operational buttons */}
        <div className="flex items-center gap-2">
          {/* Stealth Mode Button */}
          <button
            onClick={() => setStealthActive(!stealthActive)}
            className={`h-10 px-4 rounded-xl border flex items-center gap-2 transition-all duration-300 ${
              stealthActive 
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.15)]' 
                : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {stealthActive ? (
              <>
                <EyeOff className="w-4 h-4 animate-bounce" />
                <span className="text-xs font-bold font-tajawal">وضع الشبح: نشط 🔒</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span className="text-xs font-bold font-tajawal">تفعيل الشبح الكلي</span>
              </>
            )}
          </button>

          {/* PIN Lock Button */}
          <button
            onClick={triggerLock}
            className="h-10 w-10 bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl flex items-center justify-center transition-all duration-200"
            title="قفل لوحة التحكم فوراً"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>
      
    </header>
  );
};
