import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Cpu, CheckCircle2, Clock, AlertTriangle, AlertCircle, 
  RotateCw, Plus, ArrowRight, ShieldCheck, Sliders, FileText,
  Layers, ChevronRight, Eye, RefreshCw
} from 'lucide-react';
import { apiService } from '../../services/api';
import { OCRJob, DocumentItem, OCRJobStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const AdminOCRPage: React.FC = () => {
  const { role } = useAuth();
  const [jobs, setJobs] = useState<OCRJob[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State for New Job
  const [selectedDocId, setSelectedDocId] = useState<number | ''>('');
  const [selectedEngine, setSelectedEngine] = useState<string>('PADDLEOCR');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [selectedProfile, setSelectedProfile] = useState<string>('STANDARD');

  // Polling for active jobs
  const fetchJobs = async () => {
    try {
      const data = await apiService.getOCRJobs({ status: statusFilter !== 'ALL' ? statusFilter : undefined });
      setJobs(data);
    } catch {
      // Fallback handled
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await apiService.getDocuments({ page_size: 100 });
      setDocuments(res.items);
      if (res.items.length > 0 && selectedDocId === '') {
        setSelectedDocId(res.items[0].id);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchJobs(), fetchDocuments()]).finally(() => setIsLoading(false));
  }, [statusFilter]);

  // Periodic refresh if any job is processing
  useEffect(() => {
    const hasActive = jobs.some(j => j.status === 'PROCESSING' || j.status === 'QUEUED');
    if (!hasActive) return;

    const timer = setInterval(() => {
      fetchJobs();
    }, 4000);

    return () => clearInterval(timer);
  }, [jobs]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocId) return;

    setIsCreating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    let prepConfig = {
      target_dpi: 300,
      grayscale: true,
      deskew: true,
      denoise: true,
      contrast_clahe: true,
      thresholding: false
    };

    if (selectedProfile === 'HIGH_CONTRAST') {
      prepConfig = { ...prepConfig, contrast_clahe: true, denoise: true };
    } else if (selectedProfile === 'AGGRESSIVE_DESKEW') {
      prepConfig = { ...prepConfig, deskew: true, thresholding: true };
    } else if (selectedProfile === 'FAST_DIRECT') {
      prepConfig = { target_dpi: 150, grayscale: false, deskew: false, denoise: false, contrast_clahe: false, thresholding: false };
    }

    try {
      const newJob = await apiService.createOCRJob({
        document_id: Number(selectedDocId),
        engine: selectedEngine,
        language: selectedLanguage,
        preprocessing_config: prepConfig
      });
      setSuccessMsg(`OCR Job #${newJob.id} successfully queued for processing.`);
      setShowCreateModal(false);
      fetchJobs();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to trigger OCR job.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRetryJob = async (jobId: number) => {
    try {
      await apiService.retryOCRJob(jobId);
      setSuccessMsg(`Job #${jobId} re-queued for processing.`);
      fetchJobs();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to retry job.');
    }
  };

  // Metrics calculation
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.status === 'PROCESSING' || j.status === 'QUEUED').length;
  const reviewRequiredJobs = jobs.filter(j => j.status === 'REVIEW_REQUIRED').length;
  const completedJobs = jobs.filter(j => j.status === 'COMPLETED').length;
  const avgConf = jobs.filter(j => j.avg_confidence !== null && j.avg_confidence !== undefined);
  const globalAvgConfidence = avgConf.length > 0 
    ? Math.round((avgConf.reduce((acc, j) => acc + (j.avg_confidence || 0), 0) / avgConf.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
              PHASE 3 DIGITIZATION
            </span>
            <span className="text-xs text-stone-500 font-mono">ISOLATED OCR LAYER</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mt-1">Archival OCR & Manuscript Processing</h1>
          <p className="text-sm text-stone-600">
            Convert scanned manuscripts, historical debates, and folios into reviewable, structured transcription layers.
          </p>
        </div>

        <button
          onClick={() => { setShowCreateModal(true); setErrorMsg(null); setSuccessMsg(null); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg shadow-sm text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Queue New OCR Job
        </button>
      </div>

      {/* Critical Integrity Notice Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-bold tracking-wide uppercase">Archival Integrity Rule: </span>
          <strong>OCR MODEL CONFIDENCE</strong> reflects mathematical character recognition confidence from the neural OCR engine, 
          <em> not historical or factual accuracy</em>. OCR output is permanently quarantined in a distinct derivative transcription layer 
          and is <strong>never automatically verified or published</strong> to public visitors without explicit archivist review and approval.
        </div>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-3.5 rounded-lg flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-xs underline ml-4">Dismiss</button>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm p-3.5 rounded-lg flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-xs underline ml-4">Dismiss</button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-xs">
          <div className="text-xs text-stone-500 uppercase tracking-wider font-medium">Total OCR Jobs</div>
          <div className="text-2xl font-bold font-serif text-stone-900 mt-1">{totalJobs}</div>
          <div className="text-xs text-stone-400 mt-1">Multi-page folio runs</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-xs">
          <div className="text-xs text-blue-600 uppercase tracking-wider font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Active In Pipeline
          </div>
          <div className="text-2xl font-bold font-serif text-stone-900 mt-1">{activeJobs}</div>
          <div className="text-xs text-stone-400 mt-1">Queued or Processing</div>
        </div>

        <div className="bg-white border border-amber-200 rounded-lg p-4 shadow-xs bg-amber-50/30">
          <div className="text-xs text-amber-800 uppercase tracking-wider font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Review Required
          </div>
          <div className="text-2xl font-bold font-serif text-amber-900 mt-1">{reviewRequiredJobs}</div>
          <div className="text-xs text-amber-700/80 mt-1">Awaiting scholar approval</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-xs">
          <div className="text-xs text-stone-500 uppercase tracking-wider font-medium">Avg OCR Model Confidence</div>
          <div className="text-2xl font-bold font-serif text-stone-900 mt-1">
            {globalAvgConfidence > 0 ? `${globalAvgConfidence}%` : 'N/A'}
          </div>
          <div className="text-xs text-stone-400 mt-1">Algorithmic recognition metric</div>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'PROCESSING', 'REVIEW_REQUIRED', 'COMPLETED', 'FAILED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
              statusFilter === st
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
        <button
          onClick={fetchJobs}
          title="Refresh Queue"
          className="ml-auto p-1.5 text-stone-500 hover:text-stone-800 rounded hover:bg-stone-100 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Jobs Queue Table */}
      <div className="bg-white border border-stone-200 rounded-lg shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-stone-500 text-sm flex flex-col items-center gap-2">
            <RotateCw className="w-6 h-6 animate-spin text-stone-400" />
            Loading archival OCR jobs...
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <Cpu className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="font-serif font-medium text-stone-800">No OCR jobs found</p>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              {statusFilter !== 'ALL' 
                ? `No jobs with status "${statusFilter}". Try selecting ALL.` 
                : 'Queue an OCR job on any document in the archive to begin folio digitization.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs text-stone-500 uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Job ID & Document</th>
                  <th className="py-3 px-4">Engine & Model</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Folio Progress</th>
                  <th className="py-3 px-4">OCR Model Confidence</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {jobs.map((job) => {
                  const pct = job.total_pages > 0 
                    ? Math.round((job.processed_pages / job.total_pages) * 100) 
                    : 0;

                  return (
                    <tr key={job.id} className="hover:bg-stone-50/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-stone-900 line-clamp-1">
                          {job.document_title || `Document #${job.document_id}`}
                        </div>
                        <div className="text-xs text-stone-400 font-mono mt-0.5">
                          Job #{job.id} • Doc #{job.document_id}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-stone-100 text-stone-800 text-xs font-mono">
                          <Cpu className="w-3 h-3 text-stone-500" />
                          {job.engine} {job.engine_version ? `v${job.engine_version}` : ''}
                        </div>
                        {job.model_name && (
                          <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                            {job.model_name}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-stone-700">
                        {job.language}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="w-32">
                          <div className="flex justify-between text-xs text-stone-600 mb-1">
                            <span>{job.processed_pages}/{job.total_pages} folios</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                job.status === 'FAILED' ? 'bg-red-500' :
                                job.status === 'PROCESSING' ? 'bg-blue-600 animate-pulse' :
                                job.status === 'REVIEW_REQUIRED' ? 'bg-amber-600' :
                                'bg-emerald-600'
                              }`} 
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {job.avg_confidence !== null && job.avg_confidence !== undefined ? (
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${
                              job.avg_confidence >= 0.85 
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : job.avg_confidence >= 0.70
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                            }`}>
                              {Math.round(job.avg_confidence * 100)}%
                            </span>
                            <span className="text-[10px] text-stone-400">
                              {job.avg_confidence >= 0.85 ? 'HIGH' : job.avg_confidence >= 0.70 ? 'MED' : 'LOW'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400 italic">Pending extraction</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          job.status === 'QUEUED' ? 'bg-stone-100 text-stone-700' :
                          job.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                          job.status === 'REVIEW_REQUIRED' ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold' :
                          job.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {job.status === 'REVIEW_REQUIRED' && <Clock className="w-3 h-3 text-amber-800" />}
                          {job.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                          {job.status === 'FAILED' && <AlertCircle className="w-3 h-3 text-red-700" />}
                          {job.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        {job.status === 'FAILED' && (
                          <button
                            onClick={() => handleRetryJob(job.id)}
                            className="text-xs text-amber-800 hover:text-amber-900 font-medium inline-flex items-center gap-1"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            Retry
                          </button>
                        )}

                        <Link
                          to={`/admin/ocr/${job.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-stone-100 hover:bg-stone-200 text-stone-800 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect Folios
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New OCR Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200 animate-in fade-in zoom-in duration-150">
            <div className="p-5 border-b border-stone-200 flex justify-between items-center bg-stone-50">
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-lg">Queue Archival OCR Job</h3>
                <p className="text-xs text-stone-500">Configure engine, language, and preprocessing profile</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-stone-400 hover:text-stone-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-5 space-y-4">
              {/* Document Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Target Archival Document *
                </label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(Number(e.target.value))}
                  required
                  className="w-full text-sm border border-stone-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-amber-800 focus:outline-none"
                >
                  <option value="" disabled>Select Document</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      [{d.archive_id}] {d.title} ({d.document_type})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-stone-400 mt-1">
                  The document's uploaded archival master file will be extracted and preprocessed.
                </p>
              </div>

              {/* OCR Engine Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  OCR Engine Provider *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEngine('PADDLEOCR')}
                    className={`p-3 text-left border rounded-lg transition ${
                      selectedEngine === 'PADDLEOCR'
                        ? 'border-amber-800 bg-amber-50/50 ring-1 ring-amber-800'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-semibold text-xs text-stone-900 flex items-center justify-between">
                      PaddleOCR
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono">DEFAULT</span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">PP-OCRv4 — optimal for complex layouts & multilingual Indic scripts</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedEngine('TESSERACT')}
                    className={`p-3 text-left border rounded-lg transition ${
                      selectedEngine === 'TESSERACT'
                        ? 'border-amber-800 bg-amber-50/50 ring-1 ring-amber-800'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-semibold text-xs text-stone-900">Tesseract OCR</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">v5.3.0 LSTM engine — standard archival baseline</div>
                  </button>
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Target Language *
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full text-sm border border-stone-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-amber-800 focus:outline-none"
                >
                  <option value="English">English (en)</option>
                  <option value="Marathi">Marathi (Devanagari - mr)</option>
                  <option value="Hindi">Hindi (Devanagari - hi)</option>
                </select>
              </div>

              {/* Preprocessing Profile */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Image Preprocessing Profile
                </label>
                <select
                  value={selectedProfile}
                  onChange={(e) => setSelectedProfile(e.target.value)}
                  className="w-full text-sm border border-stone-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-amber-800 focus:outline-none"
                >
                  <option value="STANDARD">Standard Archival (300 DPI, Grayscale, Deskew, Bilateral Denoise, CLAHE)</option>
                  <option value="HIGH_CONTRAST">High Contrast CLAHE (For aged, yellowed or faded historic paper)</option>
                  <option value="AGGRESSIVE_DESKEW">Deskew & Binarization (For skewed scans and angled folios)</option>
                  <option value="FAST_DIRECT">Verbatim Direct / Fast (No image enhancement filters)</option>
                </select>
                <div className="text-[11px] text-stone-500 bg-stone-50 p-2 rounded border border-stone-200 mt-2">
                  <strong>Master Isolation:</strong> All preprocessing derivatives are stored in separate folio paths. 
                  The original archival master remains unchanged.
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !selectedDocId}
                  className="px-4 py-2 bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
                >
                  {isCreating ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Queue OCR Run
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
