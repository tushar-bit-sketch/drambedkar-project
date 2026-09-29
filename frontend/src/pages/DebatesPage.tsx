import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { apiService } from '../services/api';
import { DocumentItem } from '../types';
import { DemoBanner } from '../components/archive/DemoBanner';
import { PageMasthead } from '../components/layout/PageMasthead';

export const DebatesPage: React.FC = () => {
  const [debates, setDebates] = useState<DocumentItem[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiService.getDocuments({ document_type: 'DEBATE', page_size: 100 })
      .then((response) => setDebates(response.items))
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Catalogue records could not be loaded.'));
  }, []);

  const filteredDebates = debates.filter((debate) =>
    `${debate.title} ${debate.description || ''} ${debate.archive_id} ${debate.source_reference || ''}`
      .toLocaleLowerCase()
      .includes(search.toLocaleLowerCase()),
  );

  return (
    <div className="min-h-screen bg-newsprint-100 text-ink">
      <DemoBanner />
      <PageMasthead
        eyebrow="CONSTITUENT ASSEMBLY DEBATE CATALOGUE"
        headline="Constituent Assembly Debates"
        subheadline="Browse catalogue descriptions and recorded references for debate-related records. The static site does not host the proceedings or their full text."
        accession={`CATALOGUE ENTRIES: ${filteredDebates.length}`}
        badge="METADATA ONLY"
        bottomSlot={
          <label className="relative block max-w-xl pt-1">
            <span className="sr-only">Search debate catalogue records</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search titles, identifiers, or source references..."
              className="w-full border-2 border-ink bg-white py-2 pl-10 pr-4 font-mono text-xs text-ink shadow-letterpress-sm focus:border-oxblood focus:outline-none"
            />
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-ink-500" />
          </label>
        }
      />
      <main className="mx-auto max-w-6xl space-y-4 px-4 py-8">
        {error ? (
          <p role="alert" className="border-2 border-oxblood bg-[#FAF6EE] p-6 font-editorial text-sm">{error}</p>
        ) : filteredDebates.length === 0 ? (
          <p className="border-2 border-ink bg-[#FAF6EE] p-8 text-center font-editorial text-sm">
            No debate-type records match this search in the current snapshot.
          </p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {filteredDebates.map((debate) => (
              <li key={debate.id} className="space-y-3 border-2 border-ink bg-[#FAF6EE] p-5 shadow-letterpress-sm">
                <p className="font-mono text-[10px] font-bold uppercase text-oxblood">{debate.archive_id}</p>
                <h2 className="font-serif text-lg font-bold">{debate.title}</h2>
                {debate.description && <p className="font-editorial text-sm text-ink/80">{debate.description}</p>}
                <dl className="space-y-1 border-t border-ink/20 pt-2 font-mono text-xs">
                  {debate.source_reference && <div><dt className="inline font-bold">Source reference: </dt><dd className="inline">{debate.source_reference}</dd></div>}
                  {(debate.date_created || debate.year) && <div><dt className="inline font-bold">Date: </dt><dd className="inline">{debate.date_created || debate.year}</dd></div>}
                  {debate.creator && <div><dt className="inline font-bold">Creator: </dt><dd className="inline">{debate.creator}</dd></div>}
                </dl>
                <Link className="inline-block font-mono text-xs font-bold uppercase text-oxblood hover:underline" to={`/documents/${debate.id}`}>
                  View catalogue record
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};
