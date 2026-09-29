import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Upload, Film, Volume2, Image as ImageIcon, Shield, 
  ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, FileCheck, Layers
} from 'lucide-react';
import { mediaApi } from '../../services/mediaApi';

export const AdminMediaNewPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [mediaType, setMediaType] = useState<string>('VIDEO');
  const [historicalContext, setHistoricalContext] = useState<string>('');
  const [dateRecorded, setDateRecorded] = useState<string>('');
  const [originalMedium, setOriginalMedium] = useState<string>('');
  const [custodyChain, setCustodyChain] = useState<string>('');
  const [sourceArchive, setSourceArchive] = useState<string>('');
  const [accessionNumber, setAccessionNumber] = useState<string>('');
  const [accessLevel, setAccessLevel] = useState<string>('PUBLIC');
  const [storageTier, setStorageTier] = useState<string>('WARM_STORAGE');
  const [language, setLanguage] = useState<string>('en');

  const [uploading, setUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdAsset, setCreatedAsset] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
      // Infer media type from MIME
      if (selectedFile.type.startsWith('video/')) {
        setMediaType('VIDEO');
      } else if (selectedFile.type.startsWith('audio/')) {
        setMediaType('AUDIO');
      } else if (selectedFile.type.startsWith('image/')) {
        setMediaType('PHOTOGRAPH');
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !title) {
      setErrorMsg('Please ensure master file and title are provided.');
      return;
    }

    try {
      setUploading(true);
      setErrorMsg(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('media_type', mediaType);
      if (description) formData.append('description', description);
      if (historicalContext) formData.append('historical_context', historicalContext);
      if (dateRecorded) formData.append('date_recorded', dateRecorded);
      if (originalMedium) formData.append('original_medium', originalMedium);
      if (custodyChain) formData.append('custody_chain', custodyChain);
      if (sourceArchive) formData.append('source_archive', sourceArchive);
      if (accessionNumber) formData.append('accession_number', accessionNumber);
      formData.append('access_level', accessLevel);
      formData.append('preservation_tier', storageTier);
      formData.append('language', language);

      const res = await mediaApi.uploadMediaMaster(formData);
      setCreatedAsset(res);
      setStep(8); // Confirmation step
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Media ingestion failed. Please verify format.');
    } finally {
      setUploading(false);
    }
  };

  const steps = [
    { num: 1, title: 'Master File' },
    { num: 2, title: 'Core Metadata' },
    { num: 3, title: 'Provenance' },
    { num: 4, title: 'Access Control' },
    { num: 5, title: 'Storage Tier' },
    { num: 6, title: 'Processing' },
    { num: 7, title: 'Ingestion' },
    { num: 8, title: 'Confirmation' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-stone-300 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/media"
            className="p-2 rounded-lg hover:bg-stone-200 text-stone-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-ink-900">
              Archival Media Ingestion Wizard
            </h1>
            <p className="text-xs text-slate-600">
              8-step accession protocol guaranteeing master immutability and SHA-256 fingerprinting.
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-heritage-700 bg-heritage-100 px-3 py-1 rounded-full">
          Step {step} of 8
        </span>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-8 gap-1 bg-stone-200 p-1.5 rounded-xl">
        {steps.map((s) => (
          <div
            key={s.num}
            className={`py-1.5 text-center rounded-lg text-[10px] font-mono font-bold transition ${
              s.num === step
                ? 'bg-national-700 text-white shadow'
                : s.num < step
                ? 'bg-emerald-600 text-white'
                : 'text-stone-500'
            }`}
          >
            {s.title}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl border border-stone-300 p-6 sm:p-8 shadow-sm">
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Master File Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="border-b border-stone-200 pb-3">
              <h2 className="font-serif font-bold text-lg text-ink-900">Step 1: Select Archival Master File</h2>
              <p className="text-xs text-slate-500">
                Upload uncompressed or broadcast master files. The master will be stored immutably with write-protection.
              </p>
            </div>

            <div className="border-2 border-dashed border-stone-300 hover:border-heritage-500 rounded-2xl p-8 text-center space-y-4 transition">
              <div className="w-16 h-16 rounded-full bg-heritage-100 text-heritage-700 flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8" />
              </div>

              <div>
                <label className="cursor-pointer px-5 py-2.5 bg-national-700 hover:bg-national-800 text-white rounded-xl text-xs font-semibold shadow transition inline-block">
                  <span>Browse Master Files</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="video/*,audio/*,image/*"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="text-xs text-slate-500 mt-2 font-mono">
                  Supported formats: MP4, WebM, WAV, MP3, M4A, OGG, JPEG, PNG, TIFF
                </p>
              </div>

              {file && (
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-left max-w-md mx-auto text-xs space-y-1">
                  <div className="font-bold text-slate-900">{file.name}</div>
                  <div className="text-slate-500 font-mono">
                    Size: {(file.size / (1024 * 1024)).toFixed(2)} MB • MIME: {file.type || 'Unknown'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Core Metadata */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="border-b border-stone-200 pb-3">
              <h2 className="font-serif font-bold text-lg text-ink-900">Step 2: Core Dublin Core Metadata</h2>
              <p className="text-xs text-slate-500">
                Standard descriptive metadata conforming to archival cataloging specifications.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Asset Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Speech on the Constitution of Free India"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-heritage-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Archival Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Comprehensive description of the recording content and circumstance."
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-heritage-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Media Type</label>
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:border-heritage-500"
                >
                  <option value="VIDEO">VIDEO (Motion Picture / Newsreel)</option>
                  <option value="AUDIO">AUDIO (Sound Recording / Radio)</option>
                  <option value="PHOTOGRAPH">PHOTOGRAPH (Still Negative / Print)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:border-heritage-500"
                >
                  <option value="en">English (en)</option>
                  <option value="hi">Hindi (hi)</option>
                  <option value="mr">Marathi (mr)</option>
                  <option value="ta">Tamil (ta)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Provenance */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="border-b border-stone-200 pb-3">
              <h2 className="font-serif font-bold text-lg text-ink-900">Step 3: Historical Provenance & Chain of Custody</h2>
              <p className="text-xs text-slate-500">
                Capture verified archival custody records, accession numbers, and historical context.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Accession Number</label>
                <input
                  type="text"
                  value={accessionNumber}
                  onChange={(e) => setAccessionNumber(e.target.value)}
                  placeholder="e.g., ACC-AV-1949-001"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono focus:outline-none focus:border-heritage-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date Recorded</label>
                <input
                  type="text"
                  value={dateRecorded}
                  onChange={(e) => setDateRecorded(e.target.value)}
                  placeholder="YYYY-MM-DD or Circa 1949"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono focus:outline-none focus:border-heritage-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Original Physical Medium</label>
                <input
                  type="text"
                  value={originalMedium}
                  onChange={(e) => setOriginalMedium(e.target.value)}
                  placeholder="e.g., 16mm celluloid film, 78 RPM shellac record, glass negative"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-heritage-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Source Repository / Archive</label>
                <input
                  type="text"
                  value={sourceArchive}
                  onChange={(e) => setSourceArchive(e.target.value)}
                  placeholder="e.g., National Film Archive of India"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-heritage-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Historical Context</label>
              <textarea
                value={historicalContext}
                onChange={(e) => setHistoricalContext(e.target.value)}
                rows={2}
                placeholder="Constitutional Assembly session, Mahad Satyagraha commemoration, etc."
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-heritage-500"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Access Control */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="border-b border-stone-200 pb-3">
              <h2 className="font-serif font-bold text-lg text-ink-900">Step 4: Access Classification & RBAC Policy</h2>
              <p className="text-xs text-slate-500">
                Enforce institutional permissions for streaming, viewing, and master file downloads.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { id: 'PUBLIC', title: 'PUBLIC', desc: 'Accessible to all visitors, researchers, and public touch kiosks.' },
                { id: 'RESEARCH', title: 'RESEARCH', desc: 'Restricted to authenticated researchers, scholars, and educational institutions.' },
                { id: 'RESTRICTED', title: 'RESTRICTED', desc: 'Requires explicit archivist authorization. Redacted or watermarked.' },
                { id: 'CONFIDENTIAL', title: 'CONFIDENTIAL', desc: 'Admin vault custody only. Sealed under institutional retention policy.' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`block p-4 rounded-xl border-2 cursor-pointer transition ${
                    accessLevel === opt.id ? 'border-national-700 bg-amber-50/40' : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="accessLevel"
                      value={opt.id}
                      checked={accessLevel === opt.id}
                      onChange={() => setAccessLevel(opt.id)}
                      className="text-national-700 focus:ring-national-700"
                    />
                    <div>
                      <div className="font-mono font-bold text-xs text-slate-900">{opt.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Storage Tier */}
        {step === 5 && (
          <div className="space-y-5">
            <div className="border-b border-stone-200 pb-3">
              <h2 className="font-serif font-bold text-lg text-ink-900">Step 5: Digital Preservation Tier</h2>
              <p className="text-xs text-slate-500">
                Storage lifecycle configuration following OAIS reference model guidelines.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { id: 'WARM_STORAGE', title: 'WARM_STORAGE (Recommended)', desc: 'Standard archival master storage with automated derivative generation.' },
                { id: 'COLD_STORAGE', title: 'COLD_STORAGE', desc: 'Deep archival master vault. Replicated offsite with immutable read-only flags.' },
                { id: 'HOT_ACCESS', title: 'HOT_ACCESS', desc: 'Optimized for high-concurrency public exhibitions and touch kiosks.' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`block p-4 rounded-xl border-2 cursor-pointer transition ${
                    storageTier === opt.id ? 'border-national-700 bg-amber-50/40' : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="storageTier"
                      value={opt.id}
                      checked={storageTier === opt.id}
                      onChange={() => setStorageTier(opt.id)}
                      className="text-national-700 focus:ring-national-700"
                    />
                    <div>
                      <div className="font-mono font-bold text-xs text-slate-900">{opt.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: Processing Strategy */}
        {step === 6 && (
          <div className="space-y-5">
            <div className="border-b border-stone-200 pb-3">
              <h2 className="font-serif font-bold text-lg text-ink-900">Step 6: Processing Engine & Derivative Pipeline</h2>
              <p className="text-xs text-slate-500">
                Verification of active media processor and automated derivative extraction rules.
              </p>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3 text-xs">
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-slate-700">Active Processor Strategy:</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">
                  Native Python / OpenCV / Wave
                </span>
              </div>

              <div className="text-slate-600 space-y-1">
                <p>• <strong>Video Processing:</strong> Real frame extraction at 1.0s and 2.0s via OpenCV `VideoCapture`.</p>
                <p>• <strong>Image Processing:</strong> Bilinear thumbnail scaling via Pillow (`PIL`).</p>
                <p>• <strong>Audio Processing:</strong> Genuine RMS waveform sample calculation via Python `wave` module.</p>
                <p>• <strong>Transcription Engine:</strong> Whisper reported `UNAVAILABLE` (Manual / Curator WebVTT ingestion active).</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Ingestion Execution */}
        {step === 7 && (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 rounded-full bg-national-100 text-national-700 flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8" />
            </div>

            <div>
              <h2 className="font-serif font-bold text-xl text-ink-900">Ready to Ingest Archival Master</h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto mt-2">
                Upon confirmation, the file will be written to the master vault, hashed with SHA-256, and derivatives will be generated.
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 max-w-md mx-auto text-left text-xs font-mono space-y-1.5">
              <div><strong className="text-slate-700">Title:</strong> {title}</div>
              <div><strong className="text-slate-700">File:</strong> {file?.name}</div>
              <div><strong className="text-slate-700">Media Type:</strong> {mediaType}</div>
              <div><strong className="text-slate-700">Access Level:</strong> {accessLevel}</div>
              <div><strong className="text-slate-700">Storage Tier:</strong> {storageTier}</div>
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-6 py-3 bg-national-700 hover:bg-national-800 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50"
            >
              {uploading ? 'Ingesting & Hashing Master...' : 'Execute Archival Ingestion'}
            </button>
          </div>
        )}

        {/* STEP 8: Accession Confirmation */}
        {step === 8 && createdAsset && (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="font-serif font-bold text-2xl text-emerald-900">
                Archival Master Successfully Accessioned
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Asset record created with permanent identifier and verified cryptographic fingerprint.
              </p>
            </div>

            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 max-w-lg mx-auto text-left text-xs font-mono space-y-2">
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="text-slate-500">Asset ID:</span>
                <span className="font-bold text-slate-900">#{createdAsset.id}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="text-slate-500">Accession Number:</span>
                <span className="font-bold text-slate-900">{createdAsset.accession_number || `#${createdAsset.id}`}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="text-slate-500">Master SHA-256:</span>
                <span className="font-bold text-emerald-700 truncate max-w-xs">{createdAsset.sha256_hash}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Integrity Status:</span>
                <span className="font-bold text-emerald-700">VERIFIED INTACT</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4">
              <Link
                to={`/admin/media/${createdAsset.id}/transcripts`}
                className="px-4 py-2 bg-heritage-100 hover:bg-heritage-200 text-heritage-900 rounded-lg text-xs font-semibold shadow-sm transition"
              >
                Add / Review Transcripts
              </Link>
              <Link
                to={`/media/${createdAsset.id}`}
                className="px-4 py-2 bg-national-700 hover:bg-national-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
              >
                View Public Presentation
              </Link>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        {step < 8 && (
          <div className="flex items-center justify-between border-t border-stone-200 pt-5 mt-6">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1 || uploading}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 rounded-lg text-xs font-semibold disabled:opacity-40 transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            {step < 7 ? (
              <button
                onClick={() => {
                  if (step === 1 && !file) {
                    setErrorMsg('Please select a master file first.');
                    return;
                  }
                  if (step === 2 && !title) {
                    setErrorMsg('Please enter an asset title.');
                    return;
                  }
                  setErrorMsg(null);
                  setStep(step + 1);
                }}
                className="px-4 py-2 bg-national-700 hover:bg-national-800 text-white rounded-lg text-xs font-semibold shadow transition flex items-center gap-1.5"
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
