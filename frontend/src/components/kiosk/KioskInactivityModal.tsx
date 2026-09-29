import React from 'react';
import { Clock, RefreshCw, ArrowRight } from 'lucide-react';

interface KioskInactivityModalProps {
  countdownSeconds: number;
  onContinue: () => void;
  onResetNow: () => void;
}

export const KioskInactivityModal: React.FC<KioskInactivityModalProps> = ({
  countdownSeconds,
  onContinue,
  onResetNow,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Kiosk Inactivity Warning"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 select-none animate-fade-in"
      onClick={onContinue}
    >
      <div
        className="bg-[#0B1A2E] text-white border-2 border-heritage-500 rounded-3xl p-8 max-w-xl w-full text-center shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glowing countdown badge */}
        <div className="mx-auto w-24 h-24 rounded-full bg-heritage-500/20 border-4 border-heritage-500 flex items-center justify-center mb-6 shadow-inner animate-pulse">
          <span className="text-4xl font-black font-mono text-heritage-300">
            {countdownSeconds}
          </span>
        </div>

        <div className="flex items-center justify-center gap-2 text-heritage-400 text-sm uppercase tracking-wider font-bold mb-2">
          <Clock className="w-5 h-5" />
          <span>Interactive Session Expiring</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-3">
          Are you still exploring?
        </h2>

        <p className="text-slate-300 text-base mb-8 max-w-md mx-auto leading-relaxed">
          To protect visitor privacy, this terminal will automatically clear temporary searches and return to the exhibition welcome screen in{' '}
          <span className="font-bold text-heritage-300">{countdownSeconds} seconds</span>.
        </p>

        {/* Big Touch Targets */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onContinue}
            className="flex-1 py-4 px-6 rounded-2xl bg-heritage-500 hover:bg-heritage-400 text-slate-950 font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-95"
            autoFocus
          >
            <span>Continue Session</span>
            <ArrowRight className="w-6 h-6" />
          </button>

          <button
            onClick={onResetNow}
            className="py-4 px-6 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white font-semibold text-base border border-white/20 flex items-center justify-center gap-2 transition"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Reset Now</span>
          </button>
        </div>

        <div className="mt-6 text-xs text-slate-400">
          Institutional Archive Terminal • Ephemeral Visitor Privacy Protection
        </div>
      </div>
    </div>
  );
};
