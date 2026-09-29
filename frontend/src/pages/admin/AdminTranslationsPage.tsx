import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Languages, Search, Filter, CheckCircle2, 
  AlertCircle, Clock, Eye, FileText, ChevronRight, Shield
} from 'lucide-react';
import { archiveApi } from '../../services/api';
import { TranslationItem } from '../../types';

export const AdminTranslationsPage: React.FC = () => {
  const [translations, setTranslations] = useState<TranslationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [langFilter, setLangFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadTranslations();
  }, [statusFilter, langFilter]);

  const loadTranslations = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (langFilter !== 'ALL') params.language = langFilter;
      const res = await archiveApi.listTranslations(params);
      setTranslations(res);
    } catch (err) {
      console.error('Failed to load translations:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTranslations = translations.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.translated_title?.toLowerCase().includes(q) ||
      t.translated_text.toLowerCase().includes(q) ||
      t.target_language.toLowerCase().includes(q) ||
      t.translation_provider.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-ink-900 flex items-center gap-2">
            <Languages className="w-6 h-6 text-heritage-600" />
            Multilingual Archival Translations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review, verify, and curate machine-generated and human-reviewed translation derivatives.
          </p>
        </div>

        <Link
          to="/admin/languages"
          className="px-4 py-2 bg-[#1B2A4A] hover:bg-[#102038] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition"
        >
          <Shield className="w-4 h-4 text-heritage-400" />
          <span>System Diagnostics</span>
        </Link>
      </div>

      {/* Notice Banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
        <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Archival Immutability & Human Review Requirement:</span>
          <span>Original archival materials remain immutable. All machine translations are strictly flagged as 
          <code className="mx-1 px-1.5 py-0.5 bg-amber-200 rounded text-amber-950 font-mono">MACHINE_GENERATED</code> 
          and must be reviewed by scholars before being published as verified archival layers.</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search translation text, title, or provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-800 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-stone-50 border border-stone-300 rounded px-2 py-1 text-xs focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="MACHINE_GENERATED">Machine Generated</option>
              <option value="HUMAN_REVIEWED">Human Reviewed</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>Language:</span>
            <select
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value)}
              className="bg-stone-50 border border-stone-300 rounded px-2 py-1 text-xs focus:outline-none"
            >
              <option value="ALL">All Languages</option>
              <option value="Hindi">Hindi (हिन्दी)</option>
              <option value="Marathi">Marathi (मराठी)</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="English">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Translations Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <div className="w-6 h-6 border-2 border-heritage-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading translation derivatives...
          </div>
        ) : filteredTranslations.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <Languages className="w-8 h-8 mx-auto text-slate-400" />
            <p className="font-semibold text-sm text-slate-700">No translations found</p>
            <p className="text-slate-400">Generate translations from the public document viewer or adjust filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-slate-500 uppercase tracking-wider font-mono border-b border-stone-200">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Doc #</th>
                  <th className="p-3">Languages</th>
                  <th className="p-3">Translated Snippet</th>
                  <th className="p-3">Provider / Model</th>
                  <th className="p-3">Ver</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredTranslations.map((t) => (
                  <tr key={t.id} className="hover:bg-stone-50/80 transition">
                    <td className="p-3 font-mono text-slate-500">#{t.id}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">Doc #{t.document_id}</td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-700">{t.source_language}</span>
                      <span className="text-slate-400 mx-1">→</span>
                      <span className="font-bold text-heritage-600">{t.target_language}</span>
                    </td>
                    <td className="p-3 max-w-xs">
                      {t.translated_title && (
                        <span className="font-bold block text-slate-800 truncate mb-0.5">{t.translated_title}</span>
                      )}
                      <span className="text-slate-500 line-clamp-2">{t.translated_text}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-[11px] text-slate-700 block">{t.translation_provider}</span>
                      <span className="text-[10px] text-slate-400">{t.translation_model || 'v1.0'}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-600">v{t.translation_version}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        t.status === 'HUMAN_REVIEWED' || t.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : t.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        to={`/admin/translations/${t.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 hover:bg-stone-200 text-slate-800 rounded font-semibold text-xs transition"
                      >
                        <span>Review</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
