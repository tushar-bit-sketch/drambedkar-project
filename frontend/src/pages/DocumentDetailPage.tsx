import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, FileText } from 'lucide-react';
import { apiService } from '../services/api';
import { DocumentItem } from '../types';
import { PageMasthead } from '../components/layout/PageMasthead';

export const DocumentDetailPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) return;
    apiService.getDocumentById(documentId).then(setDocument).catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : 'Catalogue record could not be loaded.');
    });
  }, [documentId]);

  if (error) {
    return (
      <main className="mx-auto my-16 max-w-2xl space-y-4 border-2 border-ink bg-[#FAF6EE] p-8 text-center text-ink">
        <AlertTriangle className="mx-auto h-10 w-10 text-oxblood" />
        <h1 className="font-serif text-2xl font-black">Catalogue record unavailable</h1>
        <p className="font-editorial text-sm">{error}</p>
        <Link to="/documents" className="inline-flex items-center gap-2 border-2 border-ink bg-ink px-4 py-2 font-mono text-xs font-bold uppercase text-white">
          <ArrowLeft className="h-4 w-4" /> Return to catalogue
        </Link>
      </main>
    );
  }

  if (!document) {
    return <div className="min-h-[40vh] p-10 text-center font-mono text-sm">Loading catalogue record…</div>;
  }

  const fields: Array<[string, string | number | undefined]> = [
    ['Accession identifier', document.archive_id],
    ['Record type', document.document_type],
    ['Creator', document.creator || document.author_name],
    ['Date', document.date || document.date_created || (document.year ? String(document.year) : undefined)],
    ['Language', document.language_name || document.language],
    ['Collection', document.collection_title],
    ['Source reference', document.source_reference],
    ['Source name', document.source_name],
    ['Rights', document.rights],
    ['Catalogue status', document.verification_status],
  ];

  return (
    <div className="min-h-screen bg-newsprint-100 text-ink">
      <PageMasthead
        eyebrow="READ-ONLY CATALOGUE RECORD"
        headline={document.title}
        subheadline={document.subtitle || document.description || 'A metadata record from the bundled catalogue snapshot.'}
        accession={document.archive_id}
        badge={document.verification_status}
      />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <Link to="/documents" className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase text-oxblood hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to catalogue
        </Link>
        <section className="border-2 border-ink bg-[#FAF6EE] p-6 shadow-letterpress">
          <div className="mb-5 flex items-center gap-3 border-b border-ink/20 pb-4">
            <FileText className="h-6 w-6 text-oxblood" />
            <div>
              <h2 className="font-serif text-xl font-black">Catalogue metadata</h2>
              <p className="font-mono text-xs text-ink/70">Metadata snapshot only; not a verified transcription.</p>
            </div>
          </div>
          {document.description && <p className="mb-6 font-editorial text-sm leading-relaxed">{document.description}</p>}
          <dl className="grid gap-4 sm:grid-cols-2">
            {fields.filter(([, value]) => value !== undefined && value !== '').map(([label, value]) => (
              <div key={label} className="border-b border-ink/15 pb-2">
                <dt className="font-mono text-[10px] font-bold uppercase tracking-wide text-ink/60">{label}</dt>
                <dd className="mt-1 break-words font-editorial text-sm">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 border-l-4 border-oxblood bg-white p-3 font-mono text-xs">
            The source file and full text are not included in this static deployment. The catalogue status does not assert independent source verification.
          </p>
        </section>
      </main>
    </div>
  );
};

export default DocumentDetailPage;
