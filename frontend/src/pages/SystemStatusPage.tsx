import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Database, ShieldCheck } from 'lucide-react';
import archiveData from '../data/archiveData.json';
import { PageMasthead } from '../components/layout/PageMasthead';

const futureWork = [
  {
    title: 'Authentication and staff roles',
    description: 'Planned for a future implementation with secure sign-in and role-based staff access.',
    icon: ShieldCheck,
  },
  {
    title: 'Database and shared writes',
    description: 'Prototype website, database will be ready and is planned for future implementation.',
    icon: Database,
  },
];

export const SystemStatusPage: React.FC = () => (
  <div className="min-h-screen bg-newsprint-100 text-ink">
    <PageMasthead
      eyebrow="PROTOTYPE WEBSITE • IMPLEMENTATION ROADMAP"
      headline="Deployment status"
      subheadline="A working frontend prototype today, with secure multi-user capabilities planned for future implementation."
      accession="FRONTEND PROTOTYPE"
      badge="ROADMAP"
    />
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      <section className="rounded-xl border border-ink/15 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-oxblood">Future implementation</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold">Planned platform capabilities</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {futureWork.map(({ title, description, icon: Icon }) => (
            <article key={title} className="rounded-lg border border-ink/15 bg-[#FAF8F3] p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start gap-4">
                <span className="rounded-lg bg-[#EFE8DA] p-2.5 text-oxblood"><Icon aria-hidden="true" className="h-5 w-5" /></span>
                <div>
                  <h3 className="font-serif text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/75">{description}</p>
                </div>
              </div>
              <p className="mt-4 inline-flex items-center rounded-full bg-[#F4EFE6] px-3 py-1 text-xs font-semibold tracking-wide text-ink/75">PLANNED</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-ink/15 bg-[#F8F5EE] p-5 sm:p-6" aria-labelledby="snapshot-heading">
        <h2 id="snapshot-heading" className="font-serif text-xl font-semibold">Current prototype snapshot</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/75">
          This read-only preview includes {archiveData.documents.length} catalogue records, {archiveData.collections.length} collections, {archiveData.entities.length} indexed entities, and a sourced historical timeline. It does not make live server-health claims.
        </p>
      </section>

      <Link to="/" className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-oxblood">
        Return to archive <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </main>
  </div>
);
