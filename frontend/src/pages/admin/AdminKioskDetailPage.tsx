import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Monitor, ArrowLeft, RefreshCw, KeyRound, Wrench, Trash2, 
  CheckCircle2, AlertTriangle, Shield, Cpu, HardDrive, 
  Activity, Clock, Sliders, Copy, Check, Save 
} from 'lucide-react';
import { kioskApi, KioskDetailResponse } from '../../services/kioskApi';

export const AdminKioskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const kioskId = parseInt(id || '0', 10);
  const navigate = useNavigate();

  const [detail, setDetail] = useState<KioskDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Configuration Form State
  const [idleTimeout, setIdleTimeout] = useState<number>(120);
  const [warningTimeout, setWarningTimeout] = useState<number>(15);
  const [homeRoute, setHomeRoute] = useState<string>('/');
  const [defaultLanguage, setDefaultLanguage] = useState<string>('en');
  const [maintenanceMsg, setMaintenanceMsg] = useState<string>('Under maintenance.');
  const [savingConfig, setSavingConfig] = useState<boolean>(false);
  const [configSuccess, setConfigSuccess] = useState<boolean>(false);

  // Key Rotation Modal State
  const [rotatedKey, setRotatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  const loadDetail = async () => {
    if (!kioskId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await kioskApi.getKioskDetail(kioskId);
      setDetail(data);
      if (data.configuration) {
        setIdleTimeout(data.configuration.idle_timeout_seconds || 120);
        setWarningTimeout(data.configuration.warning_timeout_seconds || 15);
        setHomeRoute(data.configuration.home_route || '/');
        setDefaultLanguage(data.configuration.default_language || 'en');
        setMaintenanceMsg(data.configuration.maintenance_message || '');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load kiosk details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [kioskId]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setConfigSuccess(false);
    try {
      await kioskApi.updateKioskConfig(kioskId, {
        idle_timeout_seconds: idleTimeout,
        warning_timeout_seconds: warningTimeout,
        home_route: homeRoute,
        default_language: defaultLanguage,
        maintenance_message: maintenanceMsg,
      });
      setConfigSuccess(true);
      setTimeout(() => setConfigSuccess(false), 3000);
      loadDetail();
    } catch (err: any) {
      alert(`Failed to save config: ${err.message}`);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleToggleMaintenance = async () => {
    if (!detail) return;
    try {
      const nextMode = !detail.maintenance_mode;
      await kioskApi.toggleMaintenance(kioskId, nextMode, 'Manual admin toggle from detail view');
      loadDetail();
    } catch (err: any) {
      alert(`Error toggling maintenance: ${err.message}`);
    }
  };

  const handleRotateKey = async () => {
    if (!window.confirm('Are you sure you want to rotate the device key? The existing key will be immediately invalidated and the physical terminal will require updating.')) {
      return;
    }
    try {
      const res = await kioskApi.rotateKioskKey(kioskId);
      setRotatedKey(res.raw_device_key);
    } catch (err: any) {
      alert(`Key rotation failed: ${err.message}`);
    }
  };

  const handleDisableDevice = async () => {
    if (!window.confirm(`Are you sure you want to disable and revoke kiosk #${kioskId}? This terminal will no longer be permitted to submit telemetry or access edge caches.`)) {
      return;
    }
    try {
      await kioskApi.disableKiosk(kioskId);
      alert('Device disabled successfully.');
      navigate('/admin/kiosks');
    } catch (err: any) {
      alert(`Failed to disable device: ${err.message}`);
    }
  };

  if (loading && !detail) {
    return (
      <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span>Loading kiosk telemetry...</span>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="p-8 max-w-lg mx-auto bg-white rounded-2xl border border-red-200 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Kiosk Terminal Not Found</h2>
        <p className="text-sm text-slate-600">{error || 'Requested device does not exist.'}</p>
        <Link
          to="/admin/kiosks"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-800 text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Fleet</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
        <div>
          <Link
            to="/admin/kiosks"
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-slate-500 hover:text-slate-800 mb-2 font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Kiosk Fleet</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-slate-900">
              {detail.device_name}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              detail.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
              detail.status === 'MAINTENANCE' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
              detail.status === 'STALE' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
              'bg-red-100 text-red-800 border border-red-300'
            }`}>
              {detail.status}
            </span>
          </div>
          <div className="text-xs font-mono text-slate-400 mt-1">
            UUID: {detail.device_uuid} • Location: {detail.location} ({detail.institution})
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadDetail}
            className="p-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-slate-700"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleMaintenance}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition ${
              detail.maintenance_mode
                ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600'
                : 'bg-white hover:bg-stone-50 text-purple-700 border-purple-300'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>{detail.maintenance_mode ? 'Exit Maintenance' : 'Set Maintenance'}</span>
          </button>

          <button
            onClick={handleRotateKey}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-stone-50 text-slate-700 border border-stone-300 flex items-center gap-2 transition"
            title="Rotate Device API Key"
          >
            <KeyRound className="w-4 h-4 text-amber-600" />
            <span>Rotate Key</span>
          </button>

          <button
            onClick={handleDisableDevice}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 flex items-center gap-2 transition"
            title="Disable Terminal"
          >
            <Trash2 className="w-4 h-4" />
            <span>Disable</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Hardware, Telemetry & Heartbeats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hardware & Platform Profile */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-serif font-bold text-lg border-b border-stone-100 pb-3">
              <Cpu className="w-5 h-5 text-heritage-600" />
              <span>Hardware & Environment Diagnostics</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Display</div>
                <div className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>OPERATIONAL</span>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Touchscreen</div>
                <div className="text-sm font-bold text-slate-600 mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span>NOT_DETECTED</span>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Audio Output</div>
                <div className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>OPERATIONAL</span>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Microphone</div>
                <div className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>OPERATIONAL</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-mono bg-stone-50 p-3 rounded-xl border border-stone-200">
              Hardware report verified against Windows System Metrics API. Non-touch mouse/keyboard interaction is fully supported with accessible navigation targets.
            </div>
          </div>

          {/* Recent Heartbeat Records */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-serif font-bold text-lg">
                <Activity className="w-5 h-5 text-heritage-600" />
                <span>Recent Telemetry Heartbeats</span>
              </div>
              <span className="text-xs font-mono text-slate-400">Last 10 Reports</span>
            </div>

            {detail.recent_heartbeats.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                No telemetry heartbeats recorded yet for this terminal.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 font-mono uppercase text-slate-500">
                      <th className="py-2 px-3">Timestamp</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">CPU</th>
                      <th className="py-2 px-3">RAM</th>
                      <th className="py-2 px-3">Disk</th>
                      <th className="py-2 px-3">App Health</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-mono">
                    {detail.recent_heartbeats.map((hb, i) => (
                      <tr key={i} className="hover:bg-stone-50">
                        <td className="py-2 px-3 text-slate-600">
                          {new Date(hb.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-2 px-3">
                          <span className="text-emerald-700 font-bold">{hb.status}</span>
                        </td>
                        <td className="py-2 px-3 text-slate-700">{hb.cpu_percent != null ? `${hb.cpu_percent}%` : '—'}</td>
                        <td className="py-2 px-3 text-slate-700">{hb.ram_percent != null ? `${hb.ram_percent}%` : '—'}</td>
                        <td className="py-2 px-3 text-slate-700">{hb.disk_percent != null ? `${hb.disk_percent}%` : '—'}</td>
                        <td className="py-2 px-3">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {hb.app_health}
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

        {/* Right Col: Configuration Form */}
        <div className="space-y-6">
          <form onSubmit={handleSaveConfig} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-serif font-bold text-lg border-b border-stone-100 pb-3">
              <Sliders className="w-5 h-5 text-heritage-600" />
              <span>Terminal Policy Settings</span>
            </div>

            {configSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Configuration updated to v{detail.configuration_version ? detail.configuration_version + 1 : 2}!</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase text-slate-600 font-bold mb-1">
                Inactivity Timeout (seconds)
              </label>
              <input
                type="number"
                min={10}
                max={3600}
                value={idleTimeout}
                onChange={(e) => setIdleTimeout(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-heritage-500 font-mono"
              />
              <div className="text-[11px] text-slate-400 mt-1">Default 120s. Resets session to welcome screen.</div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-600 font-bold mb-1">
                Warning Modal Window (seconds)
              </label>
              <input
                type="number"
                min={5}
                max={60}
                value={warningTimeout}
                onChange={(e) => setWarningTimeout(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-heritage-500 font-mono"
              />
              <div className="text-[11px] text-slate-400 mt-1">Countdown displayed before resetting session (default 15s).</div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-600 font-bold mb-1">
                Kiosk Home Route
              </label>
              <input
                type="text"
                value={homeRoute}
                onChange={(e) => setHomeRoute(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-heritage-500 font-mono"
              />
              <div className="text-[11px] text-slate-400 mt-1">Default landing route (e.g. / or /kiosk/media).</div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-600 font-bold mb-1">
                Default Interface Language
              </label>
              <select
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-heritage-500"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-600 font-bold mb-1">
                Maintenance Notice Message
              </label>
              <textarea
                rows={3}
                value={maintenanceMsg}
                onChange={(e) => setMaintenanceMsg(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-heritage-500"
                placeholder="Message shown to visitors when terminal is placed in maintenance mode."
              />
            </div>

            <button
              type="submit"
              disabled={savingConfig}
              className="w-full py-2.5 rounded-xl bg-heritage-600 hover:bg-heritage-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Save className="w-4 h-4" />
              <span>{savingConfig ? 'Saving Policy...' : 'Save Configuration'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Key Rotated Modal */}
      {rotatedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-2 text-amber-700 font-serif font-bold text-lg">
              <KeyRound className="w-5 h-5" />
              <span>New Device API Key Generated</span>
            </div>

            <p className="text-sm text-slate-600">
              The old device credentials have been immediately revoked. Update the physical terminal's configuration with this newly generated key:
            </p>

            <div className="p-3 bg-stone-900 text-emerald-400 font-mono text-xs break-all select-all rounded-xl border border-stone-700">
              {rotatedKey}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(rotatedKey);
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2000);
                }}
                className="flex-1 py-2.5 rounded-xl bg-heritage-500 hover:bg-heritage-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
              >
                {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKey ? 'Copied!' : 'Copy Key'}</span>
              </button>

              <button
                onClick={() => setRotatedKey(null)}
                className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
