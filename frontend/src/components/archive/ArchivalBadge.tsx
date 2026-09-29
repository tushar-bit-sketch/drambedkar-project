import React from 'react';
import { DocumentType, VerificationStatus } from '../../types';

interface ArchivalBadgeProps {
  type?: DocumentType | string;
  status?: VerificationStatus | string;
  variant?: 'type' | 'status' | 'demo' | 'integrity';
  className?: string;
}

export const ArchivalBadge: React.FC<ArchivalBadgeProps> = ({
  type,
  status,
  variant = 'type',
  className = ''
}) => {
  if (variant === 'demo') {
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-none text-[9px] font-mono uppercase tracking-widest bg-newsprint-200 text-oxblood border border-oxblood font-bold ${className}`}>
        ARCHIVAL SPECIMEN
      </span>
    );
  }

  if (variant === 'integrity') {
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-none text-[9px] font-mono uppercase tracking-wider bg-verified-bg text-verified-text border border-verified-border font-bold ${className}`}>
        <span>SHA-256 ✓</span>
      </span>
    );
  }

  if (variant === 'status' && status) {
    let colorClass = 'bg-newsprint-100 text-ink border-ink/40';
    if (status === 'VERIFIED') {
      colorClass = 'bg-verified-bg text-verified-text border-verified-border font-bold';
    } else if (status === 'PENDING_OCR' || status === 'PENDING') {
      colorClass = 'bg-fallback-bg text-fallback-text border-fallback-border font-bold';
    } else if (status === 'IN_REVIEW') {
      colorClass = 'bg-newsprint-200 text-oxblood border-oxblood font-bold';
    } else if (status === 'DRAFT') {
      colorClass = 'bg-newsprint-100 text-ink-600 border-ink/30';
    }

    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-none text-[10px] font-mono uppercase tracking-wider border ${colorClass} ${className}`}>
        [{status.replace('_', ' ')}]
      </span>
    );
  }

  // Type badge in rubber-stamp broadsheet format
  let typeLabel = String(type || 'DOCUMENT').toUpperCase();
  if (typeLabel === 'BOOK') typeLabel = 'MONOGRAPH';
  else if (typeLabel === 'DEBATE') typeLabel = 'CAD DEBATE';
  else if (typeLabel === 'SPEECH') typeLabel = 'HISTORICAL ADDRESS';
  else if (typeLabel === 'MANUSCRIPT') typeLabel = 'FOLIO MANUSCRIPT';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-none text-[10px] font-mono uppercase tracking-wider border border-ink/40 bg-newsprint-100 text-ink font-bold shadow-letterpress-sm ${className}`}>
      {typeLabel}
    </span>
  );
};
