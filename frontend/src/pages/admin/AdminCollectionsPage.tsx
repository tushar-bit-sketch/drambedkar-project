import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, Edit, Trash2, CheckCircle2, AlertTriangle, 
  Search, RefreshCw, X, BookOpen, Layers
} from 'lucide-react';
import { apiService } from '../../services/api';
import { Collection } from '../../types';

export const AdminCollectionsPage: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal State
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [activeCollection, setActiveCollection] = useState<Partial<Collection>>({
    title: '',
    slug: '',
    description: '',
    period: '',
    curator_notes: '',
    cover_image: ''
  });

  const loadCollections = async () => {
    setIsLoading(true);
    try {
      const list = await apiService.getCollections();
      setCollections(list);
    } catch {
      // Fallback loaded automatically
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const handleOpenCreate = () => {
    setActiveCollection({
      title: '',
      slug: '',
      description: '',
      period: '',
      curator_notes: '',
      cover_image: ''
    });
    setModalMode('create');
    setErrorMessage(null);
  };

  const handleOpenEdit = (col: Collection) => {
    setActiveCollection({ ...col });
    setModalMode('edit');
    setErrorMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!activeCollection.title?.trim()) {
      setErrorMessage('Collection title is required.');
      return;
    }

    const slug = activeCollection.slug?.trim() || activeCollection.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    try {
      if (modalMode === 'create') {
        await apiService.createCollection({
          title: activeCollection.title.trim(),
          slug,
          description: activeCollection.description || '',
          period: activeCollection.period,
          curator_notes: activeCollection.curator_notes,
          cover_image: activeCollection.cover_image
        });
        setStatusMessage(`Collection '${activeCollection.title}' created successfully.`);
      } else if (modalMode === 'edit' && activeCollection.id) {
        await apiService.updateCollection(activeCollection.id, {
          title: activeCollection.title.trim(),
          slug,
          description: activeCollection.description,
          period: activeCollection.period,
          curator_notes: activeCollection.curator_notes,
          cover_image: activeCollection.cover_image
        });
        setStatusMessage(`Collection '${activeCollection.title}' updated.`);
      }
      setModalMode(null);
      loadCollections();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Operation failed.');
    }
  };

  const handleDelete = async (col: Collection) => {
    if (!window.confirm(`Are you sure you want to soft-delete collection '${col.title}'?`)) return;

    try {
      await apiService.deleteCollection(col.id);
      setStatusMessage(`Collection '${col.title}' soft-deleted.`);
      loadCollections();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete collection.');
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const filtered = collections.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-300 pb-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900">
            Archival Collections Management
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Organize documents and manuscripts into curated thematic and chronological series.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-heritage-700 hover:bg-heritage-800 text-white font-bold text-xs rounded-xl shadow transition"
        >
          <FolderPlus className="w-4 h-4" /> New Collection
        </button>
      </div>

      {statusMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-700" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Search & Stats */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search collections..."
            className="w-full pl-9 pr-4 py-2 rounded-lg text-xs border border-stone-300 focus:outline-none focus:border-heritage-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-slate-500 font-mono">
          Total Collections: {filtered.length}
        </span>
      </div>

      {/* Grid of Collections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((col) => (
          <div
            key={col.id}
            className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-heritage-400 transition"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-heritage-600" />
                    <h3 className="font-serif font-bold text-sm text-ink-900">{col.title}</h3>
                  </div>
                  <span className="text-[10px] font-mono bg-stone-100 px-2 py-0.5 rounded text-slate-600">
                    {col.slug}
                  </span>
                </div>
                {col.period && (
                  <span className="text-xs font-semibold text-heritage-800 bg-heritage-50 px-2.5 py-0.5 rounded border border-heritage-200 whitespace-nowrap">
                    {col.period}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                {col.description}
              </p>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1 font-mono text-[11px]">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                {col.document_count || 0} Archival Documents
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(col)}
                  className="p-1.5 text-slate-600 hover:text-heritage-700 rounded hover:bg-stone-100 transition"
                  title="Edit Collection"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(col)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
                  title="Delete Collection"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Create / Edit */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h2 className="font-serif text-lg font-bold text-ink-900">
                {modalMode === 'create' ? 'Create Archival Collection' : 'Edit Archival Collection'}
              </h2>
              <button
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Collection Title *</label>
                <input
                  type="text"
                  required
                  value={activeCollection.title || ''}
                  onChange={(e) => setActiveCollection({ ...activeCollection, title: e.target.value })}
                  placeholder="e.g. Constituent Assembly of India & The Draft Constitution"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-heritage-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Slug (URL identifier)</label>
                  <input
                    type="text"
                    value={activeCollection.slug || ''}
                    onChange={(e) => setActiveCollection({ ...activeCollection, slug: e.target.value })}
                    placeholder="e.g. constituent-assembly-debates"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono focus:outline-none focus:border-heritage-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Historical Period</label>
                  <input
                    type="text"
                    value={activeCollection.period || ''}
                    onChange={(e) => setActiveCollection({ ...activeCollection, period: e.target.value })}
                    placeholder="e.g. 1946–1950"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-heritage-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  value={activeCollection.description || ''}
                  onChange={(e) => setActiveCollection({ ...activeCollection, description: e.target.value })}
                  placeholder="Curatorial scope and description of historical records in this series..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-heritage-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Curator Notes</label>
                <input
                  type="text"
                  value={activeCollection.curator_notes || ''}
                  onChange={(e) => setActiveCollection({ ...activeCollection, curator_notes: e.target.value })}
                  placeholder="e.g. Digitized facsimiles with full scholarly cross-referencing."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-heritage-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 text-slate-700 hover:bg-stone-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-heritage-700 hover:bg-heritage-800 text-white font-bold rounded-lg shadow transition"
                >
                  Save Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
