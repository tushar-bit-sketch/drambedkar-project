import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileText, Upload, CheckCircle2, AlertTriangle, ArrowLeft, 
  ArrowRight, Shield, Database, Lock, Hash, RefreshCw, Eye, X
} from 'lucide-react';
import { apiService } from '../../services/api';
import { Collection, DocumentType, AccessLevel } from '../../types';

export const AdminDocumentNewPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    document_type: 'SPEECH' as DocumentType,
    collection_id: '' as string | number,
    creator: 'Dr. B. R. Ambedkar',
    language: 'English',
    date: '',
    year: '' as string | number,
    date_precision: 'EXACT',
    physical_location: '',
    period: '',
    source_name: 'Dr. Ambedkar Foundation (BAWS)',
    source_identifier: '',
    source_url: '',
    rights: 'Public Domain / Institutional Heritage',
    access_level: 'PUBLIC' as AccessLevel,
    is_demo_data: false,
    description: '',
    keywords: '',
    publisher: 'Dr. Ambedkar Foundation, Ministry of Social Justice and Empowerment, Govt. of India'
  });

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [hashingProgress, setHashingProgress] = useState<boolean>(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  useEffect(() => {
    apiService.getCollections().then(setCollections).catch(() => {});
  }, []);

  // Compute SHA-256 in browser using Web Crypto API
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setSelectedFile(file);
    setErrorMessage(null);

    // Create preview if image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }

    // Real-time client-side SHA-256 calculation
    setHashingProgress(true);
    try {
      const buffer = await file.arrayBuffer();
      const digestBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(digestBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setFileHash(hashHex);
    } catch (err) {
      console.error('Failed to compute client checksum', err);
      setFileHash('Verification on upload');
    } finally {
      setHashingProgress(false);
    }
  };

  const validateStep = (step: number): boolean => {
    setErrorMessage(null);
    if (step === 1) {
      if (!formData.title.trim()) {
        setErrorMessage('Document Title is required for archival cataloging.');
        return false;
      }
      if (!formData.creator.trim()) {
        setErrorMessage('Creator / Author is required.');
        return false;
      }
    }
    if (step === 2) {
      if (formData.year && (isNaN(Number(formData.year)) || Number(formData.year) < 1800 || Number(formData.year) > 2050)) {
        setErrorMessage('Please enter a valid 4-digit calendar year (e.g. 1949).');
        return false;
      }
    }
    if (step === 3) {
      if (!formData.source_name.trim()) {
        setErrorMessage('Authentic Source Name is strictly required (e.g., Dr. Ambedkar Foundation, CAD Archive).');
        return false;
      }
      if (!formData.source_identifier.trim()) {
        setErrorMessage('Source Identifier / Shelfmark is required for provenance tracking (e.g., CAD-VOL-XI-P972).');
        return false;
      }
    }
    if (step === 4) {
      if (!selectedFile) {
        setErrorMessage('A digital archival master file must be selected for Phase 2 ingestion.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    const submission = new FormData();
    submission.append('title', formData.title.trim());
    if (formData.subtitle) submission.append('subtitle', formData.subtitle.trim());
    submission.append('document_type', formData.document_type);
    if (formData.collection_id) submission.append('collection_id', formData.collection_id.toString());
    submission.append('creator', formData.creator.trim());
    submission.append('language', formData.language);
    if (formData.date) submission.append('date', formData.date.trim());
    if (formData.year) submission.append('year', formData.year.toString());
    submission.append('date_precision', formData.date_precision);
    if (formData.physical_location) submission.append('physical_location', formData.physical_location.trim());
    submission.append('source_name', formData.source_name.trim());
    submission.append('source_identifier', formData.source_identifier.trim());
    if (formData.source_url) submission.append('source_url', formData.source_url.trim());
    submission.append('rights', formData.rights.trim());
    submission.append('access_level', formData.access_level);
    submission.append('is_demo_data', formData.is_demo_data ? 'true' : 'false');
    if (formData.description) submission.append('description', formData.description.trim());
    if (formData.keywords) submission.append('keywords', formData.keywords.trim());
    if (formData.publisher) submission.append('publisher', formData.publisher.trim());

    if (selectedFile) {
      submission.append('file', selectedFile);
    }

    try {
      const created = await apiService.createDocument(submission);
      setSuccessResult(created);
    } catch (err: any) {
      setErrorMessage(err.message || 'Archival ingestion failed. Please check source identifier uniqueness.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Basic Identity' },
    { num: 2, title: 'Historical Date' },
    { num: 3, title: 'Provenance & Rights' },
    { num: 4, title: 'Master File & Hash' },
    { num: 5, title: 'Dublin Core' },
    { num: 6, title: 'Curatorial Verification' },
  ];

  if (successResult) {
    return (
      <div className="max-w-3xl mx-auto bg-white border border-stone-200 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-ink-900">
            Archival Master Ingestion Successful
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            The record has been cataloged under institutional accession controls with cryptographic integrity check.
          </p>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-3 text-xs">
          <div className="flex justify-between border-b border-stone-200 pb-2">
            <span className="text-slate-500 font-mono">Assigned Accession ID:</span>
            <span className="font-mono font-bold text-heritage-800 text-sm">{successResult.archive_id}</span>
          </div>
          <div className="flex justify-between border-b border-stone-200 pb-2">
            <span className="text-slate-500">Document Title:</span>
            <span className="font-semibold text-ink-900">{successResult.title}</span>
          </div>
          <div className="flex justify-between border-b border-stone-200 pb-2">
            <span className="text-slate-500">Document Type:</span>
            <span className="font-mono font-medium">{successResult.document_type}</span>
          </div>
          <div className="flex justify-between border-b border-stone-200 pb-2">
            <span className="text-slate-500">Source Identifier / Shelfmark:</span>
            <span className="font-mono font-medium text-slate-800">{successResult.source_identifier}</span>
          </div>
          <div className="flex flex-col gap-1 border-b border-stone-200 pb-2">
            <span className="text-slate-500 font-mono">Computed SHA-256 Checksum:</span>
            <span className="font-mono text-[11px] bg-white p-2 rounded border border-stone-200 break-all text-slate-800">
              {successResult.checksum || 'Pending disk write'}
            </span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-slate-500">Verification Status:</span>
            <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded font-mono font-bold">
              {successResult.verification_status} (Pending Reviewer Signoff)
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-stone-200">
          <button
            onClick={() => {
              setSuccessResult(null);
              setCurrentStep(1);
              setFormData({
                title: '',
                subtitle: '',
                document_type: 'SPEECH',
                collection_id: '',
                creator: 'Dr. B. R. Ambedkar',
                language: 'English',
                date: '',
                year: '',
                date_precision: 'EXACT',
                physical_location: '',
                period: '',
                source_name: 'Dr. Ambedkar Foundation (BAWS)',
                source_identifier: '',
                source_url: '',
                rights: 'Public Domain / Institutional Heritage',
                access_level: 'PUBLIC',
                is_demo_data: false,
                description: '',
                keywords: '',
                publisher: 'Dr. Ambedkar Foundation, Ministry of Social Justice and Empowerment, Govt. of India'
              });
              setSelectedFile(null);
              setFileHash(null);
              setFilePreview(null);
            }}
            className="flex-1 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-slate-800 font-semibold text-xs rounded-xl transition"
          >
            Ingest Another Document
          </button>
          <button
            onClick={() => navigate('/admin/documents')}
            className="flex-1 px-4 py-2.5 bg-heritage-700 hover:bg-heritage-800 text-white font-semibold text-xs rounded-xl shadow transition"
          >
            Return to Document Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-stone-300 pb-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/documents"
            className="p-2 text-slate-600 hover:text-ink-900 rounded-lg hover:bg-stone-200 transition"
            title="Back to Documents"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900">
              New Archival Ingestion Workflow
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Strict OAIS Archival Ingestion: Source &rarr; Document &rarr; Metadata &rarr; Version &rarr; File &rarr; SHA-256 Checksum
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps Indicator */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {steps.map((s) => (
            <div
              key={s.num}
              onClick={() => {
                if (s.num < currentStep) setCurrentStep(s.num);
              }}
              className={`p-2.5 rounded-lg text-center cursor-pointer transition border ${
                currentStep === s.num
                  ? 'bg-heritage-50 border-heritage-500 text-heritage-900 font-bold'
                  : currentStep > s.num
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-stone-50 border-stone-200 text-slate-400'
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider">Step {s.num}</div>
              <div className="text-xs truncate">{s.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 p-4 rounded-xl text-xs flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Archival Ingestion Error</div>
            <div>{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Step Form Content */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6">
        {/* STEP 1: Basic Identity */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-ink-900 border-b border-stone-200 pb-2">
              Step 1: Document Identity & Classification
            </h2>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Document Title <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Speech on Draft Article 32 (Constituent Assembly of India)"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-heritage-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Subtitle / Alternate Title
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g. 'Heart and Soul of the Constitution' Address"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-heritage-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Document Type <span className="text-rose-600">*</span>
                </label>
                <select
                  value={formData.document_type}
                  onChange={(e) => setFormData({ ...formData, document_type: e.target.value as DocumentType })}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-heritage-500 bg-white"
                >
                  <option value="SPEECH">Speech / Address</option>
                  <option value="BOOK">Book / Monograph</option>
                  <option value="WRITING">Writing / Article</option>
                  <option value="MANUSCRIPT">Manuscript / Facsimile</option>
                  <option value="DEBATE">Constituent Assembly Debate</option>
                  <option value="PHOTOGRAPH">Archival Photograph</option>
                  <option value="HISTORICAL_RECORD">Historical Record / Manifesto</option>
                  <option value="ARCHIVAL_RECORD">Archival Administrative Record</option>
                  <option value="AUDIO">Historical Audio Recording</option>
                  <option value="VIDEO">Historical Video / Newsreel</option>
                  <option value="ESSAY">Academic Essay</option>
                  <option value="LETTER">Correspondence / Letter</option>
                  <option value="GAZETTE">Government Gazette</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Target Collection
                </label>
                <select
                  value={formData.collection_id}
                  onChange={(e) => setFormData({ ...formData, collection_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-heritage-500 bg-white"
                >
                  <option value="">-- Standalone Archival Item --</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Creator / Author <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.creator}
                  onChange={(e) => setFormData({ ...formData, creator: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-heritage-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Primary Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-heritage-500 bg-white"
                >
                  <option value="English">English</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Pali">Pali</option>
                  <option value="Sanskrit">Sanskrit</option>
                  <option value="Gujarati">Gujarati</option>
                  <option value="German">German</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Historical Date & Context */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-ink-900 border-b border-stone-200 pb-2">
              Step 2: Date Precision & Historical Context
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Free-text Date
                </label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  placeholder="e.g. November 25, 1949"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-heritage-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Calendar Year
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="e.g. 1949"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-heritage-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Date Precision
                </label>
                <select
                  value={formData.date_precision}
                  onChange={(e) => setFormData({ ...formData, date_precision: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-heritage-500 bg-white"
                >
                  <option value="EXACT">EXACT (Full Day/Month/Year known)</option>
                  <option value="MONTH">MONTH (Only Month and Year known)</option>
                  <option value="YEAR">YEAR (Only Year known)</option>
                  <option value="APPROXIMATE">APPROXIMATE (Circa / Estimated)</option>
                  <option value="UNKNOWN">UNKNOWN</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Physical Repository Location
              </label>
              <input
                type="text"
                value={formData.physical_location}
                onChange={(e) => setFormData({ ...formData, physical_location: e.target.value })}
                placeholder="e.g. Parliament House Library, New Delhi / British Library, London"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-heritage-500"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Provenance & Rights */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-ink-900 border-b border-stone-200 pb-2">
              Step 3: Provenance, Sourcing & Rights Statements
            </h2>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Authentic Source Organization <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={formData.source_name}
                onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
                placeholder="e.g. Dr. Ambedkar Foundation / Constituent Assembly Debates Archive"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-heritage-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Source Identifier / Shelfmark <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.source_identifier}
                  onChange={(e) => setFormData({ ...formData, source_identifier: e.target.value })}
                  placeholder="e.g. CAD-VOL-XI-1949-11-25-P972"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-heritage-500 font-mono"
                />
                <span className="text-[10px] text-slate-500">
                  Unique primary accession identifier. Duplicate shelfmarks will be rejected.
                </span>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Source URL / Digital Manifest Link
                </label>
                <input
                  type="url"
                  value={formData.source_url}
                  onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                  placeholder="https://loksabha.nic.in/debates"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-heritage-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Rights Statement
                </label>
                <input
                  type="text"
                  value={formData.rights}
                  onChange={(e) => setFormData({ ...formData, rights: e.target.value })}
                  placeholder="e.g. Public Domain / Institutional Open Access"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-heritage-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Access Level
                </label>
                <select
                  value={formData.access_level}
                  onChange={(e) => setFormData({ ...formData, access_level: e.target.value as AccessLevel })}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-heritage-500 bg-white"
                >
                  <option value="PUBLIC">PUBLIC (Open Visitor Access)</option>
                  <option value="RESTRICTED">RESTRICTED (Authenticated Researchers Only)</option>
                  <option value="INTERNAL_ONLY">INTERNAL_ONLY (Archivists Only)</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg flex items-center gap-3">
              <input
                type="checkbox"
                id="demo_data_check"
                checked={formData.is_demo_data}
                onChange={(e) => setFormData({ ...formData, is_demo_data: e.target.checked })}
                className="w-4 h-4 text-heritage-600 rounded border-stone-300"
              />
              <label htmlFor="demo_data_check" className="text-xs text-slate-700 cursor-pointer">
                <strong>Flag as Synthetic Demo Record</strong>
                <p className="text-[11px] text-slate-500">
                  Leave UNCHECKED for authentic historical archival items. Checking this will display a persistent warning banner.
                </p>
              </label>
            </div>
          </div>
        )}

        {/* STEP 4: File Master Upload & Hash */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-ink-900 border-b border-stone-200 pb-2">
              Step 4: Archival Master File & Cryptographic Verification
            </h2>

            <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:border-heritage-500 transition bg-stone-50/50">
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-700">
                Choose Archival Master File
              </div>
              <div className="text-[11px] text-slate-500 mb-4">
                Supported formats: PDF, TXT, DOCX, JPEG, PNG, TIFF, WEBP, MP3, WAV, M4A, MP4, WEBM
              </div>
              <input
                type="file"
                id="file_input"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.txt,.docx,.jpg,.jpeg,.png,.tiff,.webp,.mp3,.wav,.m4a,.mp4,.webm"
              />
              <label
                htmlFor="file_input"
                className="inline-block px-4 py-2 bg-heritage-700 hover:bg-heritage-800 text-white font-semibold text-xs rounded-lg cursor-pointer shadow transition"
              >
                Browse Archival Files
              </label>
            </div>

            {selectedFile && (
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-heritage-600" />
                    <span className="font-mono font-bold text-xs text-ink-900">{selectedFile.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setFileHash(null);
                      setFilePreview(null);
                    }}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Hash Display */}
                <div className="bg-white p-3 rounded-lg border border-stone-200 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono">
                    <span className="flex items-center gap-1 font-bold">
                      <Hash className="w-3.5 h-3.5 text-heritage-600" />
                      SHA-256 Checksum (Client-Side Verification):
                    </span>
                    {hashingProgress && (
                      <span className="text-amber-600 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Computing...
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-xs text-slate-800 break-all bg-stone-50 p-2 rounded border border-stone-200">
                    {fileHash || 'Calculating digest...'}
                  </div>
                </div>

                {/* Image Preview if applicable */}
                {filePreview && (
                  <div className="mt-2 text-center">
                    <img
                      src={filePreview}
                      alt="Archival master preview"
                      className="max-h-48 mx-auto rounded border border-stone-200 shadow-sm"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Dublin Core / Extended Metadata */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-ink-900 border-b border-stone-200 pb-2">
              Step 5: Dublin Core & Subject Classification
            </h2>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Description / Archival Abstract
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed scholarly summary, historical significance, context of address or publication..."
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-heritage-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Subject Keywords (Comma separated)
              </label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="Constituent Assembly, Fundamental Rights, Article 32, Social Democracy, Bhakti in Politics"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-heritage-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Publisher / Sponsoring Body
              </label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-heritage-500"
              />
            </div>
          </div>
        )}

        {/* STEP 6: Curatorial Review & Final Submission */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-ink-900 border-b border-stone-200 pb-2">
              Step 6: Review & Final Ingestion Sign-off
            </h2>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block">Title:</span>
                  <span className="font-bold text-ink-900">{formData.title}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Document Type:</span>
                  <span className="font-mono font-semibold text-heritage-800">{formData.document_type}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Source Identifier / Shelfmark:</span>
                  <span className="font-mono font-semibold text-slate-800">{formData.source_identifier}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Source Body:</span>
                  <span className="font-medium text-slate-800">{formData.source_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Date / Year:</span>
                  <span className="font-medium">{formData.date || formData.year || 'Undated'} ({formData.date_precision})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Access Level:</span>
                  <span className="font-mono font-medium">{formData.access_level}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block">Master File:</span>
                  <span className="font-mono text-slate-700">{selectedFile?.name} ({(Number(selectedFile?.size) / 1024).toFixed(1)} KB)</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block">Cryptographic Checksum (SHA-256):</span>
                  <span className="font-mono text-[11px] text-slate-700 break-all bg-white p-2 rounded border border-stone-200 block">
                    {fileHash}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Archival Review Protocol:</strong> This document will be cataloged with an initial verification status of <span className="font-mono font-bold">UNVERIFIED</span>. It will undergo formal peer verification by a curatorial reviewer before appearing in the public catalog.
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-200">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition ${
              currentStep === 1
                ? 'opacity-40 cursor-not-allowed text-slate-400'
                : 'text-slate-700 hover:bg-stone-100'
            }`}
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-heritage-700 hover:bg-heritage-800 text-white font-semibold text-xs rounded-xl shadow transition"
            >
              Continue to Step {currentStep + 1} <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Ingesting & Verifying Hash...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Ingest Master Record
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
