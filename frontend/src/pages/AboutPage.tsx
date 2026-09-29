import React from 'react';
import { BookOpen, Database, ShieldAlert } from 'lucide-react';
import { DemoBanner } from '../components/archive/DemoBanner';
import { TypewriterText } from '../components/layout/TypewriterText';

export const AboutPage: React.FC = () => (
  <div className="min-h-screen bg-[#F4EFE6] pb-16 text-ink">
    <DemoBanner />
    <section className="border-b-2 border-double border-ink bg-[#FAF6EE] px-4 py-10 shadow-sm sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-3 text-center">
        <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-oxblood">Project overview • static catalogue</span>
        <h1 className="font-serif text-3xl font-black tracking-tight sm:text-5xl">Ambedkar Digital Heritage Archive</h1>
        <p className="mx-auto max-w-2xl font-editorial text-sm italic leading-relaxed text-stone-700">
          <TypewriterText text="A browser-based catalogue interface for exploring metadata associated with the historical legacy of Dr. B. R. Ambedkar." />
        </p>
      </div>
    </section>

    <main className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <section className="space-y-4 border-2 border-ink bg-[#FAF6EE] p-8 shadow-letterpress">
        <h2 className="font-serif text-2xl font-black uppercase tracking-wide">What this deployment contains</h2>
        <p className="font-editorial text-sm leading-relaxed">
          The Vercel application is a static React site. Its catalogue pages read a bundled metadata snapshot in the browser; they do not connect to an archive service or retrieve source files.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 border border-ink/25 bg-white p-5">
            <Database className="h-5 w-5 text-oxblood" />
            <h3 className="font-serif text-lg font-bold">Catalogue only</h3>
            <p className="font-editorial text-xs leading-relaxed text-stone-700"><TypewriterText text="Records are marked catalogued, not independently source-verified. The snapshot excludes OCR/transcription text and local file paths." delay={18} /></p>
          </div>
          <div className="space-y-2 border border-ink/25 bg-white p-5">
            <ShieldAlert className="h-5 w-5 text-oxblood" />
            <h3 className="font-serif text-lg font-bold">No server capabilities</h3>
            <p className="font-editorial text-xs leading-relaxed text-stone-700"><TypewriterText text="Login, editing, uploads, file delivery, processing, live integrity checks, and model-backed research are not available in this frontend-only deployment." delay={18} /></p>
          </div>
        </div>
      </section>
      <section className="space-y-2 border-2 border-ink bg-[#FAF6EE] p-6 shadow-letterpress-sm">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-oxblood" />
          <h2 className="font-serif text-xl font-black">Data and provenance</h2>
        </div>
        <p className="font-editorial text-sm leading-relaxed text-stone-700">
          Descriptive source references, when present, are copied from the catalogue snapshot and have not been independently checked by this deployment. Consult the cited repositories and source materials before relying on any record for scholarship.
        </p>
      </section>
    </main>
  </div>
);
