import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Languages, ArrowLeft, CheckCircle2, XCircle, 
  Edit3, Shield, Info, AlertCircle, Save
} from 'lucide-react';
import { archiveApi } from '../../services/api';
import { TranslationItem, TranslationSideBySide } from '../../types';

export const AdminTranslationDetailPage: React.FC = () => {
  const { translationId } = useParams<{ translationId: string }>();
  const navigate = useNavigate();

  const [translation, setTranslation] = useState<TranslationItem | null>(null);
  const [sideBySide, setSideBySide] = useState<TranslationSideBySide | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit form state
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [reviewerNotes, setReviewerNotes] = useState('');

  useEffect(() => {
    if (translationId) {
      loadDetails(Number(translationId));
    }
  }, [translationId]);

  const loadDetails = async (id: number) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [trans, sbs] = await Promise.all([
        archiveApi.getTranslation(id),
        archiveApi.getTranslationSideBySide(id)
      ]);
      setTranslation(trans);
      setSideBySide(sbs);
      setEditedText(trans.translated_text);
      setReviewerNotes(trans.reviewer_notes || '');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load translation details');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (action: 'APPROVE' | 'REJECT' | 'EDIT_AND_APPROVE') => {
    if (!translation) return;
    setActionLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload: any = {
        action,
        reviewer_notes: reviewerNotes
      };
      if (action === 'EDIT_AND_APPROVE') {
        payload.edited_text = editedText;
      }

      const res = await archiveApi.reviewTranslation(translation.id, payload);
      setTranslation(res);
      setSuccessMessage(
        action === 'EDIT_AND_APPROVE'
          ? `Successfully saved edited translation as new version v${res.translation_version} (HUMAN_REVIEWED). Original machine translation preserved intact.`
          : action === 'APPROVE'
          ? 'Translation successfully marked as HUMAN_REVIEWED.'
          : 'Translation marked as REJECTED.'
      );
      setIsEditing(false);
      // Reload details if a new version was created
      if (action === 'EDIT_AND_APPROVE' && res.id !== translation.id) {
        navigate(`/admin/translations/${res.id}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Review action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs">
        <div className="w-6 h-6 border-2 border-heritage-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading translation review data...
      </div>
    );
  }

  if (!translation || !sideBySide) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Translation Not Found</h2>
        <Link to="/admin/translations" className="text-heritage-600 font-semibold text-xs inline-block">
          ← Return to Translations Index
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/translations')}
            className="p-2 hover:bg-stone-100 rounded-lg text-slate-600 transition"
            title="Back to list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-500">Translation #{translation.id}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                translation.status === 'HUMAN_REVIEWED' || translation.status === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : translation.status === 'REJECTED'
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {translation.status}
              </span>
              <span className="text-xs font-mono text-slate-400">v{translation.translation_version}</span>
            </div>
            <h1 className="text-xl font-serif font-bold text-ink-900 mt-1">
              Doc #{translation.document_id}: {sideBySide.document_title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">{translation.source_language}</span>
          <span className="text-slate-400">→</span>
          <span className="text-xs font-bold text-heritage-600">{translation.target_language}</span>
        </div>
      </div>

      {/* Provenance Chain Info */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs space-y-2">
        <span className="font-mono font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
          Provenance Chain (Condition 4 Compliant)
        </span>
        <div className="font-mono text-[11px] text-slate-600 flex flex-wrap items-center gap-2">
          <span className="bg-white px-2 py-1 rounded border">Translation #{translation.id} (v{translation.translation_version})</span>
          <span>→</span>
          <span className="bg-white px-2 py-1 rounded border">Text Version #{translation.ocr_text_version_id || 'Latest'}</span>
          <span>→</span>
          <span className="bg-white px-2 py-1 rounded border">OCR Page #{translation.ocr_page_id || 'Full Doc'}</span>
          <span>→</span>
          <span className="bg-white px-2 py-1 rounded border">Doc Version #{translation.document_version_id || 'Master'}</span>
          <span>→</span>
          <span className="bg-white px-2 py-1 rounded border">Document #{translation.document_id}</span>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-4 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 rounded-xl p-4 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Side-by-Side Review Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Original Archival Text */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-mono text-[10px] font-bold">
              ORIGINAL ARCHIVAL MASTER TEXT
            </span>
            <span className="text-xs text-slate-500 font-medium">{sideBySide.source_language}</span>
          </div>

          <div className="flex-1 max-h-[450px] overflow-y-auto p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs font-serif leading-relaxed text-slate-800 whitespace-pre-line">
            {sideBySide.original_text}
          </div>
        </div>

        {/* Right: Translation & Editorial Workspace */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
              translation.status === 'HUMAN_REVIEWED' || translation.status === 'APPROVED'
                ? 'bg-emerald-100 text-emerald-900'
                : 'bg-amber-100 text-amber-900'
            }`}>
              {translation.status} DERIVATIVE
            </span>
            <span className="text-xs text-slate-500 font-medium">{sideBySide.target_language}</span>
          </div>

          {isEditing ? (
            <textarea
              rows={14}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full flex-1 p-3 text-xs font-serif leading-relaxed bg-white border border-heritage-500 focus:ring-1 focus:ring-heritage-500 rounded-lg text-slate-900 focus:outline-none"
            />
          ) : (
            <div className="flex-1 max-h-[450px] overflow-y-auto p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs font-serif leading-relaxed text-slate-800 whitespace-pre-line">
              {translation.translated_title && (
                <h3 className="font-bold text-sm mb-2 text-ink-900 border-b border-stone-200 pb-1">
                  {translation.translated_title}
                </h3>
              )}
              {translation.translated_text}
            </div>
          )}

          {/* Reviewer Notes */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600 block">
              Scholarly Reviewer Notes & Revision Remarks:
            </label>
            <input
              type="text"
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              placeholder="e.g. Verified technical legal vocabulary and preserved historical context..."
              className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded text-slate-800 focus:outline-none focus:border-heritage-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-slate-800 rounded font-semibold text-xs flex items-center gap-1.5 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Translation Text</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditedText(translation.translated_text);
                }}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-slate-700 rounded text-xs transition"
              >
                Cancel Edit
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleReviewAction('REJECT')}
                disabled={actionLoading}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded font-semibold text-xs flex items-center gap-1 transition"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>

              {isEditing ? (
                <button
                  type="button"
                  onClick={() => handleReviewAction('EDIT_AND_APPROVE')}
                  disabled={actionLoading || !editedText.trim()}
                  className="px-4 py-1.5 bg-heritage-600 hover:bg-heritage-700 text-white rounded font-semibold text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save as v{translation.translation_version + 1} & Approve</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleReviewAction('APPROVE')}
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve as Human-Reviewed</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
