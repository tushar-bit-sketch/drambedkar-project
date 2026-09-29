import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Clock, MapPin, Users, Network, List, X, ExternalLink
} from 'lucide-react';
import { apiService } from '../services/api';
import { TimelineEvent } from '../types';
import { DemoBanner } from '../components/archive/DemoBanner';
import { PageMasthead } from '../components/layout/PageMasthead';

export const TimelinePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeEvent, setActiveEvent] = useState<TimelineEvent | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'accessible_table'>('timeline');
  const [loading, setLoading] = useState(true);

  // Filter by entity if passed in query string: ?entity_id=...
  const entityIdParam = searchParams.get('entity_id');
  const entityId = entityIdParam ? parseInt(entityIdParam, 10) : undefined;
  const [filteredEntityName, setFilteredEntityName] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    if (entityId) {
      apiService.getEntity(entityId).then(ent => {
        if (mounted) setFilteredEntityName(ent.canonical_name);
      }).catch(() => {});
    } else {
      setFilteredEntityName(null);
    }

    apiService.getTimelineEvents({ entity_id: entityId }).then(res => {
      if (mounted) {
        setEvents(res);
        if (res.length > 0) setActiveEvent(res[0]);
        setLoading(false);
      }
    }).catch(err => {
      if (mounted) {
        console.warn('Timeline fetch error:', err);
        setError(err.message || 'Catalogue timeline data could not be loaded.');
        setEvents([]);
        setLoading(false);
      }
    });

    return () => { mounted = false; };
  }, [entityId]);

  const categories = [
    'ALL',
    'Early Life',
    'Constitutional',
    'Social Movements',
    'Labour Reforms',
    'Legacy'
  ];

  const filteredEvents = selectedCategory === 'ALL'
    ? events
    : events.filter(e => e.category?.toLowerCase().includes(selectedCategory.toLowerCase()));

  // Formatter for date based on strict historical precision
  const formatEventDate = (event: TimelineEvent) => {
    if (event.date_precision === 'EXACT_DAY' && event.exact_date) {
      return event.exact_date;
    }
    if (event.date_precision === 'MONTH' && event.exact_date) {
      return event.exact_date;
    }
    if (event.date_precision === 'DECADE') {
      return `${event.year}s`;
    }
    if (event.date_precision === 'APPROXIMATE') {
      return `c. ${event.year}`;
    }
    return String(event.year);
  };

  const clearEntityFilter = () => {
    searchParams.delete('entity_id');
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-newsprint-100 text-ink">
      <DemoBanner />

      {/* Standardized Chronological Gazette Masthead */}
      <PageMasthead
        eyebrow="SOURCE-LINKED HISTORICAL CHRONOLOGY"
        headline="A life in history"
        subheadline="Explore key moments in B. R. Ambedkar’s life and public work. Each entry links to a reference used to prepare this prototype timeline."
        accession={`RECORDED MILESTONES: ${events.length}`}
        badge={`${events.length} TIMELINE EVENTS`}
        rightSlot={
          <div className="flex items-center gap-1 bg-newsprint-200 p-1 border-2 border-ink shadow-letterpress-sm font-mono">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase transition ${
                viewMode === 'timeline' ? 'bg-ink text-white shadow-sm' : 'text-ink hover:bg-newsprint-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> [ Timeline ]
            </button>
            <button
              onClick={() => setViewMode('accessible_table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase transition ${
                viewMode === 'accessible_table' ? 'bg-ink text-white shadow-sm' : 'text-ink hover:bg-newsprint-300'
              }`}
            >
              <List className="w-3.5 h-3.5" /> [ Ledger Table ]
            </button>
          </div>
        }
        bottomSlot={
          <div className="flex flex-wrap gap-2 pt-2 border-t border-ink/20 font-mono">
            <span className="text-[11px] uppercase font-bold text-ink-600 self-center mr-2">Dispatches:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-bold uppercase transition border ${
                  selectedCategory === cat
                    ? 'bg-ink text-white border-ink shadow-letterpress-sm'
                    : 'bg-[#FAF6EE] text-ink border-ink/40 hover:border-ink hover:bg-newsprint-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        }
      />

      {/* Entity Filter Banner */}
      {filteredEntityName && (
        <div className="bg-[#EFE8DA] border-b-2 border-ink px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-ink font-mono">
            <span>
              Showing timeline entries associated with <strong className="font-serif font-semibold underline">{filteredEntityName}</strong>
            </span>
            <button
              onClick={clearEntityFilter}
              className="text-oxblood hover:text-ink flex items-center gap-1 font-bold uppercase"
            >
              <X className="w-3.5 h-3.5" /> [ Dismiss Filter ]
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center text-xs font-mono text-stone-600 pb-3 mb-8 border-b-2 border-ink">
          <span>{filteredEvents.length} events · references listed on each entry</span>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-ink/65">Prototype chronology</span>
        </div>

        {loading ? (
          <div className="bg-[#FAF6EE] border-2 border-ink p-12 text-center shadow-letterpress-sm font-mono space-y-3">
            <p className="font-serif font-black text-base text-ink uppercase">Loading chronological records...</p>
          </div>
        ) : error ? (
          <div role="alert" className="border border-red-300 bg-red-50 p-6 text-center text-red-900">
            <h2 className="font-semibold text-lg">Timeline could not be loaded</h2>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="border-2 border-ink bg-[#FAF6EE] p-10 text-center shadow-letterpress-sm">
            <h2 className="font-serif text-xl font-semibold">No events in this category</h2>
            <p className="mx-auto mt-3 max-w-xl font-editorial text-sm">
              Choose another category to explore the full timeline.
            </p>
          </div>
        ) : viewMode === 'timeline' ? (
          /* Interactive Timeline Visualization */
          <div className="relative border-l-2 border-ink md:border-l-0 md:before:absolute md:before:top-0 md:before:bottom-0 md:before:left-1/2 md:before:w-0.5 md:before:bg-ink ml-4 md:ml-0 space-y-12">
            {filteredEvents.map((event, idx) => {
              const isEven = idx % 2 === 0;
              const isSelected = activeEvent?.id === event.id;

              return (
                <div 
                  key={event.id}
                  className={`page-item-enter relative flex flex-col md:flex-row items-start ${
                    isEven ? 'md:flex-row-reverse' : ''
                  } group`}
                >
                  {/* Center Circle Indicator */}
                  <div 
                    onClick={() => setActiveEvent(event)}
                    className={`absolute -left-[21px] md:left-1/2 md:-translate-x-1/2 top-4 w-10 h-10 border-2 cursor-pointer transition-all flex items-center justify-center font-mono font-bold text-xs shadow-letterpress-sm z-10 ${
                      isSelected
                        ? 'bg-oxblood border-ink text-white scale-110'
                        : 'bg-[#FAF6EE] border-ink text-ink hover:bg-stone-200'
                    }`}
                  >
                    {String(event.year).slice(-2)}
                  </div>

                  {/* Event Card Content */}
                  <div className="ml-6 md:ml-0 md:w-1/2 md:px-8">
                    <div 
                      onClick={() => setActiveEvent(event)}
                      className={`bg-[#FAF6EE] border-2 border-ink p-6 transition-all cursor-pointer space-y-3 shadow-letterpress-sm hover:shadow-letterpress ${
                        isSelected
                          ? 'border-oxblood ring-2 ring-oxblood/20 bg-[#FFFDF9]'
                          : 'hover:border-ink'
                      }`}
                    >
                      <div className="flex justify-between items-center border-b border-ink/15 pb-2">
                        <span className="font-serif font-black text-2xl text-oxblood">
                          {event.year}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-sans uppercase bg-[#EFE8DA] text-stone-700 px-2 py-0.5 border border-ink/30 font-medium">
                            {event.date_precision || 'YEAR'}
                          </span>
                          <span className="text-xs font-mono text-ink bg-white px-2 py-0.5 border border-ink">
                            {formatEventDate(event)}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-serif font-semibold text-lg sm:text-xl text-ink leading-snug">
                        {event.title}
                      </h3>

                      <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-editorial">
                        {event.description}
                      </p>

                      {/* Metadata Chips */}
                      <div className="pt-3 border-t border-ink/15 space-y-1.5 text-xs text-stone-700 font-mono">
                        {event.related_locations && (
                          <div className="flex items-center gap-1.5 text-stone-700">
                            <MapPin className="w-3.5 h-3.5 text-oxblood shrink-0" />
                            <span>LOCALE: {event.related_locations}</span>
                          </div>
                        )}
                        {event.related_people && (
                          <div className="flex items-center gap-1.5 text-stone-700">
                            <Users className="w-3.5 h-3.5 text-oxblood shrink-0" />
                            <span>PERSONS: {event.related_people}</span>
                          </div>
                        )}
                      </div>

                      {/* Connect to Knowledge Graph Button */}
                      <div className="pt-2 border-t border-ink/15 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider">
                          CATEGORY: {event.category || 'Historical Milestone'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/knowledge-graph');
                          }}
                          className="text-oxblood hover:text-ink text-xs font-mono font-bold flex items-center gap-1 uppercase"
                        >
                          <Network className="w-3.5 h-3.5" /> [ Inspect In Graph ]
                        </button>
                      </div>
                      {event.sources?.length ? (
                        <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-ink/10 pt-3">
                          {event.sources.map((source) => (
                            <a key={source.url} href={source.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 text-sm font-medium text-oxblood underline underline-offset-4">
                              {source.label}<ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Accessible Table Alternative View (WCAG 2.1 AA) */
          <div className="bg-[#FAF6EE] border-2 border-ink overflow-hidden shadow-letterpress">
            <table className="w-full text-left text-xs font-mono">
              <caption className="sr-only">Chronological Gazette of the Ambedkar Era Milestone Ledger</caption>
              <thead className="bg-ink text-white uppercase text-[10px] tracking-wider border-b-2 border-ink">
                <tr>
                  <th scope="col" className="p-3.5">Year / Precision</th>
                  <th scope="col" className="p-3.5">Milestone Gazette Headline</th>
                  <th scope="col" className="p-3.5">Classification</th>
                  <th scope="col" className="p-3.5">Locale</th>
                  <th scope="col" className="p-3.5">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/20">
                {filteredEvents.map(event => (
                  <tr key={event.id} className="hover:bg-newsprint-300 transition">
                    <td className="p-3.5 font-mono">
                      <span className="font-bold text-ink block text-sm">{formatEventDate(event)}</span>
                      <span className="text-[10px] text-ink-600 uppercase font-bold">{event.date_precision || 'YEAR'}</span>
                    </td>
                    <td className="p-3.5">
                      <p className="font-serif font-semibold text-ink text-sm">{event.title}</p>
                      <p className="text-ink-700 text-sm mt-0.5 font-editorial line-clamp-2">{event.description}</p>
                    </td>
                    <td className="p-3.5 text-oxblood font-mono text-[11px] uppercase font-bold">{event.category}</td>
                    <td className="p-3.5 text-ink-700">{event.related_locations || '—'}</td>
                    <td className="p-3.5">
                      {event.sources?.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-oxblood underline underline-offset-4">{source.label}<ExternalLink aria-hidden="true" className="h-3 w-3" /></a>)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};
