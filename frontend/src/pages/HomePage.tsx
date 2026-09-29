import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { HeroSection } from '../components/hero/HeroSection';
import { DocumentCard } from '../components/archive/DocumentCard';
import { PageMasthead } from '../components/layout/PageMasthead';
import archiveData from '../data/archiveData.json';
import { DocumentItem } from '../types';

const documents = archiveData.documents.map((document) => ({
  ...document,
  checksum: undefined,
  created_at: '',
})) as unknown as DocumentItem[];
const stats = {
  documents: documents.length,
  collections: archiveData.collections.length,
  timeline: archiveData.timeline_events.length,
  entities: archiveData.entities.length,
  relations: archiveData.relationships.length,
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(`/search${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`);
  };

  return (
    <div className="min-h-screen bg-[#C8A87A] parchment-archive-bg text-ink">
      <HeroSection stats={stats} />
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
        <PageMasthead
          eyebrow="DIGITAL HERITAGE • PROTOTYPE CATALOGUE"
          headline="Explore the archive"
          subheadline="Browse a growing catalogue of writings, speeches, people, places, and historical events connected with Dr. B. R. Ambedkar."
          accession={`${documents.length} CATALOGUED RECORDS`}
          badge="TEXT NOT HELD"
          bottomSlot={
            <form onSubmit={submitSearch} className="flex max-w-2xl gap-2">
              <label className="sr-only" htmlFor="home-search">Search catalogue</label>
              <input
                id="home-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Title, creator, accession, or source reference"
                className="min-w-0 flex-1 border-2 border-ink bg-white px-3 py-2 font-mono text-xs"
              />
              <button className="flex items-center gap-2 border-2 border-ink bg-ink px-4 py-2 font-mono text-xs font-bold uppercase text-white">
                <Search className="h-4 w-4" /> Search
              </button>
            </form>
          }
        />
        <Link to="/system-status" className="group flex items-center justify-between gap-4 rounded-xl border border-ink/10 bg-white px-5 py-4 text-sm shadow-sm transition hover:border-oxblood/30 hover:shadow-md">
          <span><strong className="font-semibold">A prototype with a roadmap.</strong> Explore the current catalogue and see what’s planned next.</span>
          <span className="shrink-0 font-semibold text-oxblood underline underline-offset-4">Project status</span>
        </Link>
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink pb-2">
            <h2 className="font-serif text-2xl font-black">Catalogue highlights</h2>
            <Link to="/explore" className="font-mono text-xs font-bold underline">Browse all records</Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {documents.slice(0, 6).map((document) => (
              <DocumentCard key={document.id} document={document} onSelect={() => undefined} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
