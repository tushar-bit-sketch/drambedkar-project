import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Film, Upload, Volume2, Image as ImageIcon, Shield, CheckCircle, 
  AlertTriangle, RefreshCw, FileText, Search, Play, CheckCircle2,
  HardDrive, Lock, ExternalLink
} from 'lucide-react';
import { mediaApi } from '../../services/mediaApi';
import { MediaAsset, MediaDiagnostics } from '../../types/media';

export const AdminMediaPage: React.FC = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [diagnostics, setDiagnostics] = useState<MediaDiagnostics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState('ALL');
  const [integrityChecking, setIntegrityChecking] = useState<number | null>(null);
  const [integrityMsg, setIntegrityMsg] = useState<{ id: number; ok: boolean; msg: string } | null>(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      mediaApi.getMediaList({
        media_type: mediaTypeFilter === 'ALL' ? undefined : mediaTypeFilter,
      }),
      mediaApi.getDiagnostics().catch(() => null),
    ])
      .then(([list, diag]) => {
        setAssets(list);
        setDiagnostics(diag);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [mediaTypeFilter]);

  const handleIntegrityCheck = async (assetId: number) => {
    try {
      setIntegrityChecking(assetId);
      const res = await mediaApi.runIntegrityCheck(assetId);
      setIntegrityMsg({
        id: assetId,
        ok: res.is_valid,
        msg: res.is_valid ? 'Master SHA-256 Verified Intact' : `Integrity Alert: ${res.status}`,
      });
    } catch (err: any) {
      setIntegrityMsg({
        id: assetId,
        ok: false,
        msg: err.response?.data?.detail || 'Integrity check failed',
      });
    } finally {
      setIntegrityChecking(null);
    }
  };

  const filteredAssets = searchQuery.trim() === ''
    ? assets
    : assets.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.accession_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.file_name || a.original_filename || '').toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-300 pb-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900">
            Audiovisual Asset Management & Media Intelligence
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Immutable archival masters, Dublin Core cataloging, native/OpenCV processing, and synchronized transcript curation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/media/integrity"
            className="px-3.5 py-2 bg-white hover:bg-stone-50 border border-stone-300 text-slate-700 rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 transition"
          >
            <Shield className="w-4 h-4 text-emerald-600" />
            Integrity Audit
          </Link>

          <Link
            to="/admin/media/new"
            className="px-4 py-2 bg-national-700 hover:bg-national-800 text-white rounded-lg text-xs font-semibold shadow flex items-center gap-1.5 transition"
          >
            <Upload className="w-4 h-4" />
            Ingest Archival Master
          </Link>
        </div>
      </div>

      {/* Provider Diagnostics Card */}
      {diagnostics && (
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-3">
            <span className="text-xs font-mono font-bold uppercase text-slate-700 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-heritage-600" />
              Environment & Media Processor Capabilities
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Active Strategy: <strong className="text-slate-900">{diagnostics.active_processor_strategy}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
            <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
              diagnostics.ffmpeg.installed ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <span>FFmpeg</span>
              <span className="font-bold text-[10px] uppercase px-1.5 py-0.5 rounded bg-white/60">
                {diagnostics.ffmpeg.installed ? 'AVAILABLE' : 'UNAVAILABLE'}
              </span>
            </div>

            <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
              diagnostics.ffprobe.installed ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <span>FFprobe</span>
              <span className="font-bold text-[10px] uppercase px-1.5 py-0.5 rounded bg-white/60">
                {diagnostics.ffprobe.installed ? 'AVAILABLE' : 'UNAVAILABLE'}
              </span>
            </div>

            <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
              diagnostics.whisper.installed ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <span>Whisper ASR</span>
              <span className="font-bold text-[10px] uppercase px-1.5 py-0.5 rounded bg-white/60">
                {diagnostics.whisper.installed ? 'AVAILABLE' : 'UNAVAILABLE'}
              </span>
            </div>

            <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
              diagnostics.native_opencv.installed ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-stone-50 border-stone-200 text-stone-600'
            }`}>
              <span>OpenCV Video</span>
              <span className="font-bold text-[10px] uppercase px-1.5 py-0.5 rounded bg-white/60">
                {diagnostics.native_opencv.installed ? 'ACTIVE' : 'OFFLINE'}
              </span>
            </div>

            <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
              diagnostics.native_pillow.installed ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-stone-50 border-stone-200 text-stone-600'
            }`}>
              <span>Pillow / Wave</span>
              <span className="font-bold text-[10px] uppercase px-1.5 py-0.5 rounded bg-white/60">
                {diagnostics.native_pillow.installed ? 'ACTIVE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['ALL', 'VIDEO', 'AUDIO', 'PHOTOGRAPH'].map((t) => (
            <button
              key={t}
              onClick={() => setMediaTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                mediaTypeFilter === t
                  ? 'bg-national-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-stone-300 hover:bg-stone-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search accession, title, or filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-heritage-500 shadow-sm"
          />
        </div>
      </div>

      {/* Media Catalog Table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-stone-200 flex justify-between items-center text-xs">
          <span className="font-bold text-ink-900 uppercase tracking-wider font-mono">
            Archival Media Catalog ({filteredAssets.length})
          </span>
          <span className="text-slate-500 font-mono">
            Storage: Immutable Master Vault
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-heritage-600 mb-2" />
            Loading archival assets...
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No archival media assets found. Click &quot;Ingest Archival Master&quot; to begin accessioning.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1B2A4A] text-white uppercase text-[10px] font-mono tracking-wider">
                <tr>
                  <th className="p-3.5">Asset / Title</th>
                  <th className="p-3.5">Type & Format</th>
                  <th className="p-3.5">Recorded Date</th>
                  <th className="p-3.5">Access Level</th>
                  <th className="p-3.5">Verification</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredAssets.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50 transition">
                    <td className="p-3.5">
                      <div className="font-serif font-bold text-sm text-ink-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Accession: {item.accession_number || `#${item.id}`} • File: {item.file_name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-xs mt-0.5">
                        SHA-256: {item.sha256_hash}
                      </div>
                    </td>

                    <td className="p-3.5 font-mono">
                      <span className="inline-flex items-center gap-1 font-semibold text-heritage-700">
                        {item.media_type === 'VIDEO' && <Film className="w-3.5 h-3.5" />}
                        {item.media_type === 'AUDIO' && <Volume2 className="w-3.5 h-3.5" />}
                        {item.media_type === 'PHOTOGRAPH' && <ImageIcon className="w-3.5 h-3.5" />}
                        {item.media_type}
                      </span>
                      <div className="text-[10px] text-slate-500">{item.file_format || item.mime_type}</div>
                    </td>

                    <td className="p-3.5 font-mono text-slate-600">
                      {item.date_recorded || 'Unspecified'}
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        item.access_level === 'PUBLIC'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.access_level}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        item.verification_status === 'APPROVED' || item.verification_status === 'HUMAN_REVIEWED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        {item.verification_status}
                      </span>
                    </td>

                    <td className="p-3.5 text-right space-x-2">
                      <Link
                        to={`/media/${item.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-[11px] font-medium transition"
                        title="View Public Presentation Page"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View
                      </Link>

                      <Link
                        to={`/admin/media/${item.id}/transcripts`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-heritage-100 hover:bg-heritage-200 text-heritage-900 rounded text-[11px] font-semibold transition"
                        title="Manage Captions and Diarization"
                      >
                        <FileText className="w-3 h-3" />
                        Transcripts
                      </Link>

                      <button
                        onClick={() => handleIntegrityCheck(item.id)}
                        disabled={integrityChecking === item.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded text-[11px] font-semibold transition"
                        title="Verify SHA-256 against disk master"
                      >
                        <Shield className="w-3 h-3" />
                        {integrityChecking === item.id ? 'Verifying...' : 'Check Hash'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {integrityMsg && (
          <div className={`p-3 text-xs font-mono font-bold flex items-center justify-between ${
            integrityMsg.ok ? 'bg-emerald-50 text-emerald-900 border-t border-emerald-200' : 'bg-rose-50 text-rose-900 border-t border-rose-200'
          }`}>
            <span>{integrityMsg.msg}</span>
            <button
              onClick={() => setIntegrityMsg(null)}
              className="text-stone-400 hover:text-stone-600 font-bold"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
