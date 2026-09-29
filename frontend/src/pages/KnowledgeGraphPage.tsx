import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, Waypoints } from 'lucide-react';
import { apiService } from '../services/api';
import { GraphEntityItem, GraphRelationshipItem } from '../types';
import { PageMasthead } from '../components/layout/PageMasthead';

type IndexTab = 'entities' | 'relationships';

export const KnowledgeGraphPage: React.FC = () => {
  const [entities, setEntities] = useState<GraphEntityItem[]>([]);
  const [relationships, setRelationships] = useState<GraphRelationshipItem[]>([]);
  const [query, setQuery] = useState('');
  const [entityType, setEntityType] = useState('ALL');
  const [activeTab, setActiveTab] = useState<IndexTab>('entities');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiService.searchEntities({ limit: 200 }),
      apiService.listRelationships({ limit: 200 }),
    ]).then(([entityRecords, relationshipRecords]) => {
      if (!active) return;
      setEntities(entityRecords);
      setRelationships(relationshipRecords);
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : 'The catalogue index could not be loaded.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const entityTypes = useMemo(
    () => Array.from(new Set(entities.map((entity) => entity.entity_type))).sort(),
    [entities],
  );
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredEntities = entities.filter((entity) =>
    (entityType === 'ALL' || entity.entity_type === entityType)
    && `${entity.canonical_name} ${entity.description || ''} ${(entity.alternate_names || []).join(' ')}`
      .toLocaleLowerCase()
      .includes(normalizedQuery),
  );
  const filteredRelationships = relationships.filter((relationship) =>
    `${relationship.source_entity_name || ''} ${relationship.relationship_type} ${relationship.target_entity_name || ''} ${relationship.evidence_reference || ''}`
      .toLocaleLowerCase()
      .includes(normalizedQuery),
  );

  return (
    <div className="min-h-screen bg-newsprint-100 text-ink">
      <PageMasthead
        eyebrow="BUNDLED CATALOGUE • STRUCTURED INDEX"
        headline="People, places & connections"
        subheadline="A searchable, accessible index of names and recorded relationships. Records are catalogue metadata, not independently verified claims."
        accession={`${entities.length} INDEXED ENTITIES`}
        badge="STRUCTURED INDEX"
      />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-3 rounded-xl border border-ink/15 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search the index</span>
            <Search aria-hidden="true" className="absolute left-3 top-3 h-4 w-4 text-ink/45" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search names, descriptions, relationships..."
              className="w-full rounded-lg border border-ink/20 bg-[#FAF8F3] py-2.5 pl-10 pr-3 text-sm tracking-wide focus:border-oxblood focus:outline-none focus:ring-2 focus:ring-oxblood/15"
            />
          </label>
          <select
            value={entityType}
            onChange={(event) => setEntityType(event.target.value)}
            className="rounded-lg border border-ink/20 bg-white px-3 py-2.5 text-sm"
            aria-label="Filter by entity type"
          >
            <option value="ALL">All entity types</option>
            {entityTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Catalogue index">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'entities'}
            onClick={() => setActiveTab('entities')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === 'entities' ? 'bg-ink text-white' : 'border border-ink/15 bg-white hover:bg-[#FAF8F3]'
            }`}
          >
            <Users aria-hidden="true" className="h-4 w-4" /> Entities ({filteredEntities.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'relationships'}
            onClick={() => setActiveTab('relationships')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === 'relationships' ? 'bg-ink text-white' : 'border border-ink/15 bg-white hover:bg-[#FAF8F3]'
            }`}
          >
            <Waypoints aria-hidden="true" className="h-4 w-4" /> Recorded connections ({filteredRelationships.length})
          </button>
        </div>

        {loading ? (
          <p className="rounded-xl border border-ink/15 bg-white p-8 text-center text-sm">Loading the structured index…</p>
        ) : error ? (
          <p role="alert" className="rounded-xl border border-oxblood/30 bg-white p-6 text-sm">{error}</p>
        ) : activeTab === 'entities' ? (
          filteredEntities.length ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {filteredEntities.map((entity) => (
                <li key={entity.id} className="rounded-xl border border-ink/15 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded-full bg-[#F4EFE6] px-2.5 py-1 text-xs font-medium text-ink/70">{entity.entity_type}</span>
                      <h2 className="mt-3 font-serif text-lg font-semibold leading-snug">{entity.canonical_name}</h2>
                    </div>
                    <Link className="shrink-0 text-sm font-medium text-oxblood underline underline-offset-4" to={`/entities/${entity.id}`}>Details</Link>
                  </div>
                  {entity.description && <p className="mt-3 text-sm leading-relaxed text-ink/75">{entity.description}</p>}
                  {entity.alternate_names?.length ? (
                    <p className="mt-3 text-xs leading-relaxed text-ink/60">Also recorded as: {entity.alternate_names.join(', ')}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-ink/15 bg-white p-8 text-center text-sm">No entities match this search.</p>
          )
        ) : filteredRelationships.length ? (
          <ul className="divide-y divide-ink/10 rounded-xl border border-ink/15 bg-white">
            {filteredRelationships.map((relationship) => (
              <li key={relationship.id} className="grid gap-2 p-4 text-sm sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4">
                <Link className="font-semibold text-ink underline-offset-4 hover:text-oxblood hover:underline" to={`/entities/${relationship.source_entity_id}`}>
                  {relationship.source_entity_name || `Entity ${relationship.source_entity_id}`}
                </Link>
                <span className="w-fit rounded-full bg-[#F4EFE6] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink/70">{relationship.relationship_type.replaceAll('_', ' ')}</span>
                <Link className="font-semibold text-ink underline-offset-4 hover:text-oxblood hover:underline" to={`/entities/${relationship.target_entity_id}`}>
                  {relationship.target_entity_name || `Entity ${relationship.target_entity_id}`}
                </Link>
                {relationship.evidence_reference && (
                  <p className="text-xs text-ink/55 sm:col-span-3">Recorded reference: {relationship.evidence_reference}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-ink/15 bg-white p-8 text-center text-sm">No recorded connections match this search.</p>
        )}
        <p className="text-xs leading-relaxed text-ink/60">
          The visual network view has been removed. This structured list is easier to scan with a screen reader, keyboard, or small display.
        </p>
      </main>
    </div>
  );
};
