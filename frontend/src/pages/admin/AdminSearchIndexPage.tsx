import React, { useState, useEffect } from 'react';
import { 
  Database, Cpu, RefreshCw, CheckCircle2, AlertTriangle, 
  Layers, BarChart2, Shield, Activity, Clock, Play, FileText, Check
} from 'lucide-react';
import { archiveApi } from '../../services/api';
import { SearchIndexStatus, SearchEvaluationReport, SearchIndexJob } from '../../types';

export const AdminSearchIndexPage: React.FC = () => {
  const [statusData, setStatusData] = useState<SearchIndexStatus | null>(null);
  const [evalData, setEvalData] = useState<SearchEvaluationReport | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [runningEval, setRunningEval] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const data = await archiveApi.getSearchIndexStatus();
      setStatusData(data);
    } catch (err) {
      console.error("Failed fetching index status:", err);
    } finally {
      setLoadingStatus(false);
    }
  };

  const fetchEvaluation = async () => {
    setRunningEval(true);
    try {
      const report = await archiveApi.getSearchEvaluation();
      setEvalData(report);
    } catch (err) {
      console.error("Failed running evaluation benchmark:", err);
    } finally {
      setRunningEval(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleRebuildIndex = async () => {
    setRebuilding(true);
    setActionMessage(null);
    try {
      const res = await archiveApi.rebuildSearchIndex();
      setActionMessage(`Index rebuild completed: ${res.completed_documents} of ${res.total_documents} documents indexed.`);
      fetchStatus();
    } catch (err: any) {
      setActionMessage(`Rebuild failed: ${err.message}`);
    } finally {
      setRebuilding(false);
    }
  };

  const isVectorProduction = statusData?.is_vector_backend_production || false;
  const isModelReady = statusData?.embedding_model_status === 'READY';

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-heritage-600 text-xs font-mono tracking-wider uppercase font-semibold">
            <Database className="w-4 h-4" />
            Phase 4 Search Infrastructure Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#102038] mt-1">
            Search & Vector Index Health
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-serif mt-1">
            Monitor dense vector representations, pgvector backend status, and information retrieval evaluation benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchStatus}
            disabled={loadingStatus}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3.5 py-2 rounded-lg text-xs font-semibold transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>

          <button
            onClick={handleRebuildIndex}
            disabled={rebuilding}
            className="flex items-center gap-1.5 bg-[#102038] hover:bg-[#1B2A4A] text-white px-4 py-2 rounded-lg text-xs font-semibold transition shadow-sm"
          >
            <Play className={`w-3.5 h-3.5 ${rebuilding ? 'animate-spin' : ''}`} />
            <span>{rebuilding ? 'Rebuilding Index...' : 'Rebuild Search Index'}</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Backend Architecture Notice Banner (Conditions 1, 2, 9, 10) */}
      {!isVectorProduction ? (
        <div className="bg-amber-50 border-2 border-amber-400/80 rounded-xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h4 className="font-bold text-amber-900 uppercase font-mono tracking-wide text-sm">
                Active Architecture: SQLite Vector Development Fallback
              </h4>
              <p className="text-amber-800 font-serif leading-relaxed">
                The platform is currently operating in <strong>DEVELOPMENT/TEST ONLY</strong> vector mode. 
                Exact cosine dot-products are computed on serialized float32 binary arrays in SQLite. 
                In production deployment, <strong>PostgreSQL + pgvector</strong> is the mandatory primary vector backend. 
                Silent fallback to SQLite in production is strictly prohibited by archival integrity condition #10.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h4 className="font-bold text-emerald-900 uppercase font-mono tracking-wide text-sm">
                Active Architecture: PostgreSQL + pgvector (Production Grade)
              </h4>
              <p className="text-emerald-800 font-serif leading-relaxed">
                Production vector storage is fully enabled. HNSW/IVFFlat index structures handle multi-lingual 
                BGE-M3 candidate vector retrieval.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Model & Hardware Diagnostic Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Vector Store Card */}
        <div className="bg-white rounded-xl border border-heritage-300 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-slate-500 uppercase font-semibold">Vector Store</span>
            <Database className="w-4 h-4 text-heritage-600" />
          </div>
          <div>
            <div className="font-serif font-bold text-base text-[#102038]">
              {statusData?.vector_backend || 'SQLITE_DEV_FALLBACK'}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              Tier: {isVectorProduction ? 'PRODUCTION' : 'LOCAL_DEVELOPMENT_FALLBACK'}
            </div>
          </div>
        </div>

        {/* Embedding Model Card */}
        <div className="bg-white rounded-xl border border-heritage-300 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-slate-500 uppercase font-semibold">Embedding Model</span>
            <Cpu className="w-4 h-4 text-heritage-600" />
          </div>
          <div>
            <div className="font-serif font-bold text-base text-[#102038]">
              {statusData?.embedding_model_name || 'BAAI/bge-m3'}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                isModelReady ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
              }`}>
                {statusData?.embedding_model_status || 'MODEL_UNAVAILABLE'}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Dim: {statusData?.embedding_dimension || 'Verified at runtime'}
              </span>
            </div>
          </div>
        </div>

        {/* Reranker Model Card */}
        <div className="bg-white rounded-xl border border-heritage-300 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-slate-500 uppercase font-semibold">Reranker Model</span>
            <Activity className="w-4 h-4 text-heritage-600" />
          </div>
          <div>
            <div className="font-serif font-bold text-base text-[#102038]">
              BAAI/bge-reranker-v2-m3
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              Mode: Transparent Degraded (Zero Fake Scores)
            </div>
          </div>
        </div>
      </div>

      {/* Index Metrics Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-heritage-300 p-4 shadow-sm text-center">
          <div className="text-2xl font-bold font-serif text-[#102038]">{statusData?.total_documents || 0}</div>
          <div className="text-xs text-slate-500 font-mono mt-1 uppercase">Active Documents</div>
        </div>
        <div className="bg-white rounded-xl border border-heritage-300 p-4 shadow-sm text-center">
          <div className="text-2xl font-bold font-serif text-heritage-700">{statusData?.total_chunks || 0}</div>
          <div className="text-xs text-slate-500 font-mono mt-1 uppercase">Folio Chunks</div>
        </div>
        <div className="bg-white rounded-xl border border-heritage-300 p-4 shadow-sm text-center">
          <div className="text-2xl font-bold font-serif text-emerald-700">{statusData?.indexed_chunks || 0}</div>
          <div className="text-xs text-slate-500 font-mono mt-1 uppercase">Indexed Passages</div>
        </div>
        <div className="bg-white rounded-xl border border-heritage-300 p-4 shadow-sm text-center">
          <div className="text-2xl font-bold font-serif text-blue-700">{statusData?.verified_chunks || 0}</div>
          <div className="text-xs text-slate-500 font-mono mt-1 uppercase">Verified Passages</div>
        </div>
      </div>

      {/* Quality Benchmark Section */}
      <div className="bg-white rounded-xl border border-heritage-300 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-heritage-200">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#102038] flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-heritage-600" />
              Information Retrieval Quality Benchmark
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-serif">
              Measures Mean Reciprocal Rank (MRR), Precision@K, and Latency across retrieval channels against authentic archival ground-truth.
            </p>
          </div>

          <button
            onClick={fetchEvaluation}
            disabled={runningEval}
            className="flex items-center gap-1.5 bg-heritage-600 hover:bg-heritage-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm self-start sm:self-auto"
          >
            <Play className={`w-3.5 h-3.5 ${runningEval ? 'animate-spin' : ''}`} />
            <span>{runningEval ? 'Running Benchmark...' : 'Run IR Evaluation'}</span>
          </button>
        </div>

        {evalData ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F0] border-b border-heritage-200 font-mono text-slate-700 uppercase text-[11px]">
                    <th className="p-3">Retrieval Pipeline</th>
                    <th className="p-3 text-right">MRR</th>
                    <th className="p-3 text-right">Precision@1</th>
                    <th className="p-3 text-right">Precision@3</th>
                    <th className="p-3 text-right">Precision@5</th>
                    <th className="p-3 text-right">Avg Latency (ms)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-heritage-100">
                  {Object.entries(evalData.metrics_by_mode).map(([mKey, metrics]) => (
                    <tr key={mKey} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold uppercase text-[#102038]">
                        {mKey}
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-heritage-800">
                        {metrics.mrr.toFixed(4)}
                      </td>
                      <td className="p-3 text-right font-mono">
                        {(metrics.precision_at_1 * 100).toFixed(1)}%
                      </td>
                      <td className="p-3 text-right font-mono">
                        {(metrics.precision_at_3 * 100).toFixed(1)}%
                      </td>
                      <td className="p-3 text-right font-mono">
                        {(metrics.precision_at_5 * 100).toFixed(1)}%
                      </td>
                      <td className="p-3 text-right font-mono text-slate-600">
                        {metrics.avg_latency_ms.toFixed(1)} ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-slate-500 font-serif text-xs italic">
              {evalData.evaluation_notice}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-[#FAF7F0] rounded-lg border border-dashed border-heritage-300">
            <Activity className="w-8 h-8 text-heritage-400 mx-auto mb-2 opacity-70" />
            <div className="font-serif font-semibold text-slate-700 text-sm">
              Benchmark Not Yet Executed In This Session
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-serif">
              Click "Run IR Evaluation" to benchmark Precision@K, Recall@K, and MRR across real archival queries.
            </p>
          </div>
        )}
      </div>

      {/* Recent Indexing Jobs Log Table */}
      <div className="bg-white rounded-xl border border-heritage-300 shadow-sm p-6 space-y-4">
        <h3 className="font-serif font-bold text-lg text-[#102038] flex items-center gap-2">
          <Clock className="w-5 h-5 text-heritage-600" />
          Recent Indexing Job Records
        </h3>

        {statusData?.recent_jobs && statusData.recent_jobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF7F0] border-b border-heritage-200 font-mono text-slate-700 uppercase text-[11px]">
                  <th className="p-3">Job ID</th>
                  <th className="p-3">Document</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Total Chunks</th>
                  <th className="p-3 text-right">Indexed</th>
                  <th className="p-3">Embedding Model</th>
                  <th className="p-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-heritage-100">
                {statusData.recent_jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono text-slate-500">#{job.id}</td>
                    <td className="p-3 font-medium text-slate-800">
                      {job.document_id ? `Document #${job.document_id}` : 'Catalog Bulk'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        job.status === 'COMPLETED' 
                          ? 'bg-emerald-100 text-emerald-900' 
                          : job.status === 'RUNNING'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-red-100 text-red-900'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono">{job.total_chunks}</td>
                    <td className="p-3 text-right font-mono font-semibold text-emerald-700">
                      {job.indexed_chunks}
                    </td>
                    <td className="p-3 font-mono text-slate-600">{job.embedding_model || 'BAAI/bge-m3'}</td>
                    <td className="p-3 font-mono text-slate-500">
                      {job.created_at ? new Date(job.created_at).toLocaleTimeString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-500 font-serif">
            No recent indexing jobs logged in this database session.
          </div>
        )}
      </div>
    </div>
  );
};
