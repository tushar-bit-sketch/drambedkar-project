import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { apiService } from '../services/api';
import { DocumentItem } from '../types';
import { DemoBanner } from '../components/archive/DemoBanner';
import { PageMasthead } from '../components/layout/PageMasthead';

export const SpeechesPage: React.FC = () => {
  const [speeches, setSpeeches] = useState<DocumentItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiService.getDocuments({ document_type: 'SPEECH', page_size: 100 })
      .then((response) => setSpeeches(response.items))
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Catalogue records could not be loaded.'));
  }, []);

  return (
    <div className="min-h-screen bg-newsprint-100 text-ink">
      <DemoBanner />
      <PageMasthead
        eyebrow="SPEECH AND ADDRESS CATALOGUE METADATA"
        headline="Speeches & Public Addresses"
        subheadline="Browse catalogue descriptions and source references for speech-related records. This site does not include audio files, transcripts, or full text."
        accession={`CATALOGUE ENTRIES: ${speeches.length}`}
        badge="NO AUDIO FILES BUNDLED"
      />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {error ? (
          <p role="alert" className="border-2 border-oxblood bg-[#FAF6EE] p-6 font-editorial text-sm">{error}</p>
        ) : speeches.length === 0 ? (
          <p className="border-2 border-ink bg-[#FAF6EE] p-8 text-center font-editorial text-sm">
            No speech-type records are included in the current catalogue snapshot.
          </p>
        ) : (
          <ul className="space-y-4">
            {speeches.map((speech) => (
              <li key={speech.id} className="border-2 border-ink bg-[#FAF6EE] p-5 shadow-letterpress-sm">
                <div className="flex items-start gap-3">
                  <FileText className="mt-1 h-5 w-5 shrink-0 text-oxblood" />
                  <div className="min-w-0 space-y-2">
                    <p className="font-mono text-[10px] font-bold uppercase text-oxblood">{speech.archive_id}</p>
                    <h2 className="font-serif text-lg font-bold">{speech.title}</h2>
                    {speech.description && <p className="font-editorial text-sm text-ink/80">{speech.description}</p>}
                    <p className="font-mono text-xs text-ink/65">
                      {[speech.creator || speech.author_name, speech.date_created || speech.year, speech.language_name || speech.language]
                        .filter(Boolean).join(' · ')}
                    </p>
                    <Link className="inline-block font-mono text-xs font-bold uppercase text-oxblood hover:underline" to={`/documents/${speech.id}`}>
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
