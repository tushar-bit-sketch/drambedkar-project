import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Network, Clock, BookOpen, MapPin, Calendar, 
  ShieldCheck, ArrowLeft, ExternalLink, Share2, Layers,
  ChevronRight, AlertTriangle, FileText
} from 'lucide-react';
import { apiService } from '../services/api';
import { GraphEntityItem, GraphRelationshipItem, TimelineEvent } from '../types';
import { ProvenanceChainViewer } from '../components/archive/ProvenanceChainViewer';
import { DemoBanner } from '../components/archive/DemoBanner';

import { PageMasthead } from '../components/layout/PageMasthead';

export const EntityDetailPage: React.FC = () => {
  const { entityId } = useParams<{ entityId: string }>();
  const navigate = useNavigate();

  const [entity, setEntity] = useState<GraphEntityItem | null>(null);
  const [relationships, setRelationships] = useState<GraphRelationshipItem[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Provenance viewer state
  const [selectedRelId, setSelectedRelId] = useState<number | null>(null);

  const idNum = parseInt(entityId || '', 10);

  useEffect(() => {
    if (isNaN(idNum)) {
      setError('Invalid entity ID');
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    Promise.all([
      apiService.getEntity(idNum),
      apiService.getEntityRelationships(idNum),
      apiService.getEntityTimeline(idNum)
    ]).then(([ent, rels, tEvents]) => {
      if (mounted) {
        setEntity(ent);
        setRelationships(rels);
        setTimelineEvents(tEvents);
        setLoading(false);
      }
    }).catch(err => {
      if (mounted) {
        setError(err.message || 'Entity not found');
        setLoading(false);
      }
    });

    return () => { mounted = false; };
  }, [idNum]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4EFE6] flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-[#FAF6EE] border-2 border-ink p-8 text-center shadow-letterpress">
          <div className="archival-loading-bar mb-4" />
          <h2 className="font-serif font-black text-xl text-ink">Accessing Custodial Dossier</h2>
          <p className="text-xs font-mono text-ink/70 mt-2">RETRIEVING HISTORICAL ENTITY PROVENANCE & RELATIONS...</p>
        </div>
      </div>
    );
  }

  if (error || !entity) {
    return (
      <div className="min-h-screen bg-[#F4EFE6] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#FAF6EE] border-2 border-ink p-8 text-center shadow-letterpress">
          <AlertTriangle className="w-10 h-10 text-oxblood mx-auto mb-3" />
          <h2 className="font-serif font-black text-xl text-ink mb-1">Entity Record Not Located</h2>
          <p className="text-ink/80 text-xs font-editorial mb-6">{error || 'Requested entity does not exist in the active archival registry.'}</p>
          <Link
            to="/knowledge-graph"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-ink text-white text-xs font-mono font-bold uppercase hover:bg-oxblood transition border border-ink shadow-letterpress-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> [ Return to Knowledge Graph ]
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-ink pb-16">
      <DemoBanner />

      {/* Top Gazette Masthead */}
      <PageMasthead
        eyebrow="Archival Records Office • Entity Dossier Bureau"
        headline={entity.canonical_name}
        subheadline={entity.description ? entity.description.slice(0, 160) + '...' : 'Verified historical entity record and relational graph index.'}
        accession={`RECORD #${entity.id} • TYPE: ${entity.entity_type.toUpperCase()}`}
        badge={`SEAL: ${entity.verification_status.toUpperCase()}`}
        rightSlot={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-ink text-xs font-mono font-bold uppercase hover:bg-[#E2D7C3] transition border border-ink shadow-letterpress-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> [ Return ]
            </button>
            <Link
              to="/knowledge-graph"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-ink text-white text-xs font-mono font-bold uppercase hover:bg-oxblood transition border border-ink shadow-letterpress-sm"
            >
              <Network className="w-3.5 h-3.5" /> [ Graph Web ]
            </Link>
          </div>
        }
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Profile Card / Archival Dossier */}
        <section className="bg-[#FAF6EE] border-2 border-ink p-6 sm:p-8 shadow-letterpress space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b-2 border-ink pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-oxblood text-white border border-ink">
                  {entity.entity_type}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-oxblood bg-red-50 px-2 py-0.5 border border-oxblood">
                  <ShieldCheck className="w-3 h-3" /> SEAL: {entity.verification_status}
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-black text-ink">
                {entity.canonical_name}
              </h1>
              {entity.alternate_names && entity.alternate_names.length > 0 && (
                <p className="text-xs font-mono text-ink/70">
                  RECORD ALIASES: <span className="text-ink font-bold italic">{entity.alternate_names.join(', ')}</span>
                </p>
              )}
            </div>

            {/* Quick CTAs */}
            <div className="flex items-center gap-2 self-start">
              <button
                onClick={() => navigate(`/timeline?entity_id=${entity.id}`)}
                className="flex items-center gap-1.5 px-3 py-2 bg-ink hover:bg-oxblood text-white text-xs font-mono font-bold uppercase transition border border-ink shadow-letterpress-sm"
              >
                <Clock className="w-3.5 h-3.5 text-white" /> [ Gazette Milestones ]
              </button>
            </div>
          </div>

          {/* Description */}
          {entity.description && (
            <div className="space-y-2">
              <h2 className="text-xs font-mono uppercase tracking-widest text-oxblood font-bold">
                HISTORICAL PROFILE & ARCHIVAL MEMOIR
              </h2>
              <p className="font-editorial text-ink text-sm sm:text-base leading-relaxed">
                {entity.description}
              </p>
            </div>
          )}

          {/* Historical Attributes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-ink/20 text-xs font-mono">
            {(entity.birth_date || entity.death_date) && (
              <div className="flex items-start gap-2 bg-white p-3 border-2 border-ink shadow-letterpress-sm">
                <Calendar className="w-4 h-4 text-oxblood shrink-0 mt-0.5" />
                <div>
                  <span className="text-ink/60 block text-[10px] uppercase font-mono">Lifespan Era</span>
                  <span className="font-bold text-ink font-mono text-xs">
                    {entity.birth_date || '?'} – {entity.death_date || 'Present'}
                  </span>
                </div>
              </div>
            )}
            {entity.location && (
              <div className="flex items-start gap-2 bg-white p-3 border-2 border-ink shadow-letterpress-sm">
                <MapPin className="w-4 h-4 text-oxblood shrink-0 mt-0.5" />
                <div>
                  <span className="text-ink/60 block text-[10px] uppercase font-mono">Seat / Locale</span>
                  <span className="font-bold text-ink text-xs">{entity.location}</span>
                </div>
              </div>
            )}
            {entity.source_reference && (
              <div className="flex items-start gap-2 bg-white p-3 border-2 border-ink shadow-letterpress-sm">
                <FileText className="w-4 h-4 text-oxblood shrink-0 mt-0.5" />
                <div>
                  <span className="text-ink/60 block text-[10px] uppercase font-mono">Custodial Citation</span>
                  <span className="font-mono font-bold text-ink text-[11px] truncate block max-w-[200px]">
                    {entity.source_reference}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Connected Knowledge Graph Relationships */}
        <section className="bg-[#FAF6EE] border-2 border-ink p-6 sm:p-8 shadow-letterpress space-y-4">
          <div className="flex items-center justify-between border-b-2 border-ink pb-3">
            <div>
              <h2 className="font-serif font-black text-xl text-ink flex items-center gap-2">
                <Network className="w-5 h-5 text-oxblood" />
                Verified Archival Links & Relational Ties
              </h2>
              <p className="text-ink/80 text-xs font-editorial">
                Relationships are included as catalogue metadata and have not been independently verified here.
              </p>
            </div>
            <span className="font-mono text-xs text-ink/70 font-bold">LINKS: {relationships.length}</span>
          </div>

          {relationships.length === 0 ? (
            <p className="text-xs font-mono text-ink/60 italic py-4 text-center">
              No direct relationships cataloged yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {relationships.map(rel => {
                const isSource = rel.source_entity_id === entity.id;
                const otherName = isSource ? rel.target_entity_name : rel.source_entity_name;
                const otherId = isSource ? rel.target_entity_id : rel.source_entity_id;
                const otherType = isSource ? rel.target_entity_type : rel.source_entity_type;

                return (
                  <div
                    key={rel.id}
                    className="p-3.5 border-2 border-ink bg-white space-y-2 shadow-letterpress-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#EFE8DA] text-ink border border-ink">
                        {rel.relationship_type}
                      </span>
                      <span className="text-[10px] font-mono text-oxblood font-bold bg-red-50 px-1.5 py-0.5 border border-oxblood">
                        {rel.verification_status}
                      </span>
                    </div>

                    <div className="text-xs font-mono">
                      <span className="text-ink/60">{isSource ? 'Direct link to:' : 'Incoming citation from:'}</span>{' '}
                      <Link 
                        to={`/entities/${otherId}`} 
                        className="font-bold text-ink hover:text-oxblood font-serif text-sm underline"
                      >
                        {otherName}
                      </Link>{' '}
                      <span className="text-ink/60 font-mono text-[10px]">({otherType})</span>
                    </div>

                    {rel.evidence_text && (
                      <p className="text-xs text-ink/90 italic bg-[#FAF6EE] p-2 border border-ink/30 font-editorial line-clamp-2">
                        "{rel.evidence_text}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-ink/20 text-[11px] font-mono">
                      <span className="text-ink/60">
                        {rel.confidence_label || `Conf: ${Math.round(rel.confidence * 100)}%`}
                      </span>
                      <button
                        onClick={() => setSelectedRelId(rel.id)}
                        className="text-oxblood hover:text-ink font-bold flex items-center gap-1 uppercase"
                      >
                        [ Provenance Trail ] <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Timeline Milestones Featuring Entity */}
        {timelineEvents.length > 0 && (
          <section className="bg-[#FAF6EE] border-2 border-ink p-6 sm:p-8 shadow-letterpress space-y-4">
            <div className="flex items-center justify-between border-b-2 border-ink pb-3">
              <div>
                <h2 className="font-serif font-black text-xl text-ink flex items-center gap-2">
                  <Clock className="w-5 h-5 text-oxblood" />
                  Chronological Gazette Milestones
                </h2>
                <p className="text-ink/80 text-xs font-editorial">
                  Key historical moments in which this entity participated or was documented.
                </p>
              </div>
              <span className="font-mono text-xs text-ink/70 font-bold">MILESTONES: {timelineEvents.length}</span>
            </div>

            <div className="space-y-3 pt-2">
              {timelineEvents.map(ev => (
                <div key={ev.id} className="p-3.5 bg-white border-2 border-ink flex items-start gap-4 shadow-letterpress-sm">
                  <div className="w-16 shrink-0 text-center bg-[#EFE8DA] p-1.5 border border-ink">
                    <span className="font-mono font-black text-sm text-oxblood block">{ev.year}</span>
                    <span className="font-mono text-[9px] text-ink/70 block uppercase font-bold">{ev.date_precision || 'YEAR'}</span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-serif font-bold text-ink text-sm sm:text-base">{ev.title}</h3>
                    <p className="text-xs sm:text-sm text-ink/80 leading-relaxed font-editorial">{ev.description}</p>
                    {ev.exact_date && (
                      <p className="text-[10px] font-mono text-ink/60">EXACT RECORD: {ev.exact_date}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Provenance Drawer Modal */}
        {selectedRelId && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="max-w-xl w-full max-h-[90vh] overflow-y-auto">
              <ProvenanceChainViewer
                relationshipId={selectedRelId}
                onClose={() => setSelectedRelId(null)}
                onOpenDocument={(docId) => navigate(`/documents`)}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
