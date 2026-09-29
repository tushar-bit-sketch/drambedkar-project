import React from 'react';
import { DocumentItem } from '../../types';

export interface DocumentCardProps {
  document?: DocumentItem;
  onSelect?: (document: DocumentItem) => void;
  viewMode?: 'grid' | 'list';
  accession?: string;
  date?: string;
  title?: string;
  source?: string;
  verified?: boolean;
  excerpt?: string;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onSelect,
  accession: propAccession,
  date: propDate,
  title: propTitle,
  source: propSource,
  verified: propVerified,
  excerpt: propExcerpt,
}) => {
  const accession = propAccession || document?.archive_id || document?.source_identifier || 'AMB-VOL-XI-1949-11-25';
  const date = propDate || document?.date_created || (document?.year ? String(document.year) : 'November 25, 1949');
  const title = propTitle || document?.title || 'Constitutional Debate Entry';
  const source = propSource || document?.source_name || document?.collection_title || 'Constituent Assembly Debates';
  const verified = propVerified ?? document?.verification_status === 'VERIFIED';
  const excerpt = propExcerpt || document?.description || (document?.ocr_text ? document.ocr_text.slice(0, 160) + '...' : undefined);

  const handleClick = () => {
    if (onSelect && document) {
      onSelect(document);
    }
  };

  return (
    <article className="bg-white border-1 border-ink/20 p-6 hover:border-ink/40 transition-colors flex flex-col justify-between">
      <div>
        {/* Accession Tag */}
        <div className="flex gap-2 items-center mb-4">
          <span className="accession-tag">ACCESSION</span>
          <span className="font-mono-meta text-ink/60">{accession}</span>
        </div>

        {/* Title */}
        <h3 
          onClick={handleClick}
          className={`text-xl lg:text-2xl font-bold text-ink mb-4 font-serif leading-snug ${onSelect ? 'cursor-pointer hover:text-oxblood-700 transition-colors' : ''}`}
        >
          {title}
        </h3>

        {/* Excerpt (optional) */}
        {excerpt && (
          <p className="text-base text-ink/70 font-serif mb-4 italic leading-relaxed line-clamp-3">
            "{excerpt}"
          </p>
        )}
      </div>

      <div>
        {/* Metadata Footer */}
        <div className="border-t-1 border-ink/10 pt-4 space-y-2">
          <div className="font-mono-meta">
            <span className="font-bold">Date:</span> {date}
          </div>
          <div className="font-mono-meta">
            <span className="font-bold">Source:</span> {source}
          </div>
          {verified && (
            <div className="font-mono-meta text-oxblood-700">
              <span className="font-bold">✓ Verified:</span> SHA-256 Checksum Validated
            </div>
          )}
        </div>

        {/* Action */}
        <button 
          type="button"
          onClick={handleClick}
          className="mt-4 text-oxblood-700 font-serif font-bold text-sm hover:underline flex items-center gap-1"
        >
          View Document →
        </button>
      </div>
    </article>
  );
};
