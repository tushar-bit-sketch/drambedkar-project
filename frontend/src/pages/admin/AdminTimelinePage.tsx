import React, { useState, useEffect } from 'react';
import { 
  Clock, Calendar, Search, Plus, CheckCircle2, XCircle, AlertTriangle, 
  Layers, ShieldCheck, Sparkles, Filter, RefreshCw, FileText, MapPin, Tag
} from 'lucide-react';
import { apiService } from '../../services/api';
import { TimelineEvent, DocumentItem } from '../../types';

export const AdminTimelinePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'queue' | 'all' | 'extract' | 'new'>('queue');
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  // Extraction dispatch state
  const [selectedDocId, setSelectedDocId] = useState<number | ''>('');
  const [extracting, setExtracting] = useState(false);
  const [extractResult, setExtractResult] = useState<TimelineEvent[] | null>(null);

  // New milestone form state
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    date_str: '',
    category: 'Constitutional',
    location: '',
    document_id: undefined as number | undefined
  });
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const refreshEvents = () => {
    setLoading(true);
    Promise.all([
      apiService.getTimelineEvents(),
      apiService.getDocuments({ limit: 50 })
    ]).then(([evtData, docData]) => {
      setEvents(evtData);
      setDocuments(docData.items || []);
      setLoading(false);
    }).catch(err => {
      console.warn('Failed to refresh timeline events:', err);
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshEvents();
  }, []);

  const handleApprove = async (eventId: number) => {
    try {
      setActionLoading(true);
      await apiService.approveTimelineEvent(eventId);
      refreshEvents();
    } catch (e) {
      alert('Failed to approve timeline milestone');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (eventId: number) => {
    try {
      setActionLoading(true);
      await apiService.rejectTimelineEvent(eventId);
      refreshEvents();
    } catch (e) {
      alert('Failed to reject timeline milestone');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestone.title || !newMilestone.date_str || !newMilestone.description) {
      setFormMsg({ type: 'error', text: 'Title, Date String, and Description are required.' });
      return;
    }
    try {
      setActionLoading(true);
      setFormMsg(null);
      await apiService.createTimelineEvent({
        title: newMilestone.title,
        description: newMilestone.description,
        date_str: newMilestone.date_str,
        category: newMilestone.category,
        location: newMilestone.location || undefined,
        document_id: newMilestone.document_id ? Number(newMilestone.document_id) : undefined
      });
      setFormMsg({ type: 'success', text: 'Milestone created successfully.' });
      setNewMilestone({
        title: '',
        description: '',
        date_str: '',
        category: 'Constitutional',
        location: '',
        document_id: undefined
      });
      refreshEvents();
    } catch (err: any) {
      setFormMsg({ type: 'error', text: err.message || 'Failed to create milestone' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtract = async () => {
    if (!selectedDocId) {
      alert('Please select an archival document to extract milestones.');
      return;
    }
    setExtracting(true);
    setExtractResult(null);
    try {
      const candidates = await apiService.generateTimelineCandidates(Number(selectedDocId));
      setExtractResult(candidates);
      refreshEvents();
    } catch (e: any) {
      alert(e.message || 'Milestone extraction failed');
    } finally {
      setExtracting(false);
    }
  };

  const pendingEvents = events.filter(e => e.verification_status === 'PENDING_REVIEW' || e.verification_status === 'UNDER_REVIEW');
  const verifiedEvents = events.filter(e => e.verification_status === 'VERIFIED' || e.verification_status === 'APPROVED');

  const filteredCatalog = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.location && e.location.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = filterCategory === 'ALL' || e.category?.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-heritage-600 uppercase tracking-widest font-semibold">
            <Clock className="w-4 h-4 text-heritage-600" />
            Historical Milestone Management
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 mt-1">
            Timeline Curation & Review
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Verify machine-extracted chronological events, manage canonical milestones, and audit archival evidence chains.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshEvents}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className="flex items-center gap-1.5 px-4 py-2 bg-heritage-600 hover:bg-heritage-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            New Milestone
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Milestones</div>
          <div className="text-2xl font-bold font-serif text-slate-900 mt-1">{events.length}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">Catalogued chronologies</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="text-xs font-medium text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Review Queue
          </div>
          <div className="text-2xl font-bold font-serif text-amber-700 mt-1">{pendingEvents.length}</div>
          <div className="text-[11px] text-amber-600/80 mt-1">Candidates awaiting curator audit</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="text-xs font-medium text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Curator Verified
          </div>
          <div className="text-2xl font-bold font-serif text-emerald-800 mt-1">{verifiedEvents.length}</div>
          <div className="text-[11px] text-emerald-600/80 mt-1">Published historical facts</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="text-xs font-medium text-indigo-700 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Machine Extracted
          </div>
          <div className="text-2xl font-bold font-serif text-indigo-800 mt-1">
            {events.filter(e => e.provenance_type === 'MACHINE_EXTRACTED_RELATION' || e.provenance_type === 'MACHINE_INFERRED_RELATION').length}
          </div>
          <div className="text-[11px] text-indigo-600/80 mt-1">NLP extracted with provenance</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-300 gap-2">
        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'queue'
              ? 'border-heritage-600 text-heritage-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          Review Queue ({pendingEvents.length})
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'all'
              ? 'border-heritage-600 text-heritage-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          All Milestones ({events.length})
        </button>

        <button
          onClick={() => setActiveTab('extract')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'extract'
              ? 'border-heritage-600 text-heritage-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Archive Extraction Dispatch
        </button>

        <button
          onClick={() => setActiveTab('new')}
          className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'new'
              ? 'border-heritage-600 text-heritage-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Plus className="w-4 h-4" />
          Add Milestone
        </button>
      </div>

      {/* TAB 1: CURATOR REVIEW QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {pendingEvents.length === 0 ? (
            <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-serif font-bold text-slate-800 text-base">Review Queue Is Clear</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                All machine-extracted timeline milestones have been audited. You can dispatch new extractions from archival documents in the Extraction Dispatch tab.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingEvents.map(evt => (
                <div key={evt.id} className="bg-white rounded-xl border border-amber-200 shadow-sm p-5 hover:border-amber-300 transition">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          {evt.date_precision || 'APPROXIMATE'}: {evt.exact_date || evt.year_start || 'Unknown'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-slate-700">
                          {evt.category || 'General'}
                        </span>
                        {evt.confidence && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                            EXTRACTION CONFIDENCE: {(evt.confidence * 100).toFixed(0)}%
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200">
                          STATUS: {evt.verification_status}
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-lg text-slate-900">{evt.title}</h3>
                      <p className="text-xs text-slate-700 leading-relaxed">{evt.description}</p>

                      {evt.evidence_text && (
                        <div className="mt-2 p-3 bg-stone-50 rounded border-l-4 border-amber-400 text-xs font-mono text-slate-800">
                          <span className="font-bold text-[10px] text-slate-500 uppercase block mb-1">Archival Text Evidence:</span>
                          "{evt.evidence_text}"
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                        {evt.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {evt.location}
                          </span>
                        )}
                        {evt.document_id && (
                          <span className="flex items-center gap-1 text-heritage-700">
                            <FileText className="w-3.5 h-3.5" />
                            Source Document #{evt.document_id}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleApprove(evt.id)}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve Milestone
                      </button>
                      <button
                        onClick={() => handleReject(evt.id)}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-semibold rounded-lg transition"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject Milestone
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALL MILESTONES CATALOG */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search milestones by title, description, or location..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-heritage-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="bg-stone-50 border border-stone-300 rounded-lg text-xs px-3 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="Constitutional">Constitutional</option>
                <option value="Social Movements">Social Movements</option>
                <option value="Academic Treatises">Academic Treatises</option>
                <option value="Labour Reforms">Labour Reforms</option>
                <option value="Religious & Philosophical">Religious & Philosophical</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#102038] text-slate-300 uppercase tracking-wider text-[11px] font-mono">
                <tr>
                  <th className="py-3 px-4">Date / Precision</th>
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredCatalog.map(evt => (
                  <tr key={evt.id} className="hover:bg-stone-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      <div>{evt.exact_date || evt.year_start || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{evt.date_precision}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{evt.title}</div>
                      <div className="text-slate-500 line-clamp-1 mt-0.5">{evt.description}</div>
                      {evt.location && (
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {evt.location}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-stone-100 text-slate-700 text-[10px]">
                        {evt.category || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {evt.verification_status === 'VERIFIED' || evt.verification_status === 'APPROVED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" /> {evt.verification_status}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                      {evt.verification_status !== 'VERIFIED' && evt.verification_status !== 'APPROVED' ? (
                        <button
                          onClick={() => handleApprove(evt.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-semibold transition"
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReject(evt.id)}
                          className="px-2.5 py-1 bg-stone-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 rounded text-[10px] font-semibold transition"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: EXTRACTION DISPATCH */}
      {activeTab === 'extract' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="font-serif font-bold text-lg text-slate-900">
              Extract Timeline Candidates from Primary Archival Records
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Select an archival document from the repository. The timeline extractor will analyze OCR text versions, extract date candidates, preserve exact archival text evidence snippets, and place them in the Review Queue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Archival Document</label>
              <select
                value={selectedDocId}
                onChange={e => setSelectedDocId(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg text-xs px-3 py-2 focus:outline-none"
              >
                <option value="">-- Select Primary Document --</option>
                {documents.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    #{doc.id}: {doc.title} ({doc.year || 'Date Unknown'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <button
              onClick={handleExtract}
              disabled={extracting || !selectedDocId}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <Sparkles className={`w-4 h-4 ${extracting ? 'animate-spin' : ''}`} />
              {extracting ? 'Extracting Candidates...' : 'Run Timeline Candidate Extraction'}
            </button>
          </div>

          {extractResult && (
            <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-indigo-900">
                  Extraction Complete: {extractResult.length} Candidates Identified
                </span>
                <button
                  onClick={() => setActiveTab('queue')}
                  className="text-xs text-indigo-700 hover:underline font-semibold"
                >
                  View in Review Queue &rarr;
                </button>
              </div>
              <div className="space-y-2">
                {extractResult.map((c, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-indigo-100 text-xs">
                    <div className="font-bold text-slate-800">{c.title}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Precision: {c.date_precision} | Date: {c.exact_date || c.year_start}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: NEW MILESTONE ENTRY */}
      {activeTab === 'new' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 max-w-3xl">
          <h2 className="font-serif font-bold text-lg text-slate-900 mb-1">
            Create Canonical Archival Milestone
          </h2>
          <p className="text-xs text-slate-600 mb-6">
            Curator-entered milestones are marked as HUMAN_VERIFIED_RELATION and VERIFIED. Strict historical date formats are enforced.
          </p>

          {formMsg && (
            <div className={`p-3 rounded-lg text-xs mb-4 ${
              formMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {formMsg.text}
            </div>
          )}

          <form onSubmit={handleCreateMilestone} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Milestone Title *</label>
              <input
                type="text"
                placeholder="e.g. Mahad Satyagraha"
                value={newMilestone.title}
                onChange={e => setNewMilestone({ ...newMilestone, title: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg text-xs px-3 py-2 focus:outline-none focus:ring-1 focus:ring-heritage-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Historical Date String * (e.g. 1927-03-20, 1949, 1930s, March 1927)
                </label>
                <input
                  type="text"
                  placeholder="YYYY-MM-DD or YYYY or YYYYs"
                  value={newMilestone.date_str}
                  onChange={e => setNewMilestone({ ...newMilestone, date_str: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg text-xs px-3 py-2 font-mono focus:outline-none focus:ring-1 focus:ring-heritage-500"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Date precision (EXACT_DAY, YEAR, DECADE) will be determined automatically.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Historical Category</label>
                <select
                  value={newMilestone.category}
                  onChange={e => setNewMilestone({ ...newMilestone, category: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg text-xs px-3 py-2 focus:outline-none cursor-pointer"
                >
                  <option value="Constitutional">Constitutional</option>
                  <option value="Social Movements">Social Movements</option>
                  <option value="Academic Treatises">Academic Treatises</option>
                  <option value="Labour Reforms">Labour Reforms</option>
                  <option value="Religious & Philosophical">Religious & Philosophical</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Geographic Location</label>
                <input
                  type="text"
                  placeholder="e.g. Mahad, Kolaba District, Bombay Presidency"
                  value={newMilestone.location}
                  onChange={e => setNewMilestone({ ...newMilestone, location: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg text-xs px-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Source Document (Optional)</label>
                <select
                  value={newMilestone.document_id || ''}
                  onChange={e => setNewMilestone({ ...newMilestone, document_id: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg text-xs px-3 py-2 focus:outline-none"
                >
                  <option value="">-- No Source Linked --</option>
                  {documents.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      #{doc.id}: {doc.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Archival Summary *</label>
              <textarea
                rows={4}
                placeholder="Comprehensive historical context, significance, and archival references..."
                value={newMilestone.description}
                onChange={e => setNewMilestone({ ...newMilestone, description: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg text-xs p-3 focus:outline-none focus:ring-1 focus:ring-heritage-500 leading-relaxed"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={actionLoading}
                className="px-6 py-2.5 bg-heritage-700 hover:bg-heritage-800 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                {actionLoading ? 'Saving...' : 'Publish Verified Milestone'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminTimelinePage;
