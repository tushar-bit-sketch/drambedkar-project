import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, AlertTriangle, CheckCircle2, ArrowLeft, RefreshCw, 
  FileCheck, HardDrive, Lock, AlertCircle
} from 'lucide-react';
import { mediaApi } from '../../services/mediaApi';
import { MediaAsset } from '../../types/media';

interface AuditResult {
  audited_at: string;
  total_assets: number;
  intact_count: number;
  tampered_count: number;
  missing_count: number;
  records: Array<{
    asset_id: number;
    title: string;
    expected_hash: string;
    computed_hash?: string;
    is_valid: boolean;
    status: string;
  }>;
}

export const AdminMediaIntegrityPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runAudit = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await mediaApi.runBulkIntegrityAudit();
      setAuditResult(res);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to complete media integrity audit.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAudit();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-300 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/media"
            className="p-2 rounded-lg hover:bg-stone-200 text-stone-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-ink-900">
              Archival Media Master Integrity & Tamper Audit
            </h1>
            <p className="text-xs text-slate-600">
              Cryptographic verification of immutable disk masters against stored SHA-256 accession fingerprints.
            </p>
          </div>
        </div>

        <button
          onClick={runAudit}
          disabled={loading}
          className="px-4 py-2 bg-national-700 hover:bg-national-800 text-white rounded-lg text-xs font-semibold shadow flex items-center gap-1.5 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Auditing Vault Masters...' : 'Run Vault Master Audit'}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Metrics Cards */}
      {auditResult && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-[11px] font-mono uppercase text-slate-500 block">Total Audited</span>
            <span className="font-serif font-bold text-2xl text-slate-900">{auditResult.total_assets}</span>
          </div>

          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm">
            <span className="text-[11px] font-mono uppercase text-emerald-700 block">Intact & Verified</span>
            <span className="font-serif font-bold text-2xl text-emerald-800">{auditResult.intact_count}</span>
          </div>

          <div className={`p-4 rounded-xl border shadow-sm ${
            auditResult.tampered_count > 0 ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-white border-stone-200'
          }`}>
            <span className="text-[11px] font-mono uppercase text-slate-500 block">Tampered Masters</span>
            <span className={`font-serif font-bold text-2xl ${auditResult.tampered_count > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
              {auditResult.tampered_count}
            </span>
          </div>

          <div className={`p-4 rounded-xl border shadow-sm ${
            auditResult.missing_count > 0 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-white border-stone-200'
          }`}>
            <span className="text-[11px] font-mono uppercase text-slate-500 block">Missing Files</span>
            <span className={`font-serif font-bold text-2xl ${auditResult.missing_count > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
              {auditResult.missing_count}
            </span>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-stone-200 flex justify-between items-center text-xs">
          <span className="font-bold text-ink-900 uppercase tracking-wider font-mono">
            Vault Integrity Audit Log
          </span>
          {auditResult && (
            <span className="text-slate-500 font-mono">
              Audited At: {new Date(auditResult.audited_at).toLocaleString()}
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-heritage-600 mb-2" />
            Computing SHA-256 checksums across disk vault...
          </div>
        ) : !auditResult || auditResult.records.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No audit records available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1B2A4A] text-white uppercase text-[10px] font-mono tracking-wider">
                <tr>
                  <th className="p-3.5">Asset</th>
                  <th className="p-3.5">Expected Accession SHA-256</th>
                  <th className="p-3.5">Live Vault Checksum</th>
                  <th className="p-3.5">Integrity Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {auditResult.records.map((r) => (
                  <tr key={r.asset_id} className="hover:bg-stone-50 transition">
                    <td className="p-3.5">
                      <div className="font-serif font-bold text-sm text-ink-900">{r.title}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Asset #{r.asset_id}</div>
                    </td>

                    <td className="p-3.5 font-mono text-[11px] text-slate-600 truncate max-w-xs">
                      {r.expected_hash}
                    </td>

                    <td className="p-3.5 font-mono text-[11px] text-slate-600 truncate max-w-xs">
                      {r.computed_hash || '—'}
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold inline-flex items-center gap-1 ${
                        r.is_valid
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {r.is_valid ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {r.status}
                      </span>
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
