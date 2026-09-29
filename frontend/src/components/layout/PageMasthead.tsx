import React, { ReactNode } from 'react';

export interface PageMastheadProps {
  eyebrow: string;
  headline: string;
  subheadline?: string;
  accession?: string;
  badge?: string;
  rightSlot?: ReactNode;
  bottomSlot?: ReactNode;
  className?: string;
}

export const PageMasthead: React.FC<PageMastheadProps> = ({
  eyebrow,
  headline,
  subheadline,
  accession,
  badge,
  rightSlot,
  bottomSlot,
  className = ''
}) => {
  return (
    <section className={`bg-[#FAF6EE] text-ink py-8 px-4 sm:px-6 lg:px-8 border-b-2 border-double border-ink ${className}`}>
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Top Eyebrow & Accession Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/15 pb-2 text-[11px] font-mono text-oxblood uppercase tracking-wider font-bold">
          <div className="flex items-center space-x-2">
            <span>[ {eyebrow} ]</span>
            {badge && (
              <span className="px-1.5 py-0.2 bg-newsprint-300 text-ink border border-ink/40 text-[9px] font-bold">
                {badge}
              </span>
            )}
          </div>
          {accession && (
            <span className="text-ink-600 font-bold tracking-widest text-[10px]">
              {accession}
            </span>
          )}
        </div>

        {/* Main Title & Action Slot */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-1">
          <div className="space-y-1.5 max-w-3xl">
            <h1 className="font-serif font-black text-3xl sm:text-4xl text-ink uppercase tracking-tight leading-tight">
              {headline}
            </h1>
            {subheadline && (
              <p className="font-editorial text-xs sm:text-sm text-ink-700 leading-relaxed italic">
                {subheadline}
              </p>
            )}
          </div>

          {rightSlot && (
            <div className="flex items-center gap-2 self-start md:self-center shrink-0">
              {rightSlot}
            </div>
          )}
        </div>

        {/* Optional Filter / Search Slot */}
        {bottomSlot && (
          <div className="pt-2">
            {bottomSlot}
          </div>
        )}
      </div>
    </section>
  );
};
