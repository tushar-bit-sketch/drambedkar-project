import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, LayoutGrid, List, SlidersHorizontal, RefreshCw, X } from 'lucide-react';
import { apiService } from '../services/api';
import { DocumentItem, Collection } from '../types';
import { DocumentCard } from '../components/archive/DocumentCard';
import { FilterSidebar } from '../components/archive/FilterSidebar';
import { DemoBanner } from '../components/archive/DemoBanner';
import { PageMasthead } from '../components/layout/PageMasthead';

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter states from URL or state
  const searchQuery = searchParams.get('q') || '';
  const selectedCollection = searchParams.get('collection_id') ? Number(searchParams.get('collection_id')) : null;
  const selectedType = searchParams.get('document_type') || null;
  const selectedLanguage = searchParams.get('language') || null;
  const selectedYear = searchParams.get('year') ? Number(searchParams.get('year')) : null;
  const selectedTopic = searchParams.get('topic') || null;

  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    apiService.getCollections()
      .then(setCollections)
      .catch(err => {
        console.warn('Collections fetch failed:', err);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiService.getDocuments({
      q: searchQuery || undefined,
      collection_id: selectedCollection || undefined,
      document_type: selectedType || undefined,
      year: selectedYear || undefined,
      page_size: 50
    }).then(res => {
      let filtered = res.items;
      if (selectedLanguage) {
        filtered = filtered.filter(d => d.language_name?.toLowerCase() === selectedLanguage.toLowerCase());
      }
      setDocuments(filtered);
      setIsOffline(false);
      setLoading(false);
    }).catch(err => {
      console.warn('Documents fetch failed:', err);
      setError(err.message || 'Catalogue data could not be loaded.');
      setIsOffline(true);
      setDocuments([]);
      setLoading(false);
    });
  }, [searchQuery, selectedCollection, selectedType, selectedLanguage, selectedYear, selectedTopic]);

  const updateFilter = (key: string, value: string | number | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, String(value));
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const activeCollectionObj = collections.find(c => c.id === selectedCollection);
  const hasActiveFilters = Boolean(
    selectedCollection || selectedType || selectedLanguage || selectedYear || selectedTopic || searchQuery
  );

  return (
    <div className="min-h-screen bg-newsprint-100 text-ink">
      <DemoBanner isDemoData={documents.some(d => d.is_demo_data)} isOffline={isOffline} />

      {/* Explore Header Bar with Standardized PageMasthead */}
      <PageMasthead
        eyebrow="BUNDLED CATALOGUE • READ-ONLY METADATA"
        headline="Explore Archival Records"
        subheadline="Browse catalogue descriptions and recorded source references. This static site does not host manuscript or document files."
        accession={`CATALOGUE ENTRIES: ${documents.length}`}
        bottomSlot={
          <div className="max-w-3xl">
            <div className="relative flex items-center shadow-letterpress-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => updateFilter('q', e.target.value)}
                placeholder="Search writings, speeches, debates, manuscripts by keyword or volume..."
                className="w-full pl-10 pr-10 py-2.5 bg-white text-ink border-2 border-ink focus:outline-none font-mono text-xs sm:text-sm"
              />
              <Search className="w-4 h-4 text-ink-500 absolute left-3" />
              {searchQuery && (
                <button
                  onClick={() => updateFilter('q', null)}
                  className="absolute right-3 text-ink-500 hover:text-oxblood"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        }
      />

      {/* Main Content Area: Sidebar + Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Active Filter Chips Strip */}
        {hasActiveFilters && (
          <div className="mb-4 p-2.5 bg-newsprint-200 border border-ink/30 flex flex-wrap items-center gap-2 font-mono text-xs shadow-xs">
            <span className="text-[10px] uppercase font-bold text-oxblood mr-1">Active Criteria:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-[#FAF6EE] border border-ink/40 px-2 py-0.5 text-[11px]">
                <span>Query: "{searchQuery}"</span>
                <button onClick={() => updateFilter('q', null)} className="hover:text-oxblood font-bold"><X className="w-3 h-3" /></button>
              </span>
            )}
            {activeCollectionObj && (
              <span className="inline-flex items-center gap-1 bg-[#FAF6EE] border border-ink/40 px-2 py-0.5 text-[11px]">
                <span>Collection: {activeCollectionObj.title}</span>
                <button onClick={() => updateFilter('collection_id', null)} className="hover:text-oxblood font-bold"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedType && (
              <span className="inline-flex items-center gap-1 bg-[#FAF6EE] border border-ink/40 px-2 py-0.5 text-[11px]">
                <span>Type: {selectedType}</span>
                <button onClick={() => updateFilter('document_type', null)} className="hover:text-oxblood font-bold"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedYear && (
              <span className="inline-flex items-center gap-1 bg-[#FAF6EE] border border-ink/40 px-2 py-0.5 text-[11px]">
                <span>Year: {selectedYear}</span>
                <button onClick={() => updateFilter('year', null)} className="hover:text-oxblood font-bold"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedLanguage && (
              <span className="inline-flex items-center gap-1 bg-[#FAF6EE] border border-ink/40 px-2 py-0.5 text-[11px]">
                <span>Lang: {selectedLanguage}</span>
                <button onClick={() => updateFilter('language', null)} className="hover:text-oxblood font-bold"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedTopic && (
              <span className="inline-flex items-center gap-1 bg-[#FAF6EE] border border-ink/40 px-2 py-0.5 text-[11px]">
                <span>Topic: {selectedTopic}</span>
                <button onClick={() => updateFilter('topic', null)} className="hover:text-oxblood font-bold"><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-[10px] text-oxblood hover:underline font-bold uppercase ml-auto"
            >
              [ Clear All Filters ]
            </button>
          </div>
        )}

        <div className="flex items-center justify-between pb-3 mb-6 border-b border-ink/20 font-mono text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden px-2.5 py-1 bg-[#FAF6EE] border border-ink text-xs font-bold text-ink uppercase flex items-center gap-1.5 shadow-letterpress-sm"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-oxblood" />
              <span>Filters</span>
            </button>
            <span className="font-bold text-ink">
              [ SHOWING {documents.length} ARCHIVAL HOLDINGS ]
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 border transition uppercase font-bold text-xs ${
                viewMode === 'grid'
                  ? 'bg-ink text-white border-ink shadow-letterpress-sm'
                  : 'bg-[#FAF6EE] text-ink border-ink/40 hover:border-ink'
              }`}
              title="Grid View"
            >
              [ Grid ]
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 border transition uppercase font-bold text-xs ${
                viewMode === 'list'
                  ? 'bg-ink text-white border-ink shadow-letterpress-sm'
                  : 'bg-[#FAF6EE] text-ink border-ink/40 hover:border-ink'
              }`}
              title="List View"
            >
              [ Ledger ]
            </button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Filter Sidebar (3 cols) */}
          <div className="hidden lg:block lg:col-span-3 sticky top-28">
            <FilterSidebar
              collections={collections}
              selectedCollection={selectedCollection}
              onSelectCollection={(id) => updateFilter('collection_id', id)}
              selectedType={selectedType}
              onSelectType={(type) => updateFilter('document_type', type)}
              selectedLanguage={selectedLanguage}
              onSelectLanguage={(lang) => updateFilter('language', lang)}
              selectedYear={selectedYear}
              onSelectYear={(year) => updateFilter('year', year)}
              selectedTopic={selectedTopic}
              onSelectTopic={(topic) => updateFilter('topic', topic)}
              onReset={handleResetFilters}
            />
          </div>

          {/* Mobile Filter Drawer */}
          {mobileFilterOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/60 p-4 flex justify-end">
              <div className="bg-[#FAF6EE] border-2 border-ink w-full max-w-xs h-full p-4 overflow-y-auto space-y-4">
                <div className="flex justify-between items-center border-b-2 border-ink pb-2">
                  <h3 className="font-serif font-black text-base text-ink uppercase">Classified Filters</h3>
                  <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-ink hover:text-oxblood">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <FilterSidebar
                  collections={collections}
                  selectedCollection={selectedCollection}
                  onSelectCollection={(id) => { updateFilter('collection_id', id); setMobileFilterOpen(false); }}
                  selectedType={selectedType}
                  onSelectType={(type) => { updateFilter('document_type', type); setMobileFilterOpen(false); }}
                  selectedLanguage={selectedLanguage}
                  onSelectLanguage={(lang) => { updateFilter('language', lang); setMobileFilterOpen(false); }}
                  selectedYear={selectedYear}
                  onSelectYear={(year) => { updateFilter('year', year); setMobileFilterOpen(false); }}
                  selectedTopic={selectedTopic}
                  onSelectTopic={(topic) => { updateFilter('topic', topic); setMobileFilterOpen(false); }}
                  onReset={() => { handleResetFilters(); setMobileFilterOpen(false); }}
                />
              </div>
            </div>
          )}

          {/* Results Area (9 cols) */}
          <div className="lg:col-span-9 space-y-6">
            {loading ? (
              <div className="bg-[#FAF6EE] border-2 border-ink p-12 text-center shadow-letterpress-sm font-mono flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-8 h-8 text-oxblood animate-spin" />
                <span className="text-xs uppercase font-bold text-ink">Retrieving archival ledger records...</span>
              </div>
            ) : isOffline ? (
              <div className="bg-amber-50 border-2 border-amber-600 p-12 text-center shadow-letterpress-sm font-mono space-y-3">
                <p className="font-serif font-black text-lg text-oxblood uppercase">
                  [ ARCHIVE BACKEND OFFLINE ]
                </p>
                <p className="font-editorial text-xs text-ink-700 max-w-md mx-auto italic">
                  The bundled catalogue records could not be loaded. Reload the page and try again.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-ink hover:bg-oxblood text-white text-xs font-mono font-bold uppercase tracking-wider transition border border-ink shadow-letterpress-sm"
                >
                  [ Retry Connection ]
                </button>
              </div>
            ) : documents.length === 0 ? (
              <div className="bg-[#FAF6EE] border-2 border-ink p-12 text-center shadow-letterpress-sm font-mono space-y-3">
                <p className="font-serif font-black text-lg text-ink uppercase">
                  No Archival Records Found Matching Your Criteria
                </p>
                <p className="font-editorial text-xs text-ink-700 max-w-md mx-auto italic">
                  Try clearing some filters or searching for terms like "Constitution", "Caste", "Rupee", or "Mahad".
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-ink hover:bg-oxblood text-white text-xs font-mono font-bold uppercase tracking-wider transition border border-ink shadow-letterpress-sm"
                >
                  [ Reset All Filters ]
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    viewMode={viewMode}
                    onSelect={(d) => navigate(`/documents/${d.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
