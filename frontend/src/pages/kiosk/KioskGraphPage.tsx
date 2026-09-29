import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Network, Search, ZoomIn, ZoomOut, RotateCcw, 
  ArrowRight, Info, Layers, ChevronRight, X, ExternalLink, ShieldCheck
} from 'lucide-react';
import { apiService } from '../../services/api';
import { GraphEntityItem, GraphRelationshipItem } from '../../types';

export const KioskGraphPage: React.FC = () => {
  const navigate = useNavigate();
  const [entities, setEntities] = useState<GraphEntityItem[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<GraphEntityItem | null>(null);
  const [neighbors, setNeighbors] = useState<GraphRelationshipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Canvas zoom/pan state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let mounted = true;
    apiService.searchEntities({ limit: 60 }).then(data => {
      if (mounted) {
        setEntities(data);
        if (data.length > 0) {
          handleSelectEntity(data[0]);
        }
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const handleSelectEntity = async (entity: GraphEntityItem) => {
    setSelectedEntity(entity);
    try {
      const neighborData = await apiService.getEntityNeighbors(entity.id);
      setNeighbors(neighborData.edges || []);
    } catch {
      setNeighbors([]);
    }
  };

  const entityTypes = ['ALL', 'Person', 'Organization', 'Event', 'Concept', 'Location'];

  const filteredEntities = entities.filter(e => {
    const matchesSearch = e.canonical_name.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || e.entity_type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-[#F4EFE6] flex flex-col p-4 sm:p-6 select-none text-ink">
      {/* Kiosk Header */}
      <div className="bg-[#FAF6EE] text-ink border-2 border-double border-ink p-5 sm:p-6 shadow-letterpress flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white text-oxblood flex items-center justify-center border-2 border-ink shadow-letterpress-sm font-bold text-2xl shrink-0">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-oxblood uppercase tracking-widest font-bold">
              [ EXHIBITION REPOSITORY • TOUCH ONTOLOGY WEB ]
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-ink mt-0.5">
              Interactive Historical Knowledge Network
            </h1>
            <p className="text-xs text-ink/80 font-editorial italic mt-0.5">
              Touch to explore historical figures, movements, treatises, and their primary archival connections.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => navigate('/kiosk/timeline')}
            className="px-4 py-2.5 bg-white hover:bg-ink hover:text-white text-ink border-2 border-ink text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition shadow-letterpress-sm"
          >
            [ Switch to Chronology &rarr; ]
          </button>
        </div>
      </div>

      {/* Main Touch Interaction Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Entity Directory (Touch Friendly Buttons) */}
        <div className="lg:col-span-4 bg-[#FAF6EE] border-2 border-ink shadow-letterpress p-4 flex flex-col h-[76vh]">
          <div className="text-[11px] font-mono text-oxblood uppercase font-bold tracking-wider mb-2">
            SELECT ENTITY TO INSPECT
          </div>

          {/* Search bar */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-ink/40 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search historical figures, organizations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white border-2 border-ink text-xs font-mono text-ink placeholder:text-ink/40 focus:outline-none focus:border-oxblood shadow-letterpress-sm"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none font-mono text-xs">
            {entityTypes.map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 border text-xs font-bold uppercase whitespace-nowrap transition ${
                  filterType === t
                    ? 'bg-oxblood text-white border-oxblood shadow-letterpress-sm'
                    : 'bg-white text-ink border-ink/40 hover:border-ink'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Scrollable Entity List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredEntities.map(entity => {
              const isSelected = selectedEntity?.id === entity.id;
              return (
                <button
                  key={entity.id}
                  onClick={() => handleSelectEntity(entity)}
                  className={`w-full text-left p-3.5 border-2 transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-white border-oxblood shadow-letterpress-sm'
                      : 'bg-white/80 border-ink/30 hover:border-ink'
                  }`}
                >
                  <div>
                    <div className="font-serif font-black text-ink text-sm">{entity.canonical_name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] uppercase font-bold font-mono px-1.5 py-0.2 bg-[#EFE8DA] text-ink border border-ink/30">
                        {entity.entity_type}
                      </span>
                      {entity.birth_date && (
                        <span className="text-[10px] text-ink/70 font-mono">
                          {entity.birth_date} — {entity.death_date || 'Present'}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-oxblood' : 'text-ink/30'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Detail & Network View */}
        <div className="lg:col-span-8 bg-[#FAF6EE] border-2 border-ink shadow-letterpress p-6 sm:p-8 flex flex-col h-[76vh] overflow-y-auto">
          {selectedEntity ? (
            <div className="space-y-6">
              {/* Entity Hero */}
              <div className="border-b-2 border-ink pb-5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-oxblood text-white text-xs font-mono font-bold uppercase border border-ink tracking-wider">
                    {selectedEntity.entity_type}
                  </span>
                  <button
                    onClick={() => navigate(`/kiosk/entity/${selectedEntity.id}`)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-ink hover:bg-oxblood text-white border border-ink text-xs font-mono font-bold uppercase transition shadow-letterpress-sm"
                  >
                    <span>[ Full Archival Dossier ]</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h2 className="text-2xl sm:text-3xl font-serif font-black text-ink mt-3">
                  {selectedEntity.canonical_name}
                </h2>

                <p className="text-sm text-ink/90 font-editorial leading-relaxed mt-2">
                  {selectedEntity.description || 'No biographical overview recorded in the canonical archive.'}
                </p>
              </div>

              {/* Connected Relationships in the Graph */}
              <div>
                <h3 className="text-base font-serif font-black text-ink mb-3 flex items-center gap-2 uppercase tracking-wide">
                  <Network className="w-4 h-4 text-oxblood" />
                  Verified Archival Relationships ({neighbors.length})
                </h3>

                {neighbors.length === 0 ? (
                  <div className="p-6 bg-white border-2 border-ink text-center text-xs font-mono text-ink/60">
                    No connected relationships cataloged for this entity.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {neighbors.map(rel => {
                      const isSource = rel.source_entity_id === selectedEntity.id;
                      const partnerName = isSource ? rel.target_name : rel.source_name;
                      const partnerId = isSource ? rel.target_entity_id : rel.source_entity_id;

                      return (
                        <div
                          key={rel.id}
                          className="p-4 bg-white border-2 border-ink shadow-letterpress-sm space-y-2"
                        >
                          <div className="text-[10px] font-mono uppercase text-oxblood font-bold tracking-wider">
                            {(rel.relation_type || rel.relationship_type).replace(/_/g, ' ')}
                          </div>
                          <div className="font-serif font-bold text-ink text-base">
                            {partnerName}
                          </div>
                          {rel.evidence_text && (
                            <div className="text-xs italic text-ink/90 line-clamp-2 bg-[#FAF6EE] p-2.5 border border-ink/40 font-editorial">
                              "{rel.evidence_text}"
                            </div>
                          )}
                          <div className="mt-2 flex items-center justify-between text-[11px] font-mono pt-1 border-t border-ink/20">
                            <span className="text-ink/60 font-mono">
                              {rel.confidence ? `Conf: ${(rel.confidence * 100).toFixed(0)}%` : 'Verified'}
                            </span>
                            <button
                              onClick={() => {
                                const target = entities.find(e => e.id === partnerId);
                                if (target) handleSelectEntity(target);
                              }}
                              className="text-oxblood font-bold hover:underline uppercase flex items-center gap-1"
                            >
                              [ Explore Node &rarr; ]
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-ink/40 font-mono">
              <Network className="w-16 h-16 mb-2 stroke-1 text-oxblood" />
              <p className="text-sm">[ Select an entity from the ledger to view archival connections ]</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KioskGraphPage;
