import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { DocumentItem } from '../types';
import { apiService } from '../services/api';
import { DocumentCard } from '../components/archive/DocumentCard';
import { PageMasthead } from '../components/layout/PageMasthead';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [items, setItems] = useState<DocumentItem[]>([]);

  useEffect(() => {
    apiService.getDocuments({ q: searchParams.get('q') || undefined, page_size: 100 })
      .then((response) => setItems(response.items))
      .catch(() => setItems([]));
  }, [searchParams]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next = new URLSearchParams();
    if (query.trim()) next.set('q', query.trim());
    setSearchParams(next);
  };

  return (
    <div className="min-h-screen bg-newsprint-100 text-ink">
      <PageMasthead
        eyebrow="LOCAL CATALOGUE LOOKUP"
        headline="Search catalogue records"
        subheadline="Search titles, creators, accession identifiers, and recorded source references in the metadata bundled with this site. No full text is indexed."
        accession={`MATCHING RECORDS: ${items.length}`}
        badge="STATIC METADATA SEARCH"
        bottomSlot={
          <form onSubmit={submit} className="flex max-w-3xl gap-2">
            <label className="sr-only" htmlFor="archive-query">Search the catalogue</label>
            <input
              id="archive-query"
              className="min-w-0 flex-1 border-2 border-ink bg-white px-3 py-2 font-mono text-sm"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Title, creator, accession, or source reference"
            />
            <button className="flex items-center gap-2 border-2 border-ink bg-ink px-4 py-2 font-mono text-xs font-bold uppercase text-white">
              <Search className="h-4 w-4" /> Search
            </button>
          </form>
        }
      />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <p className="mb-5 border-l-4 border-oxblood bg-[#FAF6EE] p-3 font-mono text-xs">
          Catalogue records only. Historical text, page-level citations, file integrity, and semantic/vector retrieval are not available in this static frontend.
        </p>
        {items.length ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => <DocumentCard key={item.id} document={item} onSelect={() => undefined} />)}
          </div>
        ) : (
          <p className="border-2 border-ink bg-[#FAF6EE] p-8 text-center font-editorial">No catalogue records match this search.</p>
        )}
      </main>
    </div>
  );
};
