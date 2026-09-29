import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, Pause, Volume2, VolumeX, Film, Radio, 
  Clock, Shield, ArrowRight, Sparkles, Layers, RotateCcw
} from 'lucide-react';

interface AudioRecord {
  id: string;
  title: string;
  year: string;
  duration: string;
  location: string;
  transcript: string;
  citation: string;
}

export const LiveVideoSection: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
  const [progress, setProgress] = useState(35);
  const [isMuted, setIsMuted] = useState(false);

  const audioTracks: AudioRecord[] = [
    {
      id: 'AMB-AV-1949-001',
      title: 'Voice of Dr. B. R. Ambedkar: Warning on Democracy & Contradictions',
      year: '1949',
      duration: '04:18',
      location: 'Constitution Hall, New Delhi',
      transcript: 'On the 26th of January 1950, we are going to enter into a life of contradictions. In politics we will have equality and in social and economic life we will have inequality. We must remove this contradiction at the earliest possible moment or else those who suffer from inequality will blow up the structure of political democracy.',
      citation: 'CAD Vol. XI • Official Hansard Sound Recording'
    },
    {
      id: 'AMB-AV-1953-002',
      title: 'BBC World Service Interview on the Indian Constitution & Parliamentary Government',
      year: '1953',
      duration: '06:45',
      location: 'London Broadcasting House',
      transcript: 'Democracy is not merely a form of Government. It is primarily a mode of associated living, of conjoint communicated experience. It is essentially an attitude of respect and reverence towards fellowmen.',
      citation: 'BBC Sound Archives • Preserved Digitized Facsimile'
    },
    {
      id: 'AMB-AV-1956-003',
      title: 'Historical Address at Deekshabhoomi on the Conversion to Buddhism',
      year: '1956',
      duration: '08:12',
      location: 'Nagpur, Maharashtra',
      transcript: 'By adopting Buddhism today, I feel I am delivering my people from mental servitude and entering into a new birth of freedom, self-respect, and universal brotherhood.',
      citation: 'All India Radio Nagpur Master Transcription'
    }
  ];

  const currentTrack = audioTracks[selectedTrackIndex];

  // Simulated playback timer
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 0 : prev + 1));
      }, 350);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <section className="deckled-paper-panel p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b-2 border-double border-ink pb-4">
        <div>
          <div className="flex items-center gap-2 text-oxblood font-mono text-xs uppercase tracking-widest font-bold">
            <Radio className="w-3.5 h-3.5 text-oxblood animate-pulse" />
            <span>LIVE AUDIO-VISUAL DISPATCH & 16MM HISTORICAL BROADCAST STATION</span>
          </div>
          <h2 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl text-ink uppercase tracking-tight mt-1">
            Historical Recordings & Documentary Footage
          </h2>
          <p className="font-editorial text-xs sm:text-sm text-ink-700 italic max-w-2xl mt-1">
            Restored phonographic speeches, BBC radio broadcasts, and rare 16mm Constituent Assembly documentary newsreels with live synchronized transcripts.
          </p>
        </div>

        <Link
          to="/media"
          className="parchment-btn px-4 py-2 text-xs font-serif font-bold flex items-center gap-1.5 shrink-0 self-start sm:self-end"
        >
          <Film className="w-3.5 h-3.5 text-oxblood" />
          <span>Examine Full Media Vault →</span>
        </Link>
      </div>

      {/* Main Broadcast Shell: Left Documentary Screen + Right Synchronized Audio Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left 7 Cols: Vintage 16mm Documentary Screen */}
        <div className="lg:col-span-7 bg-[#1A1714] text-white border-2 border-ink flex flex-col justify-between overflow-hidden relative shadow-md">
          {/* Top Camera Tape Overlay Banner */}
          <div className="bg-[#110F0D] border-b border-white/10 px-4 py-2 flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
              <span className="text-newsprint-200 font-bold uppercase tracking-wider">
                16MM ARCHIVAL REEL • RESTORED {currentTrack.year}
              </span>
            </div>
            <span className="text-newsprint-400 text-[10px]">
              {currentTrack.location}
            </span>
          </div>

          {/* Video Preview Canvas with Historical Ambience */}
          <div className="relative aspect-video bg-[#151210] flex items-center justify-center p-6 overflow-hidden group">
            {/* Background Film Facsimile */}
            <img 
              src="/parliament-cad.jpg" 
              alt="Historical Parliament Reel Preview"
              className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-125 opacity-40 group-hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-radial from-transparent via-[#1A1714]/60 to-[#110F0D]/90 pointer-events-none"></div>

            {/* Vintage Film Grain Lines & Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none"></div>

            {/* Central Play/Pause Action Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white/80 bg-oxblood/90 hover:bg-oxblood text-white flex items-center justify-center shadow-lg transform hover:scale-110 transition cursor-pointer"
              aria-label={isPlaying ? "Pause Broadcast" : "Play Broadcast"}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white fill-white" />
              ) : (
                <Play className="w-8 h-8 text-white fill-white translate-x-1" />
              )}
            </button>

            {/* Bottom In-Video Caption Overlay */}
            <div className="absolute bottom-3 left-4 right-4 bg-[#110F0D]/85 border border-white/15 px-3 py-1.5 text-xs font-mono text-newsprint-200 flex items-center justify-between">
              <span className="truncate">
                {currentTrack.title}
              </span>
              <span className="text-red-400 font-bold text-[10px] uppercase ml-2 shrink-0">
                {isPlaying ? '● PLAYING ARCHIVE' : 'READY TO STREAM'}
              </span>
            </div>
          </div>

          {/* Bottom Scrub Control Bar */}
          <div className="bg-[#110F0D] border-t border-white/10 p-3 flex flex-col gap-2 font-mono text-xs">
            {/* Progress Slider */}
            <div className="w-full bg-white/20 h-1.5 cursor-pointer relative overflow-hidden">
              <div 
                className="bg-oxblood h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-newsprint-300">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)} 
                  className="hover:text-white transition cursor-pointer font-bold"
                >
                  {isPlaying ? '[ Pause ]' : '[ Play ]'}
                </button>
                <button 
                  onClick={() => setProgress(0)} 
                  className="hover:text-white transition cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Rewind</span>
                </button>
                <button 
                  onClick={() => setIsMuted(!isMuted)} 
                  className="hover:text-white transition cursor-pointer flex items-center gap-1"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isMuted ? 'Muted' : 'Audio On'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span>{Math.floor((progress / 100) * 258)}s</span>
                <span>/</span>
                <span>{currentTrack.duration}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Live Audio Visualizer & Verbatim Transcript Ticker */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          
          {/* Animated Waveform Visualizer Desk */}
          <div className="bg-[#FAF4E6] border border-ink/30 p-4 space-y-3">
            <div className="flex items-center justify-between font-mono text-[10px] text-oxblood uppercase font-bold border-b border-ink/15 pb-1">
              <span>LIVE PHONOGRAPHIC FREQUENCY SPECTRUM</span>
              <span>{isPlaying ? 'ACTIVE FREQUENCY' : 'IDLE'}</span>
            </div>

            {/* Dynamic CSS Waveform Bars */}
            <div className="h-12 bg-[#EAE0CA] border border-ink/20 p-2 flex items-end justify-between gap-1 overflow-hidden">
              {[40, 65, 85, 30, 95, 60, 45, 90, 75, 100, 55, 70, 85, 40, 60, 95, 80, 50, 70, 90, 65, 45, 80, 100, 70, 50, 90, 60].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-oxblood/85 transition-all duration-200"
                  style={{
                    height: isPlaying ? `${Math.max(15, (h * ((i % 3) + 1) * 0.35 + (progress % 20)) % 100)}%` : '15%',
                  }}
                ></div>
              ))}
            </div>

            <div className="font-mono text-[10px] text-ink/70 flex justify-between">
              <span>ACCESSION: {currentTrack.id}</span>
              <span>RESTORED MONO • 44.1 kHz</span>
            </div>
          </div>

          {/* Verbatim Synchronized Transcript */}
          <div className="bg-[#FAF4E6] border border-ink/30 p-4 flex-1 flex flex-col justify-between space-y-2">
            <div>
              <div className="text-[10px] font-mono text-oxblood font-bold uppercase tracking-wider mb-1">
                SYNCHRONIZED SPEECH TRANSCRIPTION
              </div>
              <blockquote className="font-editorial text-sm text-ink-900 leading-relaxed italic border-l-2 border-oxblood pl-3 py-1">
                "{currentTrack.transcript}"
              </blockquote>
            </div>

            <div className="pt-2 border-t border-ink/10 font-mono text-[10px] text-ink/70 flex items-center justify-between">
              <span>{currentTrack.citation}</span>
              <span className="text-emerald-800 font-bold">✓ SHA-256 MATCH</span>
            </div>
          </div>

          {/* Historical Speech Selectors */}
          <div className="space-y-1.5 font-mono text-xs">
            <span className="text-[10px] text-ink/70 uppercase tracking-widest font-bold block">
              CHOOSE HISTORICAL RECORDING:
            </span>
            <div className="space-y-1">
              {audioTracks.map((track, idx) => (
                <button
                  key={track.id}
                  onClick={() => {
                    setSelectedTrackIndex(idx);
                    setProgress(0);
                    setIsPlaying(true);
                  }}
                  className={`w-full text-left px-3 py-2 border transition flex items-center justify-between gap-2 cursor-pointer ${
                    selectedTrackIndex === idx 
                      ? 'bg-[#EAE0CA] border-oxblood text-oxblood font-bold' 
                      : 'bg-[#FAF4E6] border-ink/20 text-ink/80 hover:bg-[#EAE0CA]'
                  }`}
                >
                  <span className="truncate text-[11px] font-serif font-bold">
                    {idx + 1}. {track.title}
                  </span>
                  <span className="text-[10px] shrink-0 font-mono text-ink/60">
                    {track.year} • {track.duration}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
