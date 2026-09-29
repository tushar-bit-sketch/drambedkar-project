import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export interface SectionHeaderProps {
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  linkTo?: string;
  linkLabel?: string;
  badge?: string;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  headline,
  subheadline,
  linkTo,
  linkLabel = 'Examine Full Ledger',
  badge,
  className = ''
}) => {
  return (
    <div className={`border-b-2 border-double border-ink pb-3 mb-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1">
          {eyebrow && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-oxblood uppercase tracking-widest font-bold">
                [ {eyebrow} ]
              </span>
              {badge && (
                <span className="px-1.5 py-0.2 bg-newsprint-300 text-ink border border-ink/40 text-[9px] font-mono font-bold uppercase">
                  {badge}
                </span>
              )}
            </div>
          )}
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-ink uppercase tracking-tight">
            {headline}
          </h2>
          {subheadline && (
            <p className="font-editorial text-xs sm:text-sm text-ink-700 italic">
              {subheadline}
            </p>
          )}
        </div>

        {linkTo && (
          <Link
            to={linkTo}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-ink hover:text-oxblood uppercase tracking-wider transition self-start sm:self-end border-b border-ink hover:border-oxblood pb-0.5"
          >
            <span>{linkLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};
