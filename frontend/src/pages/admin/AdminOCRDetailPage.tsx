import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Cpu, Clock, CheckCircle2, AlertTriangle, AlertCircle, 
  FileText, Sliders, ExternalLink, ChevronRight, RefreshCw, Eye
} from 'lucide-react';
import { apiService } from '../../services/api';
import { OCRJob, OCRPage } from '../../types';

export const AdminOCRDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<OCRJob | null>(null);
  const [pages, setPages] = useState<OCRPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    if (!jobId) return;
    setIsLoading(true);
    try {
      const [jobData, pagesData] = await Promise.all([
        apiService.getOCRJob(Number(jobId)),
        apiService.getOCRJobPages(Number(jobId))
      ]);
      setJob(jobData);
      setPages(pagesData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load OCR job folios.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [jobId]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-stone-500 text-sm">
        <RefreshCw className="w-6 h-6 animate-spin text-stone-400 mx-auto mb-2" />
        Loading OCR job folios...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-8 text-center text-stone-600">
        <p className="font-serif font-semibold text-lg">OCR Job #{jobId} not found.</p>
        <Link to="/admin/ocr" className="text-amber-800 underline text-sm mt-2 inline-block">
          Return to OCR Queue
        </Link>
      </div>
    );
  }

  const lowConfidencePages = pages.filter(p => p.is_low_confidence || p.confidence < 0.70);
  const approvedPages = pages.filter(p => p.status === 'APPROVED');
  const pendingReviewPages = pages.filter(p => p.status === 'REVIEW_REQUIRED' || p.status === 'PENDING' || p.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <Link to="/admin/ocr" className="hover:text-stone-800 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to OCR Queue
        </Link>
        <span>/</span>
        <span className="text-stone-800 font-medium">Job #{job.id} Folios</span>
      </div>

      {/* Header Info Banner */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                JOB #{job.id}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-amber-50 text-amber-900 border border-amber-200">
                {job.engine} {job.engine_version ? `v${job.engine_version}` : ''}
              </span>
              {job.model_name && (
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-stone-50 text-stone-600 border border-stone-200">
                  {job.model_name}
                </span>
              )}
              <span className="px-2 py-0.5 rounded text-xs bg-stone-50 text-stone-600 border border-stone-200">
                Lang: {job.language}
              </span>
            </div>

            <h1 className="text-xl font-serif font-bold text-stone-900 mt-2">
              {job.document_title || `Document #${job.document_id}`}
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Document Accession ID: <span className="font-mono text-stone-700">Doc #{job.document_id}</span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              job.status === 'REVIEW_REQUIRED' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
              job.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
              job.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800 animate-pulse' :
              'bg-red-100 text-red-800'
            }`}>
              {job.status === 'REVIEW_REQUIRED' && <Clock className="w-3.5 h-3.5 text-amber-800" />}
              {job.status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
              {job.status === 'FAILED' && <AlertCircle className="w-3.5 h-3.5 text-red-700" />}
              {job.status.replace('_', ' ')}
            </span>

            {job.avg_confidence !== null && job.avg_confidence !== undefined && (
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                  OCR MODEL CONFIDENCE
                </div>
                <div className="text-lg font-bold font-mono text-stone-900">
                  {Math.round(job.avg_confidence * 100)}%
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-stone-100">
          <div className="p-3 bg-stone-50 rounded-lg">
            <div className="text-xs text-stone-500">Total Folios</div>
            <div className="text-lg font-bold font-serif text-stone-900 mt-0.5">{job.total_pages}</div>
          </div>
          <div className="p-3 bg-stone-50 rounded-lg">
            <div className="text-xs text-stone-500">Processed</div>
            <div className="text-lg font-bold font-serif text-emerald-800 mt-0.5">{job.processed_pages}</div>
          </div>
          <div className="p-3 bg-stone-50 rounded-lg">
            <div className="text-xs text-stone-500">Approved Reviews</div>
            <div className="text-lg font-bold font-serif text-stone-900 mt-0.5">
              {approvedPages.length} / {job.total_pages}
            </div>
          </div>
          <div className="p-3 bg-stone-50 rounded-lg">
            <div className="text-xs text-amber-800 font-medium">Low Confidence Flags</div>
            <div className="text-lg font-bold font-serif text-amber-900 mt-0.5">{lowConfidencePages.length}</div>
          </div>
        </div>
      </div>

      {/* Low Confidence Warning Banner */}
      {lowConfidencePages.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <span className="font-bold">Attention Scholar/Reviewer: </span>
            {lowConfidencePages.length} {lowConfidencePages.length === 1 ? 'folio has' : 'folios have'} been flagged with 
            <strong> LOW OCR MODEL CONFIDENCE (&lt; 70%)</strong>. 
            Characters on these pages may have faded ink, skew, or dense typography. 
            Prioritize these folios for manual transcription inspection and correction.
          </div>
        </div>
      )}

      {/* Folios Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-serif font-bold text-stone-900">Extracted Page Folios</h2>
          <p className="text-xs text-stone-500">
            Inspect individual page transcriptions, side-by-side facsimiles, and revision histories.
          </p>
        </div>
        <div className="text-xs text-stone-500">
          Showing {pages.length} folios
        </div>
      </div>

      {/* Folio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map((page) => {
          const confPercent = Math.round(page.confidence * 100);
          const isLow = page.is_low_confidence || page.confidence < 0.70;

          return (
            <div
              key={page.id}
              className={`bg-white border rounded-xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between ${
                isLow ? 'border-amber-300 ring-1 ring-amber-200' : 'border-stone-200'
              }`}
            >
              {/* Card Top: Folio Header & Thumbnail */}
              <div>
                <div className="p-3.5 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm text-stone-900">
                      Folio #{page.page_number}
                    </span>
                    {isLow && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800 border border-red-200 flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        LOW CONF
                      </span>
                    )}
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                    page.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                    page.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    page.status === 'REVIEW_REQUIRED' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                    'bg-stone-100 text-stone-600'
                  }`}>
                    {page.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Folio Thumbnail / Image Derivative */}
                <div className="h-40 bg-stone-100 relative overflow-hidden flex items-center justify-center border-b border-stone-100">
                  {page.image_derivative_path ? (
                    <img
                      src={apiService.getOCRPageDerivativeUrl(page.id)}
                      alt={`Folio ${page.page_number} Preprocessed Derivative`}
                      className="w-full h-full object-contain p-2 hover:scale-105 transition duration-200"
                      onError={(e) => {
                        // Fallback placeholder if image stream is unavailable
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-center text-stone-400 p-4">
                      <FileText className="w-8 h-8 mx-auto mb-1 text-stone-300" />
                      <span className="text-xs">Native Digital Folio</span>
                    </div>
                  )}

                  {/* Confidence Badge Overlay */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded text-xs font-mono font-bold shadow-xs ${
                      confPercent >= 85 ? 'bg-emerald-600 text-white' :
                      confPercent >= 70 ? 'bg-amber-600 text-white' :
                      'bg-red-600 text-white'
                    }`}>
                      {confPercent}% CONF
                    </span>
                  </div>
                </div>

                {/* Text Snippet Preview */}
                <div className="p-3.5">
                  <div className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider mb-1">
                    TRANSCRIPTION EXTRACT
                  </div>
                  <p className="text-xs text-stone-700 font-serif line-clamp-3 leading-relaxed bg-stone-50/70 p-2.5 rounded border border-stone-100">
                    {page.cleaned_text || <em className="text-stone-400">No text recognized for this folio</em>}
                  </p>
                </div>
              </div>

              {/* Card Footer: Metadata & Review CTA */}
              <div className="p-3.5 pt-0">
                <div className="flex items-center justify-between text-[11px] text-stone-400 mb-3 pt-2 border-t border-stone-100">
                  <span>{page.dpi || 300} DPI • {page.processing_time_ms}ms</span>
                  <span>{page.blocks?.length || 0} text blocks</span>
                </div>

                <Link
                  to={`/admin/ocr/${job.id}/pages/${page.id}`}
                  className="w-full py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Review & Transcribe
                  <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
