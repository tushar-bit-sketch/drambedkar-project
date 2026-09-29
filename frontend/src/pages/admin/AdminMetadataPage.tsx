import React from 'react';
import { Tags, ShieldCheck, Database, Check } from 'lucide-react';

export const AdminMetadataPage: React.FC = () => {
  const dublinCoreTerms = [
    { term: 'dc.title', label: 'Title', type: 'String', status: 'Mandatory', desc: 'The official archival or parliamentary title of the document.' },
    { term: 'dc.creator', label: 'Creator', type: 'Entity', status: 'Mandatory', desc: 'Primary author, speaker, or committee chair.' },
    { term: 'dc.date', label: 'Date', type: 'ISO Date', status: 'Mandatory', desc: 'Date of speech delivery, publication, or parliamentary reading.' },
    { term: 'dc.identifier', label: 'Archive ID', type: 'Alphanumeric', status: 'Mandatory', desc: 'Unique accession identifier (e.g. AMB-CAD-1949-042).' },
    { term: 'dc.language', label: 'Language Code', type: 'ISO 639-1', status: 'Mandatory', desc: 'Primary linguistic script of the document (en, mr, hi, pi).' },
    { term: 'dc.rights', label: 'Rights Statement', type: 'License URI', status: 'Mandatory', desc: 'Copyright status, Public Domain declaration, or Open Access terms.' },
    { term: 'dc.source', label: 'Source Provenance', type: 'Text', status: 'Mandatory', desc: 'Original registry, Gazette issue, or physical archive collection.' },
    { term: 'dc.format', label: 'MIME Format', type: 'MIME String', status: 'Mandatory', desc: 'application/pdf, image/tiff, audio/mpeg, video/mp4.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-300 pb-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900">
            Metadata Schema & Standards Management
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Dublin Core metadata definitions, controlled taxonomies, and archival verification rules.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1.5 rounded text-xs font-mono font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>DUBLIN CORE 15 ELEMENTS VERIFIED</span>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-stone-200 flex justify-between items-center text-xs">
          <span className="font-bold text-ink-900 uppercase tracking-wider font-mono">
            Active Dublin Core Extended Terms
          </span>
          <span className="text-slate-500 font-mono">Standard: ANSI/NISO Z39.85</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1B2A4A] text-white uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="p-3.5">Term Key</th>
                <th className="p-3.5">Human Label</th>
                <th className="p-3.5">Data Type</th>
                <th className="p-3.5">Requirement</th>
                <th className="p-3.5">Archival Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {dublinCoreTerms.map((t) => (
                <tr key={t.term} className="hover:bg-stone-50 transition">
                  <td className="p-3.5 font-mono text-heritage-700 font-bold">
                    {t.term}
                  </td>
                  <td className="p-3.5 font-medium text-ink-900">
                    {t.label}
                  </td>
                  <td className="p-3.5 font-mono text-slate-600">
                    {t.type}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-semibold text-[10px]">
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600 max-w-sm">
                    {t.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
