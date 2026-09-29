import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { apiService } from '../services/api';
import { DocumentItem } from '../types';
import { DemoBanner } from '../components/archive/DemoBanner';
import { PageMasthead } from '../components/layout/PageMasthead';

export const ManuscriptsPage: React.FC = () => {
  const [records, setRecords] = useState<DocumentItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiService.getDocuments({ document_type: 'MANUSCRIPT', page_size: 100 })
      .then((response) => setRecords(response.items))
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Catalogue records could not be loaded.'));
  }, []);

  return (
    <div className="min-h-screen bg-newsprint-100 text-ink">
      <DemoBanner />
      <PageMasthead
        eyebrow="MANUSCRIPT CATALOGUE METADATA"
        headline="Manuscript-Related Records"
        subheadline="Browse metadata for manuscript-related catalogue entries. This static deployment does not include scans, page images, or original files."
        accession={`CATALOGUE ENTRIES: ${records.length}`}
        badge="NO SCANS BUNDLED"
      />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {error ? (
          <p role="alert" className="border-2 border-oxblood bg-[#FAF6EE] p-6 font-editorial text-sm">{error}</p>
        ) : records.length === 0 ? (
          <p className="border-2 border-ink bg-[#FAF6EE] p-8 text-center font-editorial text-sm">
            No manuscript-type records are included in the current catalogue snapshot.
          </p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {records.map((record) => (
              <li key={record.id} className="border-2 border-ink bg-[#FAF6EE] p-5 shadow-letterpress-sm">
                <div className="flex items-start gap-3">
                  <FileText className="mt-1 h-5 w-5 shrink-0 text-oxblood" />
                  <div className="min-w-0 space-y-2">
                    <p className="font-mono text-[10px] font-bold uppercase text-oxblood">{record.archive_id}</p>
                    <h2 className="font-serif text-lg font-bold">{record.title}</h2>
                    {record.description && <p className="font-editorial text-sm text-ink/80">{record.description}</p>}
                    <p className="font-mono text-xs text-ink/65">
                      {record.year || 'Date not recorded'} · {record.verification_status}
                    </p>
                    <Link className="inline-block font-mono text-xs font-bold uppercase text-oxblood hover:underline" to={`/documents/${record.id}`}>
                      View catalogue record
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};
