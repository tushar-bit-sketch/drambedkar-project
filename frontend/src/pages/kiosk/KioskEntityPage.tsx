import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Network, Calendar, MapPin, Tag, Volume2, 
  VolumeX, ShieldCheck, CheckCircle2, ChevronRight, FileText
} from 'lucide-react';
import { apiService } from '../../services/api';
import { GraphEntityItem, GraphRelationshipItem, TimelineEvent } from '../../types';

export const KioskEntityPage: React.FC = () => {
  const { entityId } = useParams<{ entityId: string }>();
  const navigate = useNavigate();

  const [entity, setEntity] = useState<GraphEntityItem | null>(null);
  const [relationships, setRelationships] = useState<GraphRelationshipItem[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!entityId) return;
    let mounted = true;
    const idNum = parseInt(entityId, 10);

    Promise.all([
      apiService.getEntity(idNum),
      apiService.getEntityNeighbors(idNum),
      apiService.getEntityTimeline(idNum)
    ]).then(([ent, neighbors, tl]) => {
      if (mounted) {
        setEntity(ent);
        setRelationships(neighbors.edges || []);
        setTimelineEvents(tl);
        setLoading(false);
      }
    }).catch(err => {
      console.warn('Kiosk entity load failed:', err);
      if (mounted) setLoading(false);
    });

    return () => { 
      mounted = false; 
      window.speechSynthesis?.cancel();
    };
  }, [entityId]);

  const handleSpeak = () => {
    if (!entity) return;
    if (speaking) {
      window.speechSynthesis?.cancel();
      setSpeaking(false);
      return;
    }
    if ('speechSynthesis' in window) {
      const text = `${entity.canonical_name}. ${entity.entity_type}. ${entity.description || ''}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4EFE6] flex items-center justify-center p-6">
        <div className="border-2 border-ink bg-[#FAF6EE] p-8 shadow-letterpress text-center max-w-md">
          <div className="font-mono text-xs uppercase tracking-widest text-oxblood mb-2 font-bold animate-pulse">
            Registry Lookup in Progress
          </div>
          <div className="text-ink font-serif font-black text-xl">
            Retrieving Archival Record...
          </div>
          <div className="w-full bg-[#EFE8DA] h-1 border border-ink mt-4 overflow-hidden">
            <div className="bg-oxblood h-full w-1/2 animate-[archival-pulse_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="min-h-screen bg-[#F4EFE6] flex flex-col items-center justify-center p-6">
        <div className="border-2 border-ink bg-[#FAF6EE] p-8 shadow-letterpress text-center max-w-md">
          <h2 className="text-xl font-serif font-bold text-ink mb-2">Record Not Found in Registry</h2>
          <p className="font-editorial text-sm text-ink/75 mb-6">
            The requested biographical entry could not be retrieved from the institutional catalogue.
          </p>
          <button
            onClick={() => navigate('/kiosk/graph')}
            className="px-6 py-3 border-2 border-ink bg-oxblood text-white font-mono font-bold text-xs uppercase tracking-wider shadow-letterpress-sm hover:brightness-110 active:translate-y-0.5 transition"
          >
            Return to Knowledge Graph
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EFE6] flex flex-col p-4 sm:p-6 select-none text-ink">
      {/* Kiosk Top Bar */}
      <div className="bg-[#FAF6EE] text-ink border-2 border-double border-ink p-4 shadow-letterpress flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/kiosk/graph')}
          className="px-4 py-2 border-2 border-ink bg-[#FAF6EE] hover:bg-stone-100 text-ink shadow-letterpress-sm font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 active:translate-y-0.5 transition min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 text-oxblood" />
          <span>Return to Graph</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right pr-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink/60 block">Institutional Dossier</span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-oxblood">ID #{entity.id}</span>
          </div>
          <button
            onClick={handleSpeak}
            className={`px-5 py-2.5 border-2 border-ink shadow-letterpress-sm font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 active:translate-y-0.5 transition min-h-[44px] ${
              speaking 
                ? 'bg-oxblood text-white ring-2 ring-oxblood/30' 
                : 'bg-[#FAF6EE] hover:bg-stone-100 text-ink'
            }`}
          >
            {speaking ? <VolumeX className="w-4 h-4 text-amber-300" /> : <Volume2 className="w-4 h-4 text-oxblood" />}
            <span>{speaking ? 'Halt Audio' : 'Audio Narration'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Dossier Card */}
        <div className="lg:col-span-5 bg-[#FAF6EE] border-2 border-ink p-6 shadow-letterpress flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b-2 border-ink pb-2 mb-3">
              <span className="px-2.5 py-0.5 border border-ink bg-[#EFE8DA] font-mono text-[10px] font-bold uppercase tracking-widest text-ink">
                {entity.entity_type}
              </span>
              <span className="font-mono text-[10px] text-ink/60 uppercase tracking-widest">
                Classified Entry
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-black text-ink mt-2 tracking-tight">
              {entity.canonical_name}
            </h1>

            {(entity.birth_date || entity.death_date) && (
              <div className="flex items-center gap-2 text-xs text-ink/80 font-mono mt-3">
                <Calendar className="w-4 h-4 text-oxblood shrink-0" />
                <span>Lifespan: {entity.birth_date || 'Unknown'} — {entity.death_date || 'Present'}</span>
              </div>
            )}

            {entity.location && (
              <div className="flex items-center gap-2 text-xs text-ink/80 font-mono mt-1.5">
                <MapPin className="w-4 h-4 text-oxblood shrink-0" />
                <span>Station: {entity.location}</span>
              </div>
            )}

            <div className="mt-5 pt-4 border-t-2 border-ink/20">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-oxblood font-mono mb-2">
                Historical Record & Context
              </h3>
              <p className="font-editorial text-sm text-ink leading-relaxed text-justify">
                {entity.description || 'No extended historical biography catalogued in this registry record.'}
              </p>
            </div>

            {entity.aliases && entity.aliases.length > 0 && (
              <div className="mt-5 pt-4 border-t-2 border-ink/20">
                <div className="text-[10px] font-bold uppercase text-ink/60 font-mono mb-2 tracking-wider">
                  Archival Aliases & Titular Variants:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {entity.aliases.map((al, idx) => (
                    <span key={idx} className="px-2 py-0.5 border border-ink/30 bg-[#EFE8DA] font-mono text-[11px] text-ink font-medium">
                      {al}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 mt-6 border-t-2 border-double border-ink">
            <div className="flex items-center justify-between bg-[#EFE8DA] p-3 border border-ink">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-ink">
                <ShieldCheck className="w-4 h-4 text-oxblood" />
                <span>Archival Registry Status</span>
              </div>
              <span className="font-mono text-[10px] font-bold text-oxblood uppercase tracking-widest px-2 py-0.5 bg-[#FAF6EE] border border-oxblood">
                Verified
              </span>
            </div>
          </div>
        </div>

        {/* Right Connections & Timeline */}
        <div className="lg:col-span-7 space-y-4">
          {/* Relationships */}
          <div className="bg-[#FAF6EE] border-2 border-ink p-6 shadow-letterpress">
            <h2 className="text-base font-serif font-bold text-ink mb-4 flex items-center justify-between border-b-2 border-ink pb-2">
              <span className="flex items-center gap-2">
                <Network className="w-4 h-4 text-oxblood" />
                Archival Relations & Affiliations
              </span>
              <span className="font-mono text-xs text-oxblood font-bold">
                [{relationships.length} Documented]
              </span>
            </h2>

            {relationships.length === 0 ? (
              <p className="font-editorial text-xs text-ink/60 italic p-3 bg-[#EFE8DA] border border-ink/30">
                No direct institutional associations registered for this record.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                {relationships.map(rel => {
                  const isSource = rel.source_entity_id === entity.id;
                  const targetName = isSource ? rel.target_name : rel.source_name;
                  const targetId = isSource ? rel.target_entity_id : rel.source_entity_id;

                  return (
                    <button
                      key={rel.id}
                      onClick={() => navigate(`/kiosk/entity/${targetId}`)}
                      className="text-left p-3 bg-[#FAF6EE] hover:bg-[#EFE8DA] border-2 border-ink shadow-letterpress-sm transition active:translate-y-0.5 group"
                    >
                      <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-oxblood group-hover:underline">
                        {(rel.relation_type || rel.relationship_type).replace(/_/g, ' ')}
                      </div>
                      <div className="font-serif font-bold text-ink text-sm mt-0.5 truncate">
                        {targetName}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Timeline Events */}
          <div className="bg-[#FAF6EE] border-2 border-ink p-6 shadow-letterpress">
            <h2 className="text-base font-serif font-bold text-ink mb-4 flex items-center justify-between border-b-2 border-ink pb-2">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-oxblood" />
                Historical Chronology & Milestones
              </span>
              <span className="font-mono text-xs text-oxblood font-bold">
                [{timelineEvents.length} Events]
              </span>
            </h2>

            {timelineEvents.length === 0 ? (
              <p className="font-editorial text-xs text-ink/60 italic p-3 bg-[#EFE8DA] border border-ink/30">
                No chronological milestones linked directly to this record.
              </p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {timelineEvents.map(evt => (
                  <div key={evt.id} className="p-3 bg-[#FAF6EE] border-2 border-ink shadow-letterpress-sm">
                    <div className="flex items-center justify-between gap-2 border-b border-ink/20 pb-1 mb-1.5">
                      <span className="font-mono text-xs font-bold text-oxblood uppercase">
                        {evt.exact_date || evt.year_start}
                      </span>
                      <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 border border-ink/30 bg-[#EFE8DA] font-semibold text-ink">
                        {evt.category}
                      </span>
                    </div>
                    <div className="font-serif font-bold text-ink text-sm">
                      {evt.title}
                    </div>
                    {evt.description && (
                      <p className="font-editorial text-xs text-ink/80 mt-1 line-clamp-2">
                        {evt.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KioskEntityPage;
