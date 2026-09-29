import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Monitor, Plus, ShieldAlert, CheckCircle2, AlertTriangle, 
  XCircle, Wrench, RefreshCw, Copy, Check, ExternalLink, KeyRound 
} from 'lucide-react';
import { kioskApi, KioskDeviceItem, KioskSummary, KioskRegisterResponse } from '../../services/kioskApi';

export const AdminKiosksPage: React.FC = () => {
  const [kiosks, setKiosks] = useState<KioskDeviceItem[]>([]);
  const [summary, setSummary] = useState<KioskSummary>({
    total: 0, online: 0, stale: 0, offline: 0, maintenance: 0, disabled: 0, error: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');

  // Modal State
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [deviceName, setDeviceName] = useState<string>('');
  const [institution, setInstitution] = useState<string>('Dr. Ambedkar National Memorial');
  const [location, setLocation] = useState<string>('Exhibition Hall A');
  const [kioskType, setKioskType] = useState<string>('TOUCHSCREEN_PEDESTAL');
  const [registeredResult, setRegisteredResult] = useState<KioskRegisterResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [registering, setRegistering] = useState<boolean>(false);

  const loadKiosks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await kioskApi.listKiosks();
      setKiosks(data.kiosks);
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || 'Failed to load kiosk fleet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKiosks();
    const interval = setInterval(loadKiosks, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, []);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceName.trim()) return;
    setRegistering(true);
    try {
      const res = await kioskApi.registerKiosk({
        device_name: deviceName.trim(),
        institution: institution.trim(),
        location: location.trim(),
        kiosk_type: kioskType,
      });
      setRegisteredResult(res);
      loadKiosks();
    } catch (err: any) {
      alert(`Registration failed: ${err.message}`);
    } finally {
      setRegistering(false);
    }
  };

  const handleCopyKey = () => {
    if (registeredResult?.raw_device_key) {
      navigator.clipboard.writeText(registeredResult.raw_device_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleToggleMaintenance = async (kiosk: KioskDeviceItem) => {
    try {
      const newStatus = !kiosk.maintenance_mode;
      await kioskApi.toggleMaintenance(kiosk.id, newStatus, 'Toggled from Admin Kiosk Fleet portal');
      loadKiosks();
    } catch (err: any) {
      alert(`Failed to toggle maintenance: ${err.message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ONLINE
          </span>
        );
      case 'STALE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            STALE
          </span>
        );
      case 'OFFLINE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            OFFLINE
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <Wrench className="w-3 h-3 text-purple-600" />
            MAINTENANCE
          </span>
        );
      case 'DISABLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-300">
            <XCircle className="w-3 h-3" />
            DISABLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertTriangle className="w-3 h-3" />
            {status}
          </span>
        );
    }
  };

  const filteredKiosks = kiosks.filter(k => {
    if (filter === 'ALL') return true;
    return k.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-heritage-100 text-heritage-800 rounded-xl">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-slate-900">
                Exhibition Kiosk Fleet
              </h1>
              <p className="text-sm text-slate-500">
                Physical terminal registration, heartbeat telemetry, and remote maintenance
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadKiosks}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-slate-700 font-semibold text-sm flex items-center gap-2 transition"
            title="Refresh Fleet Status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => {
              setRegisteredResult(null);
              setDeviceName('');
              setIsRegisterOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-heritage-600 hover:bg-heritage-700 text-white font-bold text-sm flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Register Terminal</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div 
          onClick={() => setFilter('ALL')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filter === 'ALL' ? 'bg-heritage-50 border-heritage-400 ring-2 ring-heritage-400' : 'bg-white border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="text-xs font-mono uppercase text-slate-500 font-bold">Total Fleet</div>
          <div className="text-2xl font-serif font-bold text-slate-900 mt-1">{summary.total}</div>
        </div>

        <div 
          onClick={() => setFilter('ONLINE')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filter === 'ONLINE' ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400' : 'bg-white border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="text-xs font-mono uppercase text-emerald-700 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Online
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-800 mt-1">{summary.online}</div>
        </div>

        <div 
          onClick={() => setFilter('STALE')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filter === 'STALE' ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400' : 'bg-white border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="text-xs font-mono uppercase text-amber-700 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Stale (&gt;90s)
          </div>
          <div className="text-2xl font-serif font-bold text-amber-800 mt-1">{summary.stale}</div>
        </div>

        <div 
          onClick={() => setFilter('OFFLINE')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filter === 'OFFLINE' ? 'bg-red-50 border-red-400 ring-2 ring-red-400' : 'bg-white border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="text-xs font-mono uppercase text-red-700 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Offline (&gt;5m)
          </div>
          <div className="text-2xl font-serif font-bold text-red-800 mt-1">{summary.offline}</div>
        </div>

        <div 
          onClick={() => setFilter('MAINTENANCE')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filter === 'MAINTENANCE' ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-400' : 'bg-white border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="text-xs font-mono uppercase text-purple-700 font-bold flex items-center gap-1">
            <Wrench className="w-3 h-3" />
            Maintenance
          </div>
          <div className="text-2xl font-serif font-bold text-purple-800 mt-1">{summary.maintenance}</div>
        </div>

        <div 
          onClick={() => setFilter('DISABLED')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filter === 'DISABLED' ? 'bg-stone-100 border-stone-400 ring-2 ring-stone-400' : 'bg-white border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="text-xs font-mono uppercase text-stone-600 font-bold flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Disabled
          </div>
          <div className="text-2xl font-serif font-bold text-stone-800 mt-1">{summary.disabled}</div>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
          <div className="font-serif font-bold text-slate-800">
            Registered Kiosks ({filteredKiosks.length})
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Heartbeat Interval: 30s | Stale Threshold: 90s | Offline Threshold: 300s
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 border-b border-red-200 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-stone-100/70 text-slate-600 text-xs font-mono uppercase border-b border-stone-200">
                <th className="p-3.5">Device Name / ID</th>
                <th className="p-3.5">Institution & Location</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Live Status</th>
                <th className="p-3.5">Config Ver</th>
                <th className="p-3.5">Last Seen</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredKiosks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No physical terminals found matching active filter. Click "Register Terminal" above to deploy one.
                  </td>
                </tr>
              ) : (
                filteredKiosks.map((k) => (
                  <tr key={k.id} className="hover:bg-stone-50/80 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{k.device_name}</div>
                      <div className="font-mono text-xs text-slate-400">{k.device_uuid}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-slate-800 font-medium">{k.institution}</div>
                      <div className="text-xs text-slate-500">{k.location}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-xs font-mono bg-stone-100 text-stone-700 border border-stone-200">
                        {k.kiosk_type}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {getStatusBadge(k.status)}
                    </td>
                    <td className="p-3.5 font-mono text-xs text-slate-600">
                      v{k.configuration_version || 1}
                    </td>
                    <td className="p-3.5 text-xs text-slate-500 font-mono">
                      {k.last_seen_at ? new Date(k.last_seen_at).toLocaleTimeString() : 'Never'}
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleToggleMaintenance(k)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                          k.maintenance_mode
                            ? 'bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-300'
                            : 'bg-white hover:bg-stone-100 text-slate-700 border-stone-300'
                        }`}
                        title="Toggle Remote Maintenance Mode"
                      >
                        {k.maintenance_mode ? 'End Maint.' : 'Maint.'}
                      </button>

                      <Link
                        to={`/admin/kiosks/${k.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-heritage-100 hover:bg-heritage-200 text-heritage-900 border border-heritage-300 transition"
                      >
                        <span>Telemetry</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-5">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2 font-serif font-bold text-lg text-slate-900">
                <Monitor className="w-5 h-5 text-heritage-600" />
                <span>Register Exhibition Terminal</span>
              </div>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {!registeredResult ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-600 font-bold mb-1">
                    Device Name / Label *
                  </label>
                  <input
                    type="text"
                    required
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    placeholder="e.g. Kiosk-Hall-A-West"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-heritage-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-600 font-bold mb-1">
                    Memorial / Institution
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-heritage-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-600 font-bold mb-1">
                    Exhibition Hall / Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-heritage-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-600 font-bold mb-1">
                    Terminal Hardware Profile
                  </label>
                  <select
                    value={kioskType}
                    onChange={(e) => setKioskType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-heritage-500 text-sm"
                  >
                    <option value="TOUCHSCREEN_PEDESTAL">Touchscreen Pedestal (Standard Kiosk)</option>
                    <option value="TABLET_DESK">Wall/Desk Mounted Tablet</option>
                    <option value="ACCESSIBILITY_POD">Accessibility Pod (Large Text / Audio)</option>
                    <option value="PROJECTION_WALL">Interactive Projection Display</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsRegisterOpen(false)}
                    className="px-4 py-2 rounded-xl border border-stone-300 text-slate-600 text-sm font-semibold hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={registering}
                    className="px-5 py-2 rounded-xl bg-heritage-600 hover:bg-heritage-700 text-white text-sm font-bold shadow-sm"
                  >
                    {registering ? 'Generating Credentials...' : 'Register Terminal'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-sm flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Device Registered Successfully!</div>
                    <div className="text-xs text-emerald-700 mt-1">
                      {registeredResult.device_name} ({registeredResult.device_uuid})
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-stone-900 text-white rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-400 font-mono uppercase">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <KeyRound className="w-4 h-4" />
                      Terminal Device API Key
                    </span>
                    <span>One-Time Display</span>
                  </div>

                  <div className="bg-black/60 p-3 rounded-lg font-mono text-xs text-emerald-400 break-all select-all border border-stone-700">
                    {registeredResult.raw_device_key}
                  </div>

                  <button
                    onClick={handleCopyKey}
                    className="w-full mt-2 py-2 rounded-lg bg-heritage-500 hover:bg-heritage-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Device Key</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Security Notice:</strong> This key is stored in the database only as a cryptographic SHA-256 hash. You must copy it now to configure the terminal startup environment (<code className="font-mono bg-amber-100 px-1 py-0.5 rounded">KIOSK_DEVICE_KEY</code>).
                  </div>
                </div>

                <button
                  onClick={() => setIsRegisterOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-sm"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
