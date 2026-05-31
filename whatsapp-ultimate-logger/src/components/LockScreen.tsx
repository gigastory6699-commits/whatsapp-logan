import React, { useState } from 'react';
import { Shield, Fingerprint, Delete, AlertCircle } from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const correctPin = '1234';

  const handleKeyPress = (num: string) => {
    if (error) setError(false);
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      
      // If 4 digits entered, verify automatically
      if (nextPin === correctPin) {
        setTimeout(() => {
          onUnlock();
        }, 300);
      } else if (nextPin.length === 4) {
        // Wrong PIN
        setTimeout(() => {
          setError(true);
          setPin('');
        }, 300);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-space-950 select-none overflow-hidden"
         style={{ background: 'radial-gradient(circle at 50% 50%, #0d0c1c 0%, #030305 100%)' }}>
      
      {/* Dynamic particles in background */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]"></div>

      {/* Lock screen glass panel container */}
      <div className="w-[420px] glass-panel border border-white/10 rounded-3xl p-8 flex flex-col items-center shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative">
        
        {/* Glowing top header */}
        <div className="p-4 bg-indigo-600/10 border border-indigo-500/25 rounded-2xl mb-4 shadow-[0_0_20px_rgba(99,102,241,0.15)] animate-pulse-slow">
          <Shield className="w-8 h-8 text-indigo-400" />
        </div>
        
        <h2 className="text-xl font-bold text-white text-neon-glow font-tajawal mb-1">منصة التوثيق والاستخبارات المشفرة</h2>
        <p className="text-[11px] text-zinc-400 font-sans tracking-widest uppercase mb-6">WhatsApp Ultimate Logger</p>

        {/* PIN Indicators */}
        <div className="flex gap-4 mb-8">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border transition-all duration-200 ${
                index < pin.length
                  ? 'bg-indigo-500 border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.8)] scale-110'
                  : 'bg-white/5 border-white/10'
              } ${error ? 'bg-rose-500 border-rose-400 animate-bounce' : ''}`}
            />
          ))}
        </div>

        {/* Error Indicator */}
        {error && (
          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold font-tajawal mb-4">
            <AlertCircle className="w-4 h-4" />
            <span>الرمز غير صحيح، يرجى إعادة المحاولة (التجريبي: 1234)</span>
          </div>
        )}

        {/* Keypad Grid */}
        <div className="grid grid-cols-3 gap-3 w-full mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="h-14 bg-white/5 border border-white/5 hover:bg-white/10 active:bg-indigo-500/20 active:border-indigo-500/30 rounded-2xl flex items-center justify-center text-lg font-bold font-sans text-white transition-all duration-150"
            >
              {num}
            </button>
          ))}
          
          {/* Biometrics button */}
          <button
            onClick={() => onUnlock()}
            className="h-14 bg-emerald-500/10 border border-emerald-500/10 hover:bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 transition-all duration-150"
            title="تخطي فوري بالبصمة البيومترية"
          >
            <Fingerprint className="w-6 h-6 animate-pulse" />
          </button>
          
          {/* Digit '0' */}
          <button
            onClick={() => handleKeyPress('0')}
            className="h-14 bg-white/5 border border-white/5 hover:bg-white/10 active:bg-indigo-500/20 active:border-indigo-500/30 rounded-2xl flex items-center justify-center text-lg font-bold font-sans text-white transition-all duration-150"
          >
            0
          </button>
          
          {/* Delete button */}
          <button
            onClick={handleDelete}
            className="h-14 bg-white/5 border border-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-zinc-400 transition-all duration-150"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Setup advice */}
        <p className="text-[10px] text-zinc-500 font-tajawal text-center mt-2">
          الرمز الافتراضي للوصول السريع: <code className="bg-white/5 px-1.5 py-0.5 rounded text-indigo-300">1234</code> أو اضغط أيقونة البصمة للمرور الفوري.
        </p>

      </div>
    </div>
  );
};
