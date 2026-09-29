import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Upload, FileSpreadsheet, FileCode, CheckCircle2, AlertTriangle, 
  ArrowLeft, RefreshCw, Copy, Check, Info, ShieldAlert
} from 'lucide-react';
import { apiService } from '../../services/api';
import { BatchImportReport } from '../../types';

export const AdminImportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'csv' | 'json'>('json');
  const [jsonText, setJsonText] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [report, setReport] = useState<BatchImportReport | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const sampleJson = JSON.stringify({
    "documents": [
      {
        "title": "Dr. Ambedkar's Address on Labour Legislation and Trade Unions",
        "document_type": "SPEECH",
        "creator": "Dr. B. R. Ambedkar",
        "year": 1943,
        "date": "September 1943",
        "language": "English",
        "source_name": "Dr. Ambedkar Foundation",
        "source_identifier": "DAF-BAWS-VOL-10-LABOUR-1943",
        "rights": "Public Domain / Institutional Heritage",
        "verified": false,
        "is_demo_data": false,
        "description": "Address delivered at the Tripartite Labour Conference regarding wartime industrial dispute regulation and collective bargaining rights."
      }
    ]
  }, null, 2);

  const sampleCsvHeader = `title,document_type,creator,year,date,language,source_name,source_identifier,rights,verified,description
"States and Minorities: What are Their Rights","BOOK","Dr. B. R. Ambedkar",1947,"March 1947","English","Dr. Ambedkar Foundation","DAF-BAWS-VOL-01-SM-1947","Public Domain",true,"Constitution of the United States of India memorandum."`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleJsonImport = async () => {
    setErrorMessage(null);
    setReport(null);
    if (!jsonText.trim()) {
      setErrorMessage('Please paste or upload valid JSON archival records.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      const docs = Array.isArray(parsed) ? parsed : (parsed.documents || [parsed]);
      setIsProcessing(true);
      const result = await apiService.importBatchJson(docs);
      setReport(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse JSON payload.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCsvImport = async () => {
    setErrorMessage(null);
    setReport(null);
    if (!csvFile) {
      setErrorMessage('Please select a CSV catalog file to import.');
      return;
    }

    const form = new FormData();
    form.append('file', csvFile);
    setIsProcessing(true);

    try {
      const result = await apiService.importBatchCsv(form);
      setReport(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process CSV import.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-300 pb-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/documents"
            className="p-2 text-slate-600 hover:text-ink-900 rounded-lg hover:bg-stone-200 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900">
              Batch Archival Ingestion Pipeline
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Bulk import metadata records with 2-level automated duplicate detection (source identifier & checksum).
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => { setActiveTab('json'); setReport(null); setErrorMessage(null); }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'json'
              ? 'border-heritage-600 text-heritage-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileCode className="w-4 h-4" /> JSON Ingestion
        </button>
        <button
          onClick={() => { setActiveTab('csv'); setReport(null); setErrorMessage(null); }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'csv'
              ? 'border-heritage-600 text-heritage-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> CSV Ingestion
        </button>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 p-4 rounded-xl text-xs flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Batch Ingestion Error</div>
            <div>{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Results Report Card */}
      {report && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h2 className="font-serif text-lg font-bold text-ink-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Batch Ingestion Report
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Total Processed: {report.total_processed}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-center">
              <span className="text-[11px] font-mono text-emerald-700 uppercase font-semibold block">Successfully Imported</span>
              <span className="text-2xl font-bold font-mono text-emerald-800">{report.imported_count}</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-center">
              <span className="text-[11px] font-mono text-amber-700 uppercase font-semibold block">Duplicates Skipped</span>
              <span className="text-2xl font-bold font-mono text-amber-800">{report.duplicates_count}</span>
            </div>
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg text-center">
              <span className="text-[11px] font-mono text-rose-700 uppercase font-semibold block">Errors</span>
              <span className="text-2xl font-bold font-mono text-rose-800">{report.errors_count}</span>
            </div>
          </div>

          {report.duplicate_identifiers && report.duplicate_identifiers.length > 0 && (
            <div className="space-y-1 bg-stone-50 p-3 rounded-lg border border-stone-200 text-xs">
              <span className="font-semibold text-slate-700 block">Skipped Duplicate Identifiers / Shelfmarks:</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {report.duplicate_identifiers.map((dup, idx) => (
                  <span key={idx} className="font-mono text-[11px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                    {dup}
                  </span>
                ))}
              </div>
            </div>
          )}

          {report.errors && report.errors.length > 0 && (
            <div className="space-y-1 bg-rose-50 p-3 rounded-lg border border-rose-200 text-xs text-rose-800">
              <span className="font-bold block">Error Log:</span>
              <ul className="list-disc pl-4 space-y-0.5 font-mono text-[11px]">
                {report.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2">
            <Link
              to="/admin/documents"
              className="inline-block px-4 py-2 bg-heritage-700 hover:bg-heritage-800 text-white font-semibold text-xs rounded-lg transition"
            >
              View Document Catalog
            </Link>
          </div>
        </div>
      )}

      {/* JSON TAB */}
      {activeTab === 'json' && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-sm text-ink-900">
                JSON Archival Document Ingestion
              </h3>
              <p className="text-xs text-slate-500">
                Paste array of archival document metadata objects.
              </p>
            </div>
            <button
              onClick={() => handleCopy(sampleJson)}
              className="flex items-center gap-1 text-xs text-heritage-700 hover:text-heritage-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded-md font-mono"
            >
              {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedTemplate ? 'Copied Template' : 'Copy Sample Schema'}
            </button>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              JSON Document Array
            </label>
            <textarea
              rows={12}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder={`{\n  "documents": [\n    {\n      "title": "Speech on Labour...",\n      "document_type": "SPEECH",\n      "creator": "Dr. B. R. Ambedkar",\n      "year": 1943,\n      "source_name": "Dr. Ambedkar Foundation",\n      "source_identifier": "DAF-BAWS-VOL-10-LABOUR-1943",\n      "rights": "Public Domain"\n    }\n  ]\n}`}
              className="w-full font-mono text-xs p-3 border border-stone-300 rounded-xl focus:outline-none focus:border-heritage-500 bg-stone-50/50"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setJsonText(sampleJson)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-stone-100 rounded-lg transition"
            >
              Load Example Schema
            </button>
            <button
              onClick={handleJsonImport}
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2.5 bg-heritage-700 hover:bg-heritage-800 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isProcessing ? 'Processing Ingestion...' : 'Execute JSON Batch Ingestion'}
            </button>
          </div>
        </div>
      )}

      {/* CSV TAB */}
      {activeTab === 'csv' && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-sm text-ink-900">
                CSV Catalog File Ingestion
              </h3>
              <p className="text-xs text-slate-500">
                Upload comma-separated archival catalog records.
              </p>
            </div>
            <button
              onClick={() => handleCopy(sampleCsvHeader)}
              className="flex items-center gap-1 text-xs text-heritage-700 hover:text-heritage-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded-md font-mono"
            >
              {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedTemplate ? 'Copied CSV Headers' : 'Copy CSV Header Sample'}
            </button>
          </div>

          <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:border-heritage-500 transition bg-stone-50/50">
            <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <div className="text-xs font-bold text-slate-700">
              Select Archival CSV File
            </div>
            <div className="text-[11px] text-slate-500 mb-4">
              Columns: title, document_type, creator, year, source_name, source_identifier, rights
            </div>
            <input
              type="file"
              id="csv_input"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setCsvFile(e.target.files[0]);
                }
              }}
              className="hidden"
              accept=".csv"
            />
            <label
              htmlFor="csv_input"
              className="inline-block px-4 py-2 bg-heritage-700 hover:bg-heritage-800 text-white font-semibold text-xs rounded-lg cursor-pointer shadow transition"
            >
              Choose CSV File
            </label>
            {csvFile && (
              <div className="mt-3 font-mono text-xs text-heritage-800 font-bold">
                Selected: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleCsvImport}
              disabled={isProcessing || !csvFile}
              className="flex items-center gap-2 px-5 py-2.5 bg-heritage-700 hover:bg-heritage-800 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isProcessing ? 'Processing CSV...' : 'Ingest CSV Records'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
