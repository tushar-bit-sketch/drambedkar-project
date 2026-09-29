import React from 'react';
import { Wrench, ShieldAlert } from 'lucide-react';

interface KioskMaintenanceOverlayProps {
  message?: string;
  terminalName?: string;
  institution?: string;
}

export const KioskMaintenanceOverlay: React.FC<KioskMaintenanceOverlayProps> = ({
  message = 'This terminal is undergoing scheduled institutional maintenance or catalog synchronization.',
  terminalName = 'Terminal Node #01',
  institution = 'Dr. Ambedkar National Memorial Archive',
}) => {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="Terminal Under Maintenance"
      className="fixed inset-0 z-[200] bg-[#0A1120] text-white flex flex-col items-center justify-center p-8 select-none"
    >
      <div className="max-w-xl w-full text-center space-y-6">
        <div className="mx-auto w-24 h-24 rounded-3xl bg-amber-500/20 border-2 border-amber-500/60 flex items-center justify-center shadow-2xl">
          <Wrench className="w-12 h-12 text-amber-400 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-amber-400 font-mono text-sm uppercase tracking-wider font-bold">
            <ShieldAlert className="w-4 h-4" />
            <span>Scheduled Institutional Maintenance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-wide">
            Station Temporarily Unavailable
          </h1>
        </div>

        <p className="text-slate-300 text-lg leading-relaxed max-w-lg mx-auto">
          {message}
        </p>

        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 text-sm space-y-1">
          <div>Please explore adjacent kiosk terminals or access the digital archive via your mobile device.</div>
          <div className="font-mono text-xs text-heritage-400 pt-2 border-t border-white/10 mt-2">
            {terminalName} • {institution}
          </div>
        </div>
      </div>
    </div>
  );
};
