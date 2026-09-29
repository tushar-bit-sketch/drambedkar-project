import React from 'react';
import { Filter, RotateCcw, Check } from 'lucide-react';
import { Collection } from '../../types';

interface FilterSidebarProps {
  collections: Collection[];
  selectedCollection: number | null;
  onSelectCollection: (id: number | null) => void;
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
  selectedLanguage: string | null;
  onSelectLanguage: (lang: string | null) => void;
  selectedYear: number | null;
  onSelectYear: (year: number | null) => void;
  selectedTopic: string | null;
  onSelectTopic: (topic: string | null) => void;
  onReset: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  collections,
  selectedCollection,
  onSelectCollection,
  selectedType,
  onSelectType,
  selectedLanguage,
  onSelectLanguage,
  selectedYear,
  onSelectYear,
  selectedTopic,
  onSelectTopic,
  onReset
}) => {
  const documentTypes = [
    { label: 'All Types', value: null },
    { label: 'Constituent Assembly Debates', value: 'DEBATE' },
    { label: 'Books & Monographs', value: 'BOOK' },
    { label: 'Speeches & Addresses', value: 'SPEECH' },
    { label: 'Manuscripts & Typescripts', value: 'MANUSCRIPT' },
    { label: 'Official Gazettes & Acts', value: 'GAZETTE' },
  ];

  const languages = [
    { label: 'All Languages', value: null },
    { label: 'English', value: 'English' },
    { label: 'Marathi (मराठी)', value: 'Marathi' },
    { label: 'Hindi (हिंदी)', value: 'Hindi' },
    { label: 'Pali (पालि)', value: 'Pali' },
  ];

  const years = [
    { label: 'All Years', value: null },
    { label: '1949 (Draft Constitution Adoption)', value: 1949 },
    { label: '1948 (Draft Constitution Debates)', value: 1948 },
    { label: '1947 (Drafting Committee Formation)', value: 1947 },
    { label: '1936 (Annihilation of Caste)', value: 1936 },
    { label: '1927 (Mahad Satyagraha)', value: 1927 },
    { label: '1923 (Problem of the Rupee)', value: 1923 },
    { label: '1916 (Columbia University)', value: 1916 },
  ];

  const topics = [
    { label: 'All Topics', value: null },
    { label: 'Constitutional Law & Rights', value: 'constitutional-law' },
    { label: 'Social Democracy & Caste', value: 'social-democracy' },
    { label: 'Monetary Economics & Rupee', value: 'monetary-economics' },
    { label: 'Labour Law & Working Hours', value: 'labour-rights' },
    { label: 'Buddhist Philosophy & Ethics', value: 'buddhist-philosophy' },
    { label: 'Women\'s Rights & Hindu Code', value: 'womens-rights' },
  ];

  const hasActiveFilters = Boolean(
    selectedCollection || selectedType || selectedLanguage || selectedYear || selectedTopic
  );

  return (
    <aside aria-label="Archive Filters" className="bg-[#FAF6EE] border-2 border-ink p-4 space-y-5 shadow-letterpress-sm font-mono text-xs">
      <div className="flex items-center justify-between border-b-2 border-ink pb-2">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-oxblood" />
          <h3 className="font-serif font-black text-xs uppercase tracking-wider text-ink">
            Ledger Filters
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-[10px] text-oxblood hover:underline font-bold uppercase flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3 h-3" />
            [ Reset ]
          </button>
        )}
      </div>

      {/* Collection Filter */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-ink uppercase tracking-wider block border-b border-ink/10 pb-0.5">
          Archival Collection
        </label>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => onSelectCollection(null)}
            className={`w-full text-left px-2 py-1 text-xs transition flex items-center justify-between border ${
              selectedCollection === null
                ? 'bg-ink text-white border-ink font-bold shadow-letterpress-sm'
                : 'text-ink border-ink/20 hover:border-ink hover:bg-newsprint-200'
            }`}
          >
            <span>[ All Collections ]</span>
            {selectedCollection === null && <Check className="w-3 h-3 text-white" />}
          </button>
          {collections.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectCollection(c.id)}
              className={`w-full text-left px-2 py-1 text-xs transition flex items-center justify-between border ${
                selectedCollection === c.id
                  ? 'bg-ink text-white border-ink font-bold shadow-letterpress-sm'
                  : 'text-ink border-ink/20 hover:border-ink hover:bg-newsprint-200'
              }`}
            >
              <span className="truncate pr-2">{c.title}</span>
              {selectedCollection === c.id && <Check className="w-3 h-3 text-white flex-shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Document Type */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-ink uppercase tracking-wider block border-b border-ink/10 pb-0.5">
          Document Classification
        </label>
        <div className="space-y-1">
          {documentTypes.map((dt) => (
            <button
              key={dt.label}
              onClick={() => onSelectType(dt.value)}
              className={`w-full text-left px-2 py-1 text-xs transition flex items-center justify-between border ${
                selectedType === dt.value
                  ? 'bg-ink text-white border-ink font-bold shadow-letterpress-sm'
                  : 'text-ink border-ink/20 hover:border-ink hover:bg-newsprint-200'
              }`}
            >
              <span>{dt.label}</span>
              {selectedType === dt.value && <Check className="w-3 h-3 text-white" />}
            </button>
          ))}
        </div>
      </div>

      {/* Year */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-ink uppercase tracking-wider block border-b border-ink/10 pb-0.5">
          Historical Year / Epoch
        </label>
        <select
          value={selectedYear || ''}
          onChange={(e) => onSelectYear(e.target.value ? Number(e.target.value) : null)}
          className="w-full text-xs p-1.5 border border-ink/40 bg-white text-ink font-mono focus:outline-none focus:border-ink"
        >
          {years.map((y) => (
            <option key={y.label} value={y.value || ''}>
              {y.label}
            </option>
          ))}
        </select>
      </div>

      {/* Language */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-ink uppercase tracking-wider block border-b border-ink/10 pb-0.5">
          Language
        </label>
        <select
          value={selectedLanguage || ''}
          onChange={(e) => onSelectLanguage(e.target.value || null)}
          className="w-full text-xs p-1.5 border border-ink/40 bg-white text-ink font-mono focus:outline-none focus:border-ink"
        >
          {languages.map((l) => (
            <option key={l.label} value={l.value || ''}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      {/* Topics */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-ink uppercase tracking-wider block border-b border-ink/10 pb-0.5">
          Subject / Topic
        </label>
        <select
          value={selectedTopic || ''}
          onChange={(e) => onSelectTopic(e.target.value || null)}
          className="w-full text-xs p-1.5 border border-ink/40 bg-white text-ink font-mono focus:outline-none focus:border-ink"
        >
          {topics.map((t) => (
            <option key={t.label} value={t.value || ''}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
};
