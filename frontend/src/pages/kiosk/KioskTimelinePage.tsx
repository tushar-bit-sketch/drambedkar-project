import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, Calendar, MapPin, Volume2, VolumeX, ArrowRight, 
  ChevronLeft, ChevronRight, Network, FileText, CheckCircle2
} from 'lucide-react';
import { apiService } from '../../services/api';
import { TimelineEvent } from '../../types';

export const KioskTimelinePage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    let mounted = true;
    apiService.getTimelineEvents().then(res => {
      if (mounted) {
        setEvents(res);
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });
    return () => { 
      mounted = false; 
      window.speechSynthesis?.cancel();
    };
  }, []);

  const categories = [
    'ALL',
    'Constitutional',
    'Social Movements',
    'Academic Treatises',
    'Labour Reforms',
    'Religious & Philosophical'
  ];

  const filteredEvents = selectedCategory === 'ALL'
    ? events
    : events.filter(e => e.category?.toLowerCase().includes(selectedCategory.toLowerCase()));

  const currentEvent = filteredEvents[currentIndex] || null;

  const handleNext = () => {
    if (currentIndex < filteredEvents.length - 1) {
      setCurrentIndex(currentIndex + 1);
      stopSpeech();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      stopSpeech();
    }
  };

  const stopSpeech = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  const handleSpeak = () => {
    if (!currentEvent) return;
    if (speaking) {
      stopSpeech();
      return;
    }
    if ('speechSynthesis' in window) {
      const text = `${currentEvent.title}. ${currentEvent.exact_date || currentEvent.year_start || ''}. ${currentEvent.description}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EFE6] flex flex-col p-4 sm:p-6 select-none text-ink">
      {/* Top Banner */}
      <div className="bg-[#FAF6EE] text-ink border-2 border-double border-ink p-5 sm:p-6 shadow-letterpress flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white text-oxblood flex items-center justify-center border-2 border-ink shadow-letterpress-sm font-bold text-2xl shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-oxblood uppercase tracking-widest font-bold">
              [ EXHIBITION REPOSITORY • CHRONOLOGICAL GAZETTE ]
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-ink mt-0.5">
              Interactive Archival Chronology
            </h1>
            <p className="text-xs text-ink/80 font-editorial italic mt-0.5">
              Verified historical milestones, constitutional milestones, and social movements.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => navigate('/kiosk/graph')}
            className="px-4 py-2.5 bg-white hover:bg-ink hover:text-white text-ink border-2 border-ink text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition shadow-letterpress-sm"
          >
            [ Switch to Knowledge Graph &rarr; ]
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-none font-mono">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setCurrentIndex(0);
              stopSpeech();
            }}
            className={`px-4 py-2 border-2 text-xs font-bold uppercase whitespace-nowrap transition shadow-letterpress-sm ${
              selectedCategory === cat
                ? 'bg-oxblood text-white border-oxblood'
                : 'bg-white text-ink border-ink/40 hover:border-ink'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Focus Card View */}
      {currentEvent ? (
        <div className="flex-1 flex flex-col justify-between bg-[#FAF6EE] border-2 border-ink shadow-letterpress p-6 sm:p-8">
          {/* Milestone Header */}
          <div>
            <div className="flex flex-wrap items-center justify-between border-b-2 border-ink pb-4 mb-6 gap-3">
              <div className="flex items-center flex-wrap gap-2.5">
                <span className="px-3 py-1 bg-ink text-[#FAF6EE] font-mono font-bold text-sm border border-ink shadow-letterpress-sm">
                  {currentEvent.exact_date || currentEvent.year_start || 'Date Unknown'}
                </span>
                <span className="px-2.5 py-1 bg-[#EFE8DA] text-ink text-xs font-mono font-bold uppercase border border-ink/30">
                  {currentEvent.category}
                </span>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-600 text-xs font-mono font-bold uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Archivally Verified
                </span>
              </div>

              <button
                onClick={handleSpeak}
                className={`p-2.5 sm:px-3.5 sm:py-2 border-2 border-ink flex items-center gap-2 text-xs font-mono font-bold uppercase transition shadow-letterpress-sm ${
                  speaking
                    ? 'bg-amber-100 text-amber-950 border-amber-600'
                    : 'bg-white hover:bg-ink hover:text-white text-ink'
                }`}
                title="Audio Readout"
              >
                {speaking ? <VolumeX className="w-4 h-4 text-oxblood" /> : <Volume2 className="w-4 h-4 text-oxblood" />}
                <span>{speaking ? '[ Stop Narration ]' : '[ Read Aloud ]'}</span>
              </button>
            </div>

            <h2 className="text-2xl sm:text-4xl font-serif font-black text-ink leading-tight">
              {currentEvent.title}
            </h2>

            {currentEvent.location && (
              <div className="flex items-center gap-1.5 text-xs text-ink/70 font-mono font-bold uppercase mt-2">
                <MapPin className="w-4 h-4 text-oxblood" />
                {currentEvent.location}
              </div>
            )}

            <p className="text-base sm:text-lg text-ink font-editorial leading-relaxed mt-6 max-w-4xl">
              {currentEvent.description}
            </p>

            {currentEvent.evidence_text && (
              <div className="mt-6 p-4 bg-white border-2 border-ink shadow-letterpress-sm text-xs text-ink/90 font-editorial leading-relaxed border-l-4 border-l-oxblood">
                <div className="font-mono font-bold text-[10px] text-oxblood uppercase tracking-wider mb-1">
                  [ PRIMARY ARCHIVAL EVIDENCE CITATION ]
                </div>
                "{currentEvent.evidence_text}"
              </div>
            )}
          </div>

          {/* Stepper Footer */}
          <div className="pt-6 border-t-2 border-ink flex items-center justify-between mt-6">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-6 py-3.5 bg-white hover:bg-[#EFE8DA] disabled:opacity-30 text-ink border-2 border-ink font-mono font-bold text-xs uppercase flex items-center gap-2 transition shadow-letterpress-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              [ Previous Milestone ]
            </button>

            <span className="font-mono text-xs text-ink font-bold uppercase">
              RECORD {currentIndex + 1} OF {filteredEvents.length}
            </span>

            <button
              onClick={handleNext}
              disabled={currentIndex >= filteredEvents.length - 1}
              className="px-6 py-3.5 bg-ink hover:bg-oxblood disabled:opacity-30 text-white border-2 border-ink font-mono font-bold text-xs uppercase flex items-center gap-2 transition shadow-letterpress-sm"
            >
              [ Next Milestone ]
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-[#FAF6EE] border-2 border-ink shadow-letterpress flex flex-col items-center justify-center p-8 text-ink/60 font-mono">
          <Clock className="w-16 h-16 stroke-1 mb-2 text-oxblood" />
          <p className="text-base">[ No milestones cataloged in this category ]</p>
        </div>
      )}
    </div>
  );
};

export default KioskTimelinePage;
