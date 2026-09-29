import React from 'react';
import { Info } from 'lucide-react';

interface DemoBannerProps {
  customMessage?: string;
  isDemoData?: boolean;
  isOffline?: boolean;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ customMessage }) => (
  <aside aria-label="Static catalogue notice" className="border-b border-ink/30 bg-[#EFE8DA] px-4 py-2 text-ink">
    <div className="mx-auto flex max-w-7xl items-start gap-2 font-mono text-[10px] sm:text-xs">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-oxblood" />
      <p>
        <strong className="font-bold uppercase text-oxblood">Static catalogue notice:</strong>{' '}
        {customMessage || 'Records are bundled metadata snapshots, not independently source-verified. This site has no backend and does not host archival files.'}
      </p>
    </div>
  </aside>
);
