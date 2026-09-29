import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, CheckCircle2, Clock, AlertCircle, Search, ShieldCheck, 
  Upload, FileSpreadsheet, ShieldAlert, Trash2, RotateCcw, 
  Check, X, Eye, ExternalLink, RefreshCw, Hash, Copy
} from 'lucide-react';
import { apiService } from '../../services/api';
import { DocumentItem, VerificationStatus, IntegrityResult } from '../../types';
import { ArchivalBadge } from '../../components/archive/ArchivalBadge';
import { useAuth } from '../../context/AuthContext';

export const AdminDocumentsPage: React.FC = () => {
  const { role, isStaff } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Verification & Integrity Modals
  const [verifyingDoc, setVerifyingDoc] = useState<DocumentItem | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [targetStatus, setTargetStatus] = useState<VerificationStatus>('VERIFIED');
  
  const [integrityResult, setIntegrityResult] = useState<IntegrityResult | null>(null);
  const [isVerifyingIntegrity, setIsVerifyingIntegrity] = useState<number | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getDocuments({ page_size: 100 });
      setDocuments(res.items);
    } catch {
      // Fallback loaded automatically
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleOpenVerify = (doc: DocumentItem, status: VerificationStatus) => {
    setVerifyingDoc(doc);
    setTargetStatus(status);
    setVerificationNotes('');
    setErrorMessage(null);
  };

  const handleConfirmVerification = async () => {
    if (!verifyingDoc) return;
    try {
      const updated = await apiService.updateVerificationStatus(
        verifyingDoc.id, 
        targetStatus, 
        verificationNotes.trim() || undefined
      );
      setDocuments(prev => prev.map(d => d.id === updated.id ? { ...d, verification_status: updated.verification_status } : d));
      setStatusMessage(`Document #${verifyingDoc.id} (${verifyingDoc.archive_id}) status transitioned to ${targetStatus}. Recorded in audit log.`);
      setVerifyingDoc(null);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update verification status.');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleCheckIntegrity = async (doc: DocumentItem) => {
    setIsVerifyingIntegrity(doc.id);
    setErrorMessage(null);
    try {
      const res = await apiService.verifyDocumentIntegrity(doc.id);
      setIntegrityResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Integrity check failed.');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsVerifyingIntegrity(null);
    }
  };

  const handleSoftDelete = async (doc: DocumentItem) => {
    const reason = window.prompt(`Reason for soft-deleting document '${doc.title}' (${doc.archive_id}):`);
    if (reason === null) return; // User clicked Cancel

    try {
      await apiService.softDeleteDocument(doc.id, reason || 'Curatorial deletion');
      setStatusMessage(`Document #${doc.id} (${doc.archive_id}) soft-deleted.`);
      fetchDocuments();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete document.');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleRestore = async (doc: DocumentItem) => {
    try {
      await apiService.restoreDocument(doc.id);
      setStatusMessage(`Document #${doc.id} restored to active catalog.`);
      fetchDocuments();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to restore document.');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const filteredDocs = documents.filter(d => {
    const matchesSearch = 
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.archive_id.toLowerCase().includes(search.toLowerCase()) ||
      (d.source_identifier && d.source_identifier.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return !d.is_deleted;
    if (statusFilter === 'DELETED') return d.is_deleted;
    if (statusFilter === 'VERIFIED') return !d.is_deleted && d.verification_status === 'VERIFIED';
    if (statusFilter === 'UNVERIFIED') return !d.is_deleted && d.verification_status === 'UNVERIFIED';
    if (statusFilter === 'UNDER_REVIEW') return !d.is_deleted && (d.verification_status === 'UNDER_REVIEW' || d.verification_status === 'IN_REVIEW');
    if (statusFilter === 'REJECTED') return !d.is_deleted && d.verification_status === 'REJECTED';

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header with Ingestion CTA Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-300 pb-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900">
            Archival Document Catalog & Ingestion Controls
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Manage accession records, verify cryptographic checksums, curatorial review, and lifecycle controls.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/import"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold text-xs rounded-xl border border-stone-300 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-heritage-700" /> Batch Ingestion
          </Link>
          <Link
            to="/admin/documents/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-heritage-700 hover:bg-heritage-800 text-white font-bold text-xs rounded-xl shadow transition"
          >
            <Upload className="w-4 h-4" /> New Ingestion
          </Link>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-700" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Accession ID, Title, or Shelfmark..."
            className="w-full pl-9 pr-4 py-2 rounded-lg text-xs border border-stone-300 focus:outline-none focus:border-heritage-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white font-medium focus:outline-none focus:border-heritage-500"
          >
            <option value="ALL">Active Catalog (All)</option>
            <option value="VERIFIED">Verified Only</option>
            <option value="UNVERIFIED">Unverified / Ingested</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="REJECTED">Rejected</option>
            <option value="DELETED">Soft-Deleted Archive</option>
          </select>

          <span className="text-xs text-slate-500 font-mono ml-2">
            Count: {filteredDocs.length}
          </span>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1B2A4A] text-white uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="p-3.5">Accession ID / Shelfmark</th>
                <th className="p-3.5">Title & Creator</th>
                <th className="p-3.5">Type & Access</th>
                <th className="p-3.5">Integrity Check</th>
                <th className="p-3.5">Review Status</th>
                <th className="p-3.5 text-right">Archival Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className={`hover:bg-stone-50 transition ${doc.is_deleted ? 'opacity-60 bg-stone-100' : ''}`}>
                  <td className="p-3.5 font-mono whitespace-nowrap">
                    <div className="font-bold text-heritage-800">{doc.archive_id}</div>
                    {doc.source_identifier && (
                      <div className="text-[10px] text-slate-500 truncate max-w-[140px]" title={doc.source_identifier}>
                        {doc.source_identifier}
                      </div>
                    )}
                  </td>
                  <td className="p-3.5 max-w-sm">
                    <div className="font-serif font-bold text-ink-900 line-clamp-1">{doc.title}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <span>{doc.creator || doc.author_name || 'Dr. B. R. Ambedkar'}</span>
                      {doc.date && <span className="text-slate-400">• {doc.date}</span>}
                      {doc.is_demo_data && (
                        <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-mono font-bold">
                          DEMO
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 whitespace-nowrap space-y-1">
                    <div><ArchivalBadge type={doc.document_type} /></div>
                    <div className="text-[10px] font-mono text-slate-500">{doc.access_level || 'PUBLIC'}</div>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <button
                      onClick={() => handleCheckIntegrity(doc)}
                      disabled={isVerifyingIntegrity === doc.id}
                      className="flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-slate-700 border border-stone-300 transition"
                      title="Verify SHA-256 Checksum on Storage Disk"
                    >
                      {isVerifyingIntegrity === doc.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin text-heritage-600" />
                      ) : (
                        <ShieldCheck className="w-3 h-3 text-heritage-600" />
                      )}
                      Verify SHA-256
                    </button>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <ArchivalBadge status={doc.verification_status} variant="status" />
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap space-x-1">
                    {!doc.is_deleted ? (
                      <>
                        {/* Curatorial Review Actions */}
                        {(role === 'SUPER_ADMIN' || role === 'REVIEWER') && doc.verification_status !== 'VERIFIED' && (
                          <button
                            onClick={() => handleOpenVerify(doc, 'VERIFIED')}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition"
                            title="Approve and Mark VERIFIED"
                          >
                            Verify
                          </button>
                        )}
                        {(role === 'SUPER_ADMIN' || role === 'REVIEWER') && doc.verification_status === 'UNVERIFIED' && (
                          <button
                            onClick={() => handleOpenVerify(doc, 'UNDER_REVIEW')}
                            className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold transition"
                            title="Set UNDER_REVIEW"
                          >
                            Review
                          </button>
                        )}
                        {(role === 'SUPER_ADMIN' || role === 'REVIEWER') && doc.verification_status !== 'REJECTED' && (
                          <button
                            onClick={() => handleOpenVerify(doc, 'REJECTED')}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold transition"
                            title="Reject Ingestion"
                          >
                            Reject
                          </button>
                        )}

                        {/* Soft Delete */}
                        {(role === 'SUPER_ADMIN' || role === 'ARCHIVIST') && (
                          <button
                            onClick={() => handleSoftDelete(doc)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
                            title="Soft Delete Document"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        )}
                      </>
                    ) : (
                      /* Restore Deleted Record */
                      role === 'SUPER_ADMIN' && (
                        <button
                          onClick={() => handleRestore(doc)}
                          className="flex items-center gap-1 text-[11px] px-2.5 py-1 bg-heritage-700 hover:bg-heritage-800 text-white rounded font-bold transition ml-auto"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Restore
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Integrity Result Modal */}
      {integrityResult && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-serif font-bold text-base text-ink-900">
                  Cryptographic Integrity Verification
                </h3>
              </div>
              <button
                onClick={() => setIntegrityResult(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-slate-500 font-mono">Accession ID:</span>
                <span className="font-mono font-bold text-heritage-800">{integrityResult.archive_id}</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-slate-500">Integrity Status:</span>
                <span className={`px-2.5 py-0.5 rounded font-mono font-bold ${
                  integrityResult.integrity_status === 'VALID'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-rose-100 text-rose-900 border border-rose-300'
                }`}>
                  {integrityResult.integrity_status}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-mono">Recorded SHA-256 Hash:</span>
                <div className="font-mono text-[11px] bg-stone-50 p-2 rounded border border-stone-200 break-all">
                  {integrityResult.recorded_checksum || 'No checksum on record'}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-mono">Disk-Computed SHA-256 Hash:</span>
                <div className="font-mono text-[11px] bg-stone-50 p-2 rounded border border-stone-200 break-all">
                  {integrityResult.computed_checksum || 'Could not compute hash from file'}
                </div>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg text-slate-700 font-medium">
                {integrityResult.message}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-stone-200">
              <button
                onClick={() => setIntegrityResult(null)}
                className="px-4 py-2 bg-heritage-700 hover:bg-heritage-800 text-white font-bold rounded-lg text-xs transition"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Curatorial Verification Notes Modal */}
      {verifyingDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif font-bold text-base text-ink-900">
                Curatorial Peer Review: {targetStatus}
              </h3>
              <button
                onClick={() => setVerifyingDoc(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-ink-900">{verifyingDoc.title}</div>
              <div className="font-mono text-heritage-800">{verifyingDoc.archive_id}</div>
              <div className="text-slate-500">Source: {verifyingDoc.source_name} ({verifyingDoc.source_identifier})</div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Curatorial Review / Audit Notes:
              </label>
              <textarea
                rows={3}
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Details of provenance check, facsimile inspection, or editorial remarks..."
                className="w-full text-xs p-3 border border-stone-300 rounded-lg focus:outline-none focus:border-heritage-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-stone-200 text-xs">
              <button
                type="button"
                onClick={() => setVerifyingDoc(null)}
                className="px-4 py-2 text-slate-700 hover:bg-stone-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmVerification}
                className={`px-4 py-2 text-white font-bold rounded-lg shadow transition ${
                  targetStatus === 'VERIFIED'
                    ? 'bg-emerald-700 hover:bg-emerald-800'
                    : targetStatus === 'REJECTED'
                    ? 'bg-rose-700 hover:bg-rose-800'
                    : 'bg-amber-700 hover:bg-amber-800'
                }`}
              >
                Confirm {targetStatus}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
