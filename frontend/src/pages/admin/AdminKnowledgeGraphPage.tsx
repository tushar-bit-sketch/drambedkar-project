import React, { useState, useEffect } from 'react';
import { 
  Network, Search, Plus, CheckCircle2, XCircle, AlertTriangle, 
  Layers, ShieldCheck, Sparkles, Filter, RefreshCw, GitMerge, FileText
} from 'lucide-react';
import { apiService } from '../../services/api';
import { 
  GraphEntityItem, GraphRelationshipItem, GraphStatsData, 
  GraphStatusData, EntityMergeItem, DocumentItem 
} from '../../types';

export const AdminKnowledgeGraphPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'entities' | 'relationships' | 'merges' | 'extract'>('relationships');
  const [stats, setStats] = useState<GraphStatsData | null>(null);
  const [status, setStatus] = useState<GraphStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  // Entities state
  const [entities, setEntities] = useState<GraphEntityItem[]>([]);
  const [entitySearch, setEntitySearch] = useState('');
  const [newEntityModal, setNewEntityModal] = useState(false);
  const [newEntity, setNewEntity] = useState({
    canonical_name: '',
    entity_type: 'Person',
    description: '',
    birth_date: '',
    death_date: '',
    location: '',
    verification_status: 'VERIFIED'
  });

  // Relationships state
  const [relationships, setRelationships] = useState<GraphRelationshipItem[]>([]);
  const [relFilter, setRelFilter] = useState<'ALL' | 'PENDING_REVIEW' | 'APPROVED'>('PENDING_REVIEW');

  // Merges state
  const [duplicateCandidates, setDuplicateCandidates] = useState<any[]>([]);

  // Extraction dispatch state
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number | ''>('');
  const [extractorType, setExtractorType] = useState<'deterministic' | 'rule_based' | 'llm'>('deterministic');
  const [extracting, setExtracting] = useState(false);
  const [extractResult, setExtractResult] = useState<any | null>(null);

  const refreshAll = () => {
    setLoading(true);
    Promise.all([
      apiService.getGraphStats(),
      apiService.getGraphStatus(),
      apiService.searchEntities({ limit: 100 }),
      apiService.listRelationships({ limit: 150 }),
      apiService.listDuplicateCandidates(),
      apiService.getDocuments({ limit: 50 })
    ]).then(([stData, stStatus, entData, relData, dups, docs]) => {
      setStats(stData);
      setStatus(stStatus);
      setEntities(entData);
      setRelationships(relData);
      setDuplicateCandidates(dups);
      setDocuments(docs.items || []);
      setLoading(false);
    }).catch(err => {
      console.warn('Admin graph refresh failed:', err);
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleApproveRel = async (relId: number) => {
    try {
      await apiService.approveRelationship(relId);
      refreshAll();
    } catch (e) {
      alert('Failed to approve relationship');
    }
  };

  const handleRejectRel = async (relId: number) => {
    try {
      await apiService.rejectRelationship(relId);
      refreshAll();
    } catch (e) {
      alert('Failed to reject relationship');
    }
  };

  const handleCreateEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntity.canonical_name.trim()) return;
    try {
      await apiService.createEntity(newEntity as any);
      setNewEntityModal(false);
      setNewEntity({
        canonical_name: '',
        entity_type: 'Person',
        description: '',
        birth_date: '',
        death_date: '',
        location: '',
        verification_status: 'VERIFIED'
      });
      refreshAll();
    } catch (err: any) {
      alert(err.message || 'Failed to create entity');
    }
  };

  const handleProposeAndConfirmMerge = async (primaryId: number, dupId: number) => {
    try {
      const merge = await apiService.proposeEntityMerge(primaryId, dupId, 'Curator confirmed duplicate resolution');
      await apiService.reviewEntityMerge(merge.id, 'APPROVE');
      refreshAll();
    } catch (e: any) {
      alert(e.message || 'Failed to merge entities');
    }
  };

  const handleRunExtraction = async () => {
    if (!selectedDocId) return;
    setExtracting(true);
    setExtractResult(null);
    try {
      const res = await apiService.triggerGraphExtraction(selectedDocId as number, extractorType);
      setExtractResult(res);
      refreshAll();
    } catch (e: any) {
      alert(e.message || 'Extraction failed');
    } finally {
      setExtracting(false);
    }
  };

  const pendingRelationships = relationships.filter(r => r.verification_status === 'PENDING_REVIEW');
  const filteredRelationships = relationships.filter(r => {
    if (relFilter !== 'ALL' && r.verification_status !== relFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="font-serif font-bold text-2xl text-stone-900 flex items-center gap-2">
            <Network className="w-6 h-6 text-heritage-600" />
            Knowledge Graph Curation Workspace
          </h1>
          <p className="text-stone-500 text-xs mt-1">
            Curate canonical entities, review machine-extracted relationships, and inspect unbroken custodial provenance.
          </p>
        </div>

        <button
          onClick={refreshAll}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold self-start sm:self-auto transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Graph
        </button>
      </div>

      {/* Diagnostics / Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-stone-400 block uppercase text-[10px]">Graph Backend</span>
          <span className="text-sm font-bold text-stone-900 uppercase">
            {status?.backend || 'POSTGRES_FALLBACK'}
          </span>
          <span className="text-[10px] text-emerald-700 font-bold block mt-1">
            STATUS: {status?.status || 'OPERATIONAL'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-stone-400 block uppercase text-[10px]">Total Entities</span>
          <span className="text-2xl font-bold text-stone-900 font-serif">
            {stats?.total_entities || entities.length}
          </span>
          <span className="text-[10px] text-stone-500 block mt-1">Canonical Historical Nodes</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-stone-400 block uppercase text-[10px]">Total Relationships</span>
          <span className="text-2xl font-bold text-stone-900 font-serif">
            {stats?.total_relationships || relationships.length}
          </span>
          <span className="text-[10px] text-stone-500 block mt-1">Provenance Anchored Links</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-stone-400 block uppercase text-[10px]">Pending Curation</span>
          <span className={`text-2xl font-bold font-serif ${
            (stats?.pending_relationships || pendingRelationships.length) > 0 ? 'text-amber-600' : 'text-stone-900'
          }`}>
            {stats?.pending_relationships || pendingRelationships.length}
          </span>
          <span className="text-[10px] text-amber-700 block mt-1">Awaiting Scholar Verification</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-stone-200 text-xs font-bold gap-6">
        <button
          onClick={() => setActiveTab('relationships')}
          className={`pb-3 flex items-center gap-1.5 transition border-b-2 ${
            activeTab === 'relationships'
              ? 'border-heritage-600 text-heritage-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Relationship Curation Queue
          {pendingRelationships.length > 0 && (
            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {pendingRelationships.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('entities')}
          className={`pb-3 flex items-center gap-1.5 transition border-b-2 ${
            activeTab === 'entities'
              ? 'border-heritage-600 text-heritage-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Canonical Entities ({entities.length})
        </button>

        <button
          onClick={() => setActiveTab('merges')}
          className={`pb-3 flex items-center gap-1.5 transition border-b-2 ${
            activeTab === 'merges'
              ? 'border-heritage-600 text-heritage-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <GitMerge className="w-4 h-4" />
          Duplicate Merges ({duplicateCandidates.length})
        </button>

        <button
          onClick={() => setActiveTab('extract')}
          className={`pb-3 flex items-center gap-1.5 transition border-b-2 ${
            activeTab === 'extract'
              ? 'border-heritage-600 text-heritage-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Run Extraction Pipeline
        </button>
      </div>

      {/* Tab 1: Relationship Curation Queue */}
      {activeTab === 'relationships' && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-base text-stone-900">
              Relationship Verification & Provenance Queue
            </h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-400">Filter status:</span>
              <select
                value={relFilter}
                onChange={(e) => setRelFilter(e.target.value as any)}
                className="bg-stone-50 border border-stone-300 rounded px-2 py-1 text-xs text-stone-700"
              >
                <option value="PENDING_REVIEW">Pending Review</option>
                <option value="APPROVED">Approved</option>
                <option value="ALL">All Relationships</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-stone-200">
            {filteredRelationships.length === 0 ? (
              <p className="text-stone-400 text-xs italic py-8 text-center">
                No relationships matching current filter.
              </p>
            ) : (
              filteredRelationships.map(rel => (
                <div key={rel.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        {rel.relationship_type}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        rel.verification_status === 'APPROVED' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {rel.verification_status}
                      </span>
                      <span className="text-[10px] font-mono text-stone-400">
                        {rel.provenance_type} • Conf: {Math.round(rel.confidence * 100)}%
                      </span>
                    </div>

                    <p className="font-serif font-bold text-sm text-stone-900">
                      {rel.source_entity_name} → <span className="text-heritage-600">{rel.relationship_type}</span> → {rel.target_entity_name}
                    </p>

                    {rel.evidence_text && (
                      <p className="text-xs text-stone-600 italic bg-stone-50 p-2 rounded border border-stone-200">
                        "{rel.evidence_text}"
                      </p>
                    )}
                  </div>

                  {rel.verification_status === 'PENDING_REVIEW' && (
                    <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                      <button
                        onClick={() => handleApproveRel(rel.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1 shadow-xs transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleRejectRel(rel.id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-xs font-bold flex items-center gap-1 border border-rose-200 transition"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Entities Directory */}
      {activeTab === 'entities' && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={entitySearch}
                onChange={(e) => setEntitySearch(e.target.value)}
                placeholder="Search canonical entities..."
                className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
              />
            </div>

            <button
              onClick={() => setNewEntityModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-heritage-600 hover:bg-heritage-700 text-white rounded-lg text-xs font-bold shadow-xs transition self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" /> New Entity
            </button>
          </div>

          <div className="divide-y divide-stone-200 max-h-[600px] overflow-y-auto">
            {entities.map(ent => (
              <div key={ent.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700">
                      {ent.entity_type}
                    </span>
                    <h3 className="font-serif font-bold text-stone-900 text-sm">{ent.canonical_name}</h3>
                  </div>
                  {ent.description && (
                    <p className="text-stone-500 text-xs line-clamp-1 mt-0.5">{ent.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-stone-400 font-mono text-[11px]">
                  <span>#{ent.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Duplicate Merges */}
      {activeTab === 'merges' && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-serif font-bold text-base text-stone-900">
            Automated Duplicate Detection & Merge Review
          </h2>
          <p className="text-stone-500 text-xs">
            Entities sharing normalized naming patterns or identical aliases are queued here. Merging transfers all aliases and relationships to the primary record and marks the duplicate SUPERSEDED.
          </p>

          <div className="space-y-3 pt-2">
            {duplicateCandidates.length === 0 ? (
              <p className="text-stone-400 text-xs italic py-8 text-center">
                No suspected duplicates detected across canonical entities.
              </p>
            ) : (
              duplicateCandidates.map((dup, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="font-mono text-[10px] text-stone-400 block uppercase">Matching normalized token</span>
                    <span className="font-bold text-stone-800 font-mono">{dup.normalized_name}</span>
                    <p className="text-stone-600 mt-1">
                      Primary: <strong>{dup.primary_name}</strong> (#{dup.primary_entity_id}) ← Duplicate: <strong>{dup.duplicate_name}</strong> (#{dup.duplicate_entity_id})
                    </p>
                  </div>

                  <button
                    onClick={() => handleProposeAndConfirmMerge(dup.primary_entity_id, dup.duplicate_entity_id)}
                    className="px-3 py-1.5 bg-stone-900 hover:bg-black text-white rounded text-xs font-bold flex items-center gap-1 shrink-0"
                  >
                    <GitMerge className="w-3.5 h-3.5" /> Confirm Merge
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Run Extraction Pipeline */}
      {activeTab === 'extract' && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-5">
          <div>
            <h2 className="font-serif font-bold text-base text-stone-900">
              Run Machine Extraction Pipeline
            </h2>
            <p className="text-stone-500 text-xs">
              Execute deterministic catalog extraction, rule-based NER, or local Gemma 3 1B LLM extraction against any cataloged archival document.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-stone-700">Target Archival Document:</label>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(Number(e.target.value) || '')}
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded text-xs"
              >
                <option value="">Select Document...</option>
                {documents.map(d => (
                  <option key={d.id} value={d.id}>
                    #{d.id} • {d.title.slice(0, 50)}... ({d.archive_id})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-stone-700">Extraction Provider Method:</label>
              <select
                value={extractorType}
                onChange={(e) => setExtractorType(e.target.value as any)}
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded text-xs"
              >
                <option value="deterministic">Deterministic Catalog Extractor (100% Provenance)</option>
                <option value="rule_based">Rule-Based Gazetteer / NER (85% Conf)</option>
                <option value="llm">Local Gemma 3 1B LLM Extractor (Local Ollama Bridge)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleRunExtraction}
            disabled={!selectedDocId || extracting}
            className="px-4 py-2 bg-heritage-600 hover:bg-heritage-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition"
          >
            {extracting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Extracting Historical Entities...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Launch Extraction
              </>
            )}
          </button>

          {extractResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs space-y-1 font-mono">
              <p className="font-bold flex items-center gap-1.5 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Extraction Successful
              </p>
              <p>Entities Extracted: {extractResult.entities_extracted}</p>
              <p>Relationships Extracted: {extractResult.relationships_extracted}</p>
              <p>Status: {extractResult.status}</p>
            </div>
          )}
        </div>
      )}

      {/* Modal: New Entity */}
      {newEntityModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <h3 className="font-serif font-bold text-base text-stone-900">Create Canonical Graph Entity</h3>
              <button onClick={() => setNewEntityModal(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <form onSubmit={handleCreateEntity} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Canonical Name *</label>
                <input
                  type="text"
                  required
                  value={newEntity.canonical_name}
                  onChange={(e) => setNewEntity({ ...newEntity, canonical_name: e.target.value })}
                  placeholder="e.g. Dr. B. R. Ambedkar"
                  className="w-full p-2 border border-stone-300 rounded"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Entity Type</label>
                <select
                  value={newEntity.entity_type}
                  onChange={(e) => setNewEntity({ ...newEntity, entity_type: e.target.value })}
                  className="w-full p-2 border border-stone-300 rounded"
                >
                  <option value="Person">Person</option>
                  <option value="Document">Document</option>
                  <option value="Speech">Speech</option>
                  <option value="Event">Event</option>
                  <option value="Institution">Institution</option>
                  <option value="Topic">Topic</option>
                  <option value="Concept">Concept</option>
                  <option value="Place">Place</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Description / Biography</label>
                <textarea
                  rows={3}
                  value={newEntity.description}
                  onChange={(e) => setNewEntity({ ...newEntity, description: e.target.value })}
                  placeholder="Historical description..."
                  className="w-full p-2 border border-stone-300 rounded font-serif"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setNewEntityModal(false)}
                  className="px-3 py-1.5 bg-stone-100 text-stone-700 rounded font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-heritage-600 text-white rounded font-bold hover:bg-heritage-700"
                >
                  Save Entity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
