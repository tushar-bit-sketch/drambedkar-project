import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Search, Filter, RefreshCw, AlertTriangle, Layers, ExternalLink } from 'lucide-react';
import { apiService } from '../services/api';
import { DocumentItem } from '../types';
import { DocumentCard } from '../components/archive/DocumentCard';
import { DemoBanner } from '../components/archive/DemoBanner';
import { PageMasthead } from '../components/layout/PageMasthead';

export const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'BOOK' | 'ESSAY' | 'ACT'>('ALL');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = () => {
    setLoading(true);
    setError(null);
    apiService.getDocuments({ page_size: 50 })
      .then(res => {
        const writings = res.items.filter(d => 
          d.document_type === 'BOOK' || d.document_type === 'ESSAY' || d.document_type === 'ARTICLE' || d.document_type === 'REPORT' || d.document_type === 'ACT' || d.document_type === 'PERIODICAL' || d.document_type === 'GAZETTE'
        );
        setDocs(writings.length > 0 ? writings : res.items);
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : 'Catalogue records could not be loaded.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocs = docs.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.description?.toLowerCase().includes(search.toLowerCase()) ||
      d.archive_id.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (activeCategory === 'BOOK') return d.document_type === 'BOOK';
    if (activeCategory === 'ESSAY') return d.document_type === 'ESSAY' || d.document_type === 'ARTICLE';
    if (activeCategory === 'ACT') return d.document_type === 'ACT' || d.document_type === 'GAZETTE' || d.document_type === 'REPORT';
    return true;
  });

  return (
    <div className="min-h-screen bg-newsprint-100 text-ink">
      <DemoBanner />

      <PageMasthead
        eyebrow="READ-ONLY CATALOGUE • METADATA SNAPSHOT"
        headline="Documents, Writings & Published Monographs"
        subheadline="Scholarly books, economic treatises, social emancipation essays, legislative acts, and official memoranda authored by Dr. B. R. Ambedkar."
        accession={`CATALOGED HOLDINGS: ${docs.length}`}
        badge="CATALOGUED METADATA"
        bottomSlot={
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-1">
            <div className="relative max-w-lg flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter ledger by title, accession code, or keyword..."
                className="w-full pl-10 pr-4 py-2 border-2 border-ink text-ink bg-white font-mono text-xs focus:outline-none focus:border-oxblood shadow-letterpress-sm"
              />
              <Search className="w-4 h-4 text-ink-500 absolute left-3 top-2.5" />
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 bg-newsprint-200 border border-ink/40 p-1 font-mono text-xs">
              {[
                { label: 'All Writings', value: 'ALL' },
                { label: 'Monographs', value: 'BOOK' },
                { label: 'Essays & Papers', value: 'ESSAY' },
                { label: 'Acts & Gazettes', value: 'ACT' }
              ].map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value as any)}
                  className={`px-2.5 py-1 text-[11px] font-bold uppercase transition ${
                    activeCategory === cat.value
                      ? 'bg-ink text-white shadow-letterpress-sm'
                      : 'text-ink-700 hover:text-ink'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex justify-between items-center text-xs font-mono text-ink-600 border-b border-ink/20 pb-2">
          <span>Displaying {filteredDocs.length} Catalogued Holdings</span>
          <span className="stamp-oxblood text-[9px] py-0 px-1.5">
            [ARCHIVAL CORPUS]
          </span>
        </div>

        {loading ? (
          <div className="bg-[#FAF6EE] border-2 border-ink p-12 text-center shadow-letterpress-sm font-mono space-y-3">
            <div className="archival-loading-bar max-w-sm mx-auto mb-3" />
            <p className="text-xs uppercase font-bold text-ink tracking-widest">[ Retrieving Archival Ledger Records... ]</p>
          </div>
        ) : error ? (
          <div className="bg-danger-bg border-2 border-oxblood p-8 text-center max-w-xl mx-auto space-y-3 shadow-letterpress font-mono">
            <AlertTriangle className="w-8 h-8 text-oxblood mx-auto" />
            <h3 className="font-serif font-black text-oxblood text-base uppercase">[ Catalogue Unavailable ]</h3>
            <p className="text-xs text-danger-text font-editorial italic leading-relaxed">{error}</p>
            <button
              onClick={fetchDocuments}
              className="px-4 py-2 bg-oxblood hover:bg-ink text-white font-mono text-xs font-bold uppercase tracking-wider transition border border-oxblood shadow-letterpress-sm"
            >
              [ Reload Catalogue ]
            </button>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="bg-[#FAF6EE] border-2 border-ink p-12 text-center shadow-letterpress-sm font-mono space-y-3">
            <BookOpen className="w-12 h-12 text-ink-400 mx-auto" />
            <h3 className="font-serif font-black text-base text-ink uppercase">No Writings Matched Your Criteria</h3>
            <p className="text-xs font-editorial text-ink-600 italic">
              Try adjusting your search keyword or switching between classification categories.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* If more than 1 document, highlight the lead document prominently */}
            {filteredDocs.length > 1 && !search && activeCategory === 'ALL' && (
              <div className="bg-[#FAF6EE] border-2 border-ink p-6 shadow-letterpress mb-8">
                <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                      <span className="stamp-oxblood text-[9px] py-0 px-1.5 font-bold">CATALOGUE RECORD</span>
                      <span className="text-oxblood font-bold">{filteredDocs[0].archive_id}</span>
                      <span className="text-ink-400">•</span>
                      <span className="text-ink-600 font-bold">{filteredDocs[0].year || 'Primary Work'}</span>
                    </div>
                    <h2 
                      onClick={() => navigate(`/documents/${filteredDocs[0].id}`)}
                      className="font-serif font-black text-2xl sm:text-3xl text-ink hover:text-oxblood cursor-pointer transition leading-tight"
                    >
                      {filteredDocs[0].title}
                    </h2>
                    <p className="font-editorial text-sm sm:text-base text-ink-800 leading-relaxed border-l-2 border-oxblood pl-3">
                      {filteredDocs[0].description}
                    </p>
                    <div className="flex items-center gap-4 text-xs font-mono text-ink-600 pt-1">
                      <span>Creator: <strong>{filteredDocs[0].creator || filteredDocs[0].author_name || 'Not recorded'}</strong></span>
                      <span>•</span>
                      <span>Language: {filteredDocs[0].language_name || 'English'}</span>
                    </div>
                  </div>
                  <div className="shrink-0 self-start lg:self-center flex flex-col sm:flex-row gap-2">
                    <Link
                      to={`/documents/${filteredDocs[0].id}`}
                      className="px-5 py-3 bg-ink hover:bg-oxblood text-white font-mono text-xs font-bold uppercase tracking-wider transition shadow-letterpress border border-ink flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>[ View Catalogue Record ]</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Standard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onSelect={(d) => navigate(`/documents/${d.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

    </div>
  );
};
