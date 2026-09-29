import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, ZoomIn, ZoomOut, RotateCcw, Save, CheckCircle2, 
  XCircle, RotateCw, History, AlertTriangle, Cpu, Layers, 
  ChevronLeft, ChevronRight, FileText, Sliders, ShieldCheck, Check
} from 'lucide-react';
import { apiService } from '../../services/api';
import { OCRJob, OCRPage, OCRTextVersion } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const AdminOCRReviewPage: React.FC = () => {
  const { jobId, pageId } = useParams<{ jobId: string; pageId: string }>();
  const navigate = useNavigate();
  const { role, user } = useAuth();

  const [job, setJob] = useState<OCRJob | null>(null);
  const [allPages, setAllPages] = useState<OCRPage[]>([]);
  const [page, setPage] = useState<OCRPage | null>(null);
  const [activeText, setActiveText] = useState<string>('');
  const [changeSummary, setChangeSummary] = useState<string>('');
  const [selectedVersion, setSelectedVersion] = useState<OCRTextVersion | null>(null);

  // Facsimile Controls
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'PREPROCESSED' | 'RAW'>('PREPROCESSED');

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showRerunModal, setShowRerunModal] = useState<boolean>(false);
  const [rerunEngine, setRerunEngine] = useState<string>('PADDLEOCR');
  const [rerunLang, setRerunLang] = useState<string>('English');
  const [rerunProfile, setRerunProfile] = useState<string>('STANDARD');
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    if (!jobId || !pageId) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [jobData, pagesList, pageData] = await Promise.all([
        apiService.getOCRJob(Number(jobId)),
        apiService.getOCRJobPages(Number(jobId)),
        apiService.getOCRPage(Number(pageId))
      ]);
      setJob(jobData);
      setAllPages(pagesList);
      setPage(pageData);

      // Latest text
      const latestVer = pageData.versions && pageData.versions.length > 0 
        ? pageData.versions[pageData.versions.length - 1] 
        : null;
      
      const currentText = latestVer ? latestVer.text : (pageData.cleaned_text || pageData.raw_text || '');
      setActiveText(currentText);
      setSelectedVersion(latestVer);
      setRerunEngine(jobData.engine);
      setRerunLang(jobData.language);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load folio details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [jobId, pageId]);

  // Page navigation
  const currentIndex = allPages.findIndex(p => p.id === Number(pageId));
  const prevPage = currentIndex > 0 ? allPages[currentIndex - 1] : null;
  const nextPage = currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;

  const handleSaveCorrection = async () => {
    if (!pageId) return;
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const updated = await apiService.correctOCRPage(Number(pageId), {
        text: activeText,
        change_summary: changeSummary.trim() || 'Scholar transcript refinement'
      });
      setPage(updated);
      setChangeSummary('');
      setSuccessMsg('Human correction saved as a new version layer.');
      
      // Update selected version to latest
      if (updated.versions && updated.versions.length > 0) {
        setSelectedVersion(updated.versions[updated.versions.length - 1]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save correction.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!pageId) return;
    setIsSaving(true);
    try {
      const updated = await apiService.approveOCRPage(Number(pageId), {
        notes: reviewNotes.trim() || 'Verified by scholar review against archival master.'
      });
      setPage(updated);
      setSuccessMsg('Folio OCR transcription APPROVED.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to approve folio.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReject = async () => {
    if (!pageId) return;
    setIsSaving(true);
    try {
      const updated = await apiService.rejectOCRPage(Number(pageId), {
        notes: reviewNotes.trim() || 'Transcription rejected due to severe illegibility or fidelity issues.'
      });
      setPage(updated);
      setShowRejectModal(false);
      setSuccessMsg('Folio OCR transcription marked as REJECTED.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reject folio.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRerun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageId) return;
    setIsSaving(true);
    setErrorMsg(null);

    let prepConfig = {
      target_dpi: 300,
      grayscale: true,
      deskew: true,
      denoise: true,
      contrast_clahe: true,
      thresholding: false
    };

    if (rerunProfile === 'HIGH_CONTRAST') {
      prepConfig = { ...prepConfig, contrast_clahe: true, denoise: true };
    } else if (rerunProfile === 'AGGRESSIVE_DESKEW') {
      prepConfig = { ...prepConfig, deskew: true, thresholding: true };
    } else if (rerunProfile === 'FAST_DIRECT') {
      prepConfig = { target_dpi: 150, grayscale: false, deskew: false, denoise: false, contrast_clahe: false, thresholding: false };
    }

    try {
      const updated = await apiService.rerunOCRPage(Number(pageId), {
        engine: rerunEngine,
        language: rerunLang,
        preprocessing_config: prepConfig
      });
      setPage(updated);
      setShowRerunModal(false);
      setSuccessMsg(`Folio re-run complete with ${rerunEngine}.`);
      
      if (updated.versions && updated.versions.length > 0) {
        const latest = updated.versions[updated.versions.length - 1];
        setSelectedVersion(latest);
        setActiveText(latest.text);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to re-run OCR on page.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center text-stone-500 text-sm">
        <RotateCw className="w-6 h-6 animate-spin text-stone-400 mx-auto mb-2" />
        Loading split-screen review workspace...
      </div>
    );
  }

  if (!page || !job) {
    return (
      <div className="p-8 text-center text-stone-600">
        <p className="font-serif font-semibold text-lg">Folio #{pageId} not found.</p>
        <Link to={`/admin/ocr/${jobId}`} className="text-amber-800 underline text-sm mt-2 inline-block">
          Return to Job Folios
        </Link>
      </div>
    );
  }

  const confPercent = Math.round(page.confidence * 100);
  const isLowConf = page.is_low_confidence || page.confidence < 0.70;

  const currentImageUrl = viewMode === 'PREPROCESSED'
    ? apiService.getOCRPageDerivativeUrl(page.id)
    : apiService.getOCRPageOriginalImageUrl(page.id);

  return (
    <div className="space-y-4">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to={`/admin/ocr/${job.id}`}
            className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 transition"
            title="Back to Job Folios"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-base text-stone-900">
                Folio #{page.page_number} of {job.total_pages}
              </h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                page.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                page.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                page.status === 'REVIEW_REQUIRED' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                'bg-stone-100 text-stone-600'
              }`}>
                {page.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-stone-500 truncate max-w-md">
              {job.document_title || `Document #${job.document_id}`}
            </p>
          </div>
        </div>

        {/* Folio Step Navigator */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            disabled={!prevPage}
            onClick={() => prevPage && navigate(`/admin/ocr/${job.id}/pages/${prevPage.id}`)}
            className="p-1.5 rounded border border-stone-200 disabled:opacity-30 hover:bg-stone-50 text-stone-600 transition text-xs flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>

          <span className="text-xs font-mono text-stone-500 px-1">
            {page.page_number} / {job.total_pages}
          </span>

          <button
            disabled={!nextPage}
            onClick={() => nextPage && navigate(`/admin/ocr/${job.id}/pages/${nextPage.id}`)}
            className="p-1.5 rounded border border-stone-200 disabled:opacity-30 hover:bg-stone-50 text-stone-600 transition text-xs flex items-center gap-1"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* OCR Confidence Warning & Archival Layer Banner */}
      <div className={`p-3.5 rounded-xl border flex items-start gap-3 shadow-xs ${
        isLowConf 
          ? 'bg-amber-50 border-amber-300 text-amber-950' 
          : 'bg-stone-50 border-stone-200 text-stone-800'
      }`}>
        <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${isLowConf ? 'text-amber-700' : 'text-stone-500'}`} />
        <div className="text-xs leading-relaxed">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold tracking-wider uppercase text-[11px]">
              OCR MODEL CONFIDENCE: {confPercent}% ({page.confidence_category})
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-white/70 border border-stone-200">
              Engine: {job.engine} {job.engine_version ? `v${job.engine_version}` : ''}
            </span>
          </div>
          <div>
            This metric indicates machine character probability, <strong>never historical veracity</strong>. 
            All edits saved here create an immutable <em>Scholar Correction Layer (V2+)</em> while preserving 
            the initial machine OCR and archival master unchanged.
          </div>
        </div>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded-lg flex justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="underline ml-2">Dismiss</button>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg flex justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="underline ml-2">Dismiss</button>
        </div>
      )}

      {/* Main Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start min-h-[620px]">
        {/* LEFT PANE (5 cols): Archival Facsimile Viewer */}
        <div className="lg:col-span-6 bg-stone-900 rounded-xl overflow-hidden shadow-sm flex flex-col h-[720px] border border-stone-700">
          {/* Facsimile Toolbar */}
          <div className="bg-stone-800/90 px-3.5 py-2 flex items-center justify-between border-b border-stone-700 text-xs text-stone-300">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setViewMode('PREPROCESSED')}
                className={`px-2.5 py-1 rounded text-xs transition ${
                  viewMode === 'PREPROCESSED' 
                    ? 'bg-amber-800 text-white font-medium shadow-xs' 
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Preprocessed Folio
              </button>
              <button
                onClick={() => setViewMode('RAW')}
                className={`px-2.5 py-1 rounded text-xs transition ${
                  viewMode === 'RAW' 
                    ? 'bg-amber-800 text-white font-medium shadow-xs' 
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Raw Archival Master
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.2))}
                className="p-1 rounded hover:bg-stone-700 text-stone-300"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-mono text-[11px] w-12 text-center text-stone-400">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.2))}
                className="p-1 rounded hover:bg-stone-700 text-stone-300"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 rounded hover:bg-stone-700 text-stone-400 ml-1"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Facsimile Canvas Viewport */}
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-stone-950 relative">
            <div 
              className="transition-transform duration-100 ease-out origin-top flex items-center justify-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <img
                src={currentImageUrl}
                alt={`Folio ${page.page_number} Master Facsimile`}
                className="max-w-full h-auto object-contain rounded shadow-lg select-none"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/placeholder_document.png';
                }}
              />
            </div>

            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-[10px] text-stone-300 px-2 py-1 rounded font-mono">
              Folio #{page.page_number} • {page.width}x{page.height}px • {page.dpi} DPI
            </div>
          </div>
        </div>

        {/* RIGHT PANE (6 cols): Structured Transcription Editor & Version History */}
        <div className="lg:col-span-6 flex flex-col h-[720px] space-y-4">
          {/* Editor Container */}
          <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs flex-1 flex flex-col">
            {/* Header with Version Selector */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-stone-600" />
                <span className="font-serif font-bold text-stone-900 text-sm">
                  Transcription Layer
                </span>
                {selectedVersion && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                    Viewing V{selectedVersion.version_number}
                  </span>
                )}
              </div>

              {/* Version dropdown */}
              {page.versions && page.versions.length > 1 && (
                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <History className="w-3.5 h-3.5 text-stone-400" />
                  <select
                    value={selectedVersion?.id || ''}
                    onChange={(e) => {
                      const v = page.versions?.find(ver => ver.id === Number(e.target.value));
                      if (v) {
                        setSelectedVersion(v);
                        setActiveText(v.text);
                      }
                    }}
                    className="text-xs border border-stone-200 rounded px-2 py-1 bg-stone-50 text-stone-800"
                  >
                    {page.versions.map((ver) => (
                      <option key={ver.id} value={ver.id}>
                        Version {ver.version_number} {ver.version_number === 1 ? '(Machine OCR)' : '(Human Review)'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Editable Text Area */}
            <div className="flex-1 mt-3 flex flex-col">
              <textarea
                value={activeText}
                onChange={(e) => setActiveText(e.target.value)}
                placeholder="Editable transcription text..."
                className="w-full flex-1 p-3.5 border border-stone-200 rounded-lg text-sm font-serif leading-relaxed text-stone-900 focus:ring-2 focus:ring-amber-800 focus:outline-none resize-none bg-stone-50/40"
              />

              {/* Text Statistics */}
              <div className="flex justify-between items-center text-[11px] text-stone-400 pt-2 px-1">
                <span>{activeText.split(/\s+/).filter(Boolean).length} words • {activeText.length} characters</span>
                <span>Original file remains immutable</span>
              </div>
            </div>

            {/* Change Summary Input for Scholar Refinement */}
            <div className="mt-3 pt-3 border-t border-stone-100">
              <label className="block text-[11px] font-semibold text-stone-600 uppercase tracking-wider mb-1">
                Revision Note / Change Summary
              </label>
              <input
                type="text"
                value={changeSummary}
                onChange={(e) => setChangeSummary(e.target.value)}
                placeholder="e.g. Corrected character misrecognitions on paragraph 2"
                className="w-full text-xs border border-stone-200 rounded-lg px-3 py-2 bg-stone-50 focus:ring-1 focus:ring-amber-800 focus:outline-none"
              />
            </div>

            {/* Action Bar */}
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRerunModal(true)}
                  className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition flex items-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Re-run Folio OCR
                </button>

                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition flex items-center gap-1.5 border border-red-200"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={isSaving}
                  onClick={handleSaveCorrection}
                  className="px-3.5 py-1.5 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Correction (V{((page.versions?.length || 1) + 1)})
                </button>

                <button
                  disabled={isSaving || page.status === 'APPROVED'}
                  onClick={handleApprove}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 rounded-lg transition flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {page.status === 'APPROVED' ? 'Approved' : 'Approve OCR Text'}
                </button>
              </div>
            </div>
          </div>

          {/* Version History & Audit Log Card */}
          <div className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-xs max-h-48 overflow-y-auto">
            <div className="text-xs font-bold text-stone-900 mb-2 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-stone-500" />
              Folio Transcription Version Stack ({page.versions?.length || 0})
            </div>

            <div className="space-y-2">
              {page.versions && page.versions.map((ver) => (
                <div 
                  key={ver.id}
                  onClick={() => {
                    setSelectedVersion(ver);
                    setActiveText(ver.text);
                  }}
                  className={`p-2 rounded-lg text-xs cursor-pointer border transition flex items-start justify-between ${
                    selectedVersion?.id === ver.id
                      ? 'border-amber-700 bg-amber-50/50'
                      : 'border-stone-100 hover:bg-stone-50'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                      <span>V{ver.version_number}</span>
                      <span className="font-mono text-[10px] text-stone-500 font-normal">
                        ({ver.engine})
                      </span>
                      {ver.version_number === 1 && (
                        <span className="text-[10px] bg-stone-100 px-1 py-0.2 rounded text-stone-600 font-mono">
                          INITIAL OCR
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-600 mt-0.5">
                      {ver.change_summary || 'Generated by archival pipeline'}
                    </div>
                  </div>

                  <div className="text-[10px] text-stone-400 font-mono">
                    {new Date(ver.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Re-run Page OCR */}
      {showRerunModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200 animate-in fade-in zoom-in duration-150">
            <div className="p-4 border-b border-stone-200 bg-stone-50 flex justify-between items-center">
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-sm">Re-run OCR for Folio #{page.page_number}</h3>
                <p className="text-[11px] text-stone-500">Configure engine, language, and preprocessing for this specific page</p>
              </div>
              <button onClick={() => setShowRerunModal(false)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>

            <form onSubmit={handleRerun} className="p-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase mb-1">
                  OCR Engine
                </label>
                <select
                  value={rerunEngine}
                  onChange={(e) => setRerunEngine(e.target.value)}
                  className="w-full text-xs border border-stone-300 rounded p-2"
                >
                  <option value="PADDLEOCR">PaddleOCR (PP-OCRv4 Multilingual)</option>
                  <option value="TESSERACT">Tesseract OCR (v5.3.0 LSTM)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase mb-1">
                  Language
                </label>
                <select
                  value={rerunLang}
                  onChange={(e) => setRerunLang(e.target.value)}
                  className="w-full text-xs border border-stone-300 rounded p-2"
                >
                  <option value="English">English</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase mb-1">
                  Preprocessing Profile
                </label>
                <select
                  value={rerunProfile}
                  onChange={(e) => setRerunProfile(e.target.value)}
                  className="w-full text-xs border border-stone-300 rounded p-2"
                >
                  <option value="STANDARD">Standard Archival (300 DPI + CLAHE + Deskew)</option>
                  <option value="HIGH_CONTRAST">High Contrast CLAHE (For faded manuscripts)</option>
                  <option value="AGGRESSIVE_DESKEW">Aggressive Deskew & Binarization</option>
                  <option value="FAST_DIRECT">Verbatim Direct / Fast</option>
                </select>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRerunModal(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded text-xs font-semibold flex items-center gap-1"
                >
                  {isSaving ? <RotateCw className="w-3 h-3 animate-spin" /> : <RotateCw className="w-3 h-3" />}
                  Execute Re-run
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reject Folio */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200">
            <div className="p-4 border-b border-stone-200 bg-red-50 text-red-900">
              <h3 className="font-serif font-bold text-sm">Reject Folio Transcription</h3>
              <p className="text-[11px] text-red-700">Flag this page transcription as rejected with curator reason</p>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase mb-1">
                  Rejection Reason *
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g. Scanned folio too degraded; physical rescan required."
                  rows={3}
                  className="w-full text-xs border border-stone-300 rounded p-2 focus:ring-1 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-3 py-1.5 text-xs text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleReject}
                  className="px-3.5 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded text-xs font-semibold"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
