import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Film } from 'lucide-react';
import { PageMasthead } from '../components/layout/PageMasthead';
import { mediaApi } from '../services/mediaApi';
import { MediaAsset } from '../types/media';

export const MediaDetailPage: React.FC = () => {
  const { mediaId } = useParams<{ mediaId: string }>();
  const [asset, setAsset] = useState<MediaAsset | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = Number(mediaId);
    if (!Number.isSafeInteger(id) || id < 1) {
      setError('Invalid media catalogue identifier.');
      return;
    }
    mediaApi.getMediaAsset(id).then(setAsset).catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : 'Media catalogue record could not be loaded.');
    });
  }, [mediaId]);

  if (error) {
    return (
      <main className="mx-auto my-16 max-w-2xl space-y-4 border-2 border-ink bg-[#FAF6EE] p-8 text-center text-ink">
        <AlertTriangle className="mx-auto h-10 w-10 text-oxblood" />
        <h1 className="font-serif text-2xl font-black">Media record unavailable</h1>
        <p className="font-editorial text-sm">{error}</p>
        <Link to="/media" className="inline-flex items-center gap-2 border-2 border-ink bg-ink px-4 py-2 font-mono text-xs font-bold uppercase text-white">
          <ArrowLeft className="h-4 w-4" /> Return to media catalogue
        </Link>
      </main>
    );
  }

  if (!asset) {
    return <div className="min-h-[40vh] p-10 text-center font-mono text-sm">Loading media catalogue record…</div>;
  }

  const fields: Array<[string, string | number | undefined]> = [
    ['Media type', asset.media_type],
    ['Format', asset.format || asset.file_format],
    ['Date recorded', asset.date_recorded || asset.date],
    ['Language', asset.original_language || asset.language],
    ['Location', asset.location],
    ['Creator', asset.creator],
    ['Catalogue status', asset.verification_status],
  ];

  return (
    <div className="min-h-screen bg-newsprint-100 text-ink">
      <PageMasthead
        eyebrow="READ-ONLY MEDIA CATALOGUE"
        headline={asset.title}
        subheadline={asset.description || 'A media metadata record from the bundled catalogue snapshot.'}
        accession={`RECORD ID: ${asset.id}`}
        badge="MEDIA FILE NOT HELD"
      />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <Link to="/media" className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase text-oxblood hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to media catalogue
        </Link>
        <section className="border-2 border-ink bg-[#FAF6EE] p-6 shadow-letterpress">
          <div className="mb-5 flex items-center gap-3 border-b border-ink/20 pb-4">
            <Film className="h-6 w-6 text-oxblood" />
            <div>
              <h2 className="font-serif text-xl font-black">Media metadata</h2>
              <p className="font-mono text-xs text-ink/70">No stream, download, transcript, or checksum is bundled.</p>
            </div>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            {fields.filter(([, value]) => value !== undefined && value !== '').map(([label, value]) => (
              <div key={label} className="border-b border-ink/15 pb-2">
                <dt className="font-mono text-[10px] font-bold uppercase tracking-wide text-ink/60">{label}</dt>
                <dd className="mt-1 break-words font-editorial text-sm">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 border-l-4 border-oxblood bg-white p-3 font-mono text-xs">
            This entry describes a catalogue record only. The underlying media file is not held by this static frontend and has not been integrity-checked here.
          </p>
        </section>
      </main>
    </div>
  );
};

export default MediaDetailPage;
