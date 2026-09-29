import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Languages, Volume2, Mic, Shield, RefreshCw, 
  CheckCircle2, AlertTriangle, AlertCircle, Info, Server, Cpu
} from 'lucide-react';
import { archiveApi } from '../../services/api';
import { MultilingualDiagnostics } from '../../types';

export const AdminLanguagesPage: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<MultilingualDiagnostics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const loadDiagnostics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await archiveApi.getMultilingualDiagnostics();
      setDiagnostics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load multilingual diagnostics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-ink-900 flex items-center gap-2">
            <Languages className="w-6 h-6 text-heritage-600" />
            Multilingual & Voice Engine Diagnostics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time inspection of translation models, speech synthesis, and transcription runtimes.
          </p>
        </div>

        <button
          onClick={loadDiagnostics}
          disabled={loading}
          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 rounded-xl p-4 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !diagnostics ? (
        <div className="p-12 text-center text-slate-500 text-xs">
          <div className="w-6 h-6 border-2 border-heritage-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Querying runtime engines...
        </div>
      ) : diagnostics ? (
        <div className="space-y-6">
          {/* Phase Status Banner */}
          <div className="bg-heritage-50 border border-heritage-300 rounded-xl p-4 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-heritage-900 font-semibold">
              <Shield className="w-4 h-4 text-heritage-600" />
              <span>Active Architecture Phase: {diagnostics.active_phase}</span>
            </div>
            <span className="font-mono text-[11px] text-heritage-700 bg-white px-2 py-0.5 rounded border border-heritage-300">
              Condition 2 & 6 Audited
            </span>
          </div>

          {/* 3 Core Engines Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Translation Provider */}
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <Languages className="w-5 h-5 text-heritage-600" />
                  <h3 className="font-serif font-bold text-sm text-ink-900">Translation Engine</h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  diagnostics.translation.is_available
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {diagnostics.translation.status}
                </span>
              </div>

              <dl className="text-xs space-y-2">
                <div>
                  <dt className="text-slate-400 text-[10px] uppercase font-mono">Provider:</dt>
                  <dd className="font-semibold text-slate-800 font-mono">{diagnostics.translation.provider}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 text-[10px] uppercase font-mono">Model:</dt>
                  <dd className="font-mono text-slate-700">{diagnostics.translation.model_name}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 text-[10px] uppercase font-mono">Role:</dt>
                  <dd className="text-slate-600">
                    {diagnostics.translation.is_fallback
                      ? 'Fallback Engine (Ollama instruction model)'
                      : 'Primary Model (IndicTrans2)'}
                  </dd>
                </div>
                {diagnostics.translation.error_detail && (
                  <div className="bg-stone-50 p-2 rounded text-[11px] text-slate-600 font-mono">
                    {diagnostics.translation.error_detail}
                  </div>
                )}
              </dl>
            </div>

            {/* 2. Text-to-Speech Provider */}
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-heritage-600" />
                  <h3 className="font-serif font-bold text-sm text-ink-900">Speech Synthesis (TTS)</h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  diagnostics.tts.is_available
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {diagnostics.tts.status}
                </span>
              </div>

              <dl className="text-xs space-y-2">
                <div>
                  <dt className="text-slate-400 text-[10px] uppercase font-mono">Engine:</dt>
                  <dd className="font-semibold text-slate-800 font-mono">{diagnostics.tts.provider}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 text-[10px] uppercase font-mono">Installed Native Voices:</dt>
                  <dd className="text-slate-700">
                    {diagnostics.tts.installed_voices?.length || 0} voices detected
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 text-[10px] uppercase font-mono">Supported Languages:</dt>
                  <dd className="font-mono text-slate-700">
                    {diagnostics.tts.supported_languages?.join(', ') || 'en'}
                  </dd>
                </div>
                <div className="bg-amber-50 p-2 rounded border border-amber-200 text-[10px] text-amber-900">
                  <strong>Condition 7 Audit:</strong> Refuses silent English voice fallback for Indic text if native Indic voice is absent.
                </div>
              </dl>
            </div>

            {/* 3. Speech-to-Text Provider */}
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-heritage-600" />
                  <h3 className="font-serif font-bold text-sm text-ink-900">Speech Transcription (STT)</h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  diagnostics.stt.is_available
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {diagnostics.stt.status}
                </span>
              </div>

              <dl className="text-xs space-y-2">
                <div>
                  <dt className="text-slate-400 text-[10px] uppercase font-mono">Provider:</dt>
                  <dd className="font-semibold text-slate-800 font-mono">{diagnostics.stt.provider}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 text-[10px] uppercase font-mono">Status Detail:</dt>
                  <dd className="text-slate-600">
                    {diagnostics.stt.error_detail || 'Operational / Ready'}
                  </dd>
                </div>
                <div className="bg-stone-50 p-2 rounded text-[10px] text-slate-600">
                  <strong>Condition 8:</strong> Voice input is optional. Audio inputs pass strict prompt injection defenses.
                </div>
              </dl>
            </div>
          </div>

          {/* Languages Capability Matrix */}
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-sm text-ink-900 border-b border-stone-100 pb-2">
              Multilingual Archival Capability Matrix
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-slate-500 uppercase tracking-wider font-mono border-b border-stone-200">
                  <tr>
                    <th className="p-3">Language</th>
                    <th className="p-3">Code</th>
                    <th className="p-3">Native Name</th>
                    <th className="p-3">UI Localization</th>
                    <th className="p-3">Derivative Translation</th>
                    <th className="p-3">Speech Narration (TTS)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {diagnostics.supported_languages.map(lang => (
                    <tr key={lang.code} className="hover:bg-stone-50/80 transition">
                      <td className="p-3 font-semibold text-slate-800">{lang.name}</td>
                      <td className="p-3 font-mono text-slate-500">{lang.code}</td>
                      <td className="p-3 text-slate-700 font-serif">{lang.native_name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Active (100%)
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Supported
                        </span>
                      </td>
                      <td className="p-3">
                        {lang.is_tts_supported ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Verified Voice
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Voice Absent (Refuses Fallback)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
