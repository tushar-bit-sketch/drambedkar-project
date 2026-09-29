import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, ArrowLeft, ZoomIn, ZoomOut, Contrast, 
  XSquare, BookOpen, Clock, Compass, Globe, Film,
  WifiOff, RefreshCw
} from 'lucide-react';
import { useKiosk } from '../../context/KioskContext';
import { useLanguage, LanguageCode } from '../../context/LanguageContext';

export const KioskBar: React.FC = () => {
  const { isKiosk, exitKiosk, toggleHighContrast, highContrast, isOffline, resetSession } = useKiosk();
  const { language, setLanguage, supportedLanguages } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isKiosk) return null;

  return (
    <>
      {/* Offline Status Warning Bar */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-oxblood text-white font-mono font-bold px-4 py-2 text-center text-xs flex items-center justify-center gap-2 border-b-2 border-ink shadow-md tracking-wider uppercase">
          <WifiOff className="w-4 h-4" />
          <span>[ OFFLINE CACHE MODE — SERVING LOCAL VERIFIED EXHIBITION PACKAGES ]</span>
        </div>
      )}
      <aside aria-label="Touchscreen Kiosk Navigation Bar" className="fixed bottom-0 left-0 right-0 z-50 bg-[#1A1714] text-[#FAF6EE] border-t-4 border-oxblood shadow-letterpress py-3 px-6 select-none">

      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Navigation Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-2 px-5 py-3 border-2 font-mono font-bold text-base transition-all ${
              location.pathname === '/' 
                ? 'bg-oxblood text-white border-oxblood shadow-letterpress-sm' 
                : 'bg-[#23201C] hover:bg-[#3D332A] text-white border-[#3D332A]'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="uppercase text-xs tracking-wider">[ Home ]</span>
          </button>

          {location.pathname !== '/' && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-5 py-3 bg-[#23201C] hover:bg-[#3D332A] text-white font-mono font-bold text-base transition-all border-2 border-[#3D332A]"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="uppercase text-xs tracking-wider">[ Back ]</span>
            </button>
          )}

          <button
            onClick={() => navigate('/explore')}
            className={`hidden sm:flex items-center gap-2 px-4 py-3 border-2 font-mono font-bold text-sm uppercase transition-all ${
              location.pathname === '/explore'
                ? 'bg-oxblood text-white border-oxblood shadow-letterpress-sm'
                : 'bg-[#23201C] hover:bg-[#3D332A] text-white border-[#3D332A]'
            }`}
          >
            <Compass className="w-4 h-4 text-oxblood-light" />
            <span>Catalogue</span>
          </button>

          <button
            onClick={() => navigate('/kiosk/timeline')}
            className={`hidden sm:flex items-center gap-2 px-4 py-3 border-2 font-mono font-bold text-sm uppercase transition-all ${
              location.pathname.startsWith('/kiosk/timeline') || location.pathname === '/timeline'
                ? 'bg-oxblood text-white border-oxblood shadow-letterpress-sm'
                : 'bg-[#23201C] hover:bg-[#3D332A] text-white border-[#3D332A]'
            }`}
          >
            <Clock className="w-4 h-4 text-oxblood-light" />
            <span>Timeline</span>
          </button>

          <button
            onClick={() => navigate('/kiosk/graph')}
            className={`hidden sm:flex items-center gap-2 px-4 py-3 border-2 font-mono font-bold text-sm uppercase transition-all ${
              location.pathname.startsWith('/kiosk/graph') || location.pathname === '/knowledge-graph'
                ? 'bg-oxblood text-white border-oxblood shadow-letterpress-sm'
                : 'bg-[#23201C] hover:bg-[#3D332A] text-white border-[#3D332A]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-oxblood-light" />
            <span>Ontology</span>
          </button>

          <button
            onClick={() => navigate('/kiosk/media')}
            className={`hidden sm:flex items-center gap-2 px-4 py-3 border-2 font-mono font-bold text-sm uppercase transition-all ${
              location.pathname.startsWith('/kiosk/media')
                ? 'bg-oxblood text-white border-oxblood shadow-letterpress-sm'
                : 'bg-[#23201C] hover:bg-[#3D332A] text-white border-[#3D332A]'
            }`}
          >
            <Film className="w-4 h-4 text-oxblood-light" />
            <span>Media</span>
          </button>
        </div>

        {/* Kiosk Mode Badge */}
        <div className="hidden md:flex flex-col items-center">
          <span className="text-xs uppercase tracking-widest text-[#FAF6EE] font-serif font-black">
            Exhibition Broadsheet Kiosk
          </span>
          <span className="text-[10px] text-[#FAF6EE]/60 font-mono tracking-wider">
            TOUCH-OPTIMIZED MUSEUM INTERACTION
          </span>
        </div>

        {/* Accessibility, Language & Exit */}
        <div className="flex items-center space-x-3">
          {/* Touchscreen Language Switcher */}
          <button
            onClick={() => {
              const codes: LanguageCode[] = ['en', 'hi', 'mr', 'ta'];
              const idx = codes.indexOf(language);
              const next = codes[(idx + 1) % codes.length];
              setLanguage(next);
            }}
            className="p-3 border-2 border-[#3D332A] bg-[#23201C] hover:bg-[#3D332A] text-white text-sm font-mono font-bold uppercase transition flex items-center gap-2"
            title="Cycle Interface Language (English / हिन्दी / मराठी / தமிழ்)"
          >
            <Globe className="w-4 h-4 text-oxblood-light" />
            <span className="uppercase text-xs font-mono">{language}</span>
          </button>

          <button
            onClick={toggleHighContrast}
            className={`p-3 border-2 text-sm font-mono font-bold uppercase transition flex items-center gap-2 ${
              highContrast
                ? 'bg-amber-400 text-black border-amber-300 font-black'
                : 'bg-[#23201C] hover:bg-[#3D332A] text-white border-[#3D332A]'
            }`}
            title="Toggle High Contrast Display"
          >
            <Contrast className="w-4 h-4" />
            <span className="hidden lg:inline text-xs">Contrast</span>
          </button>

          <button
            onClick={resetSession}
            className="flex items-center gap-2 px-4 py-3 bg-[#23201C] hover:bg-[#3D332A] text-white border-2 border-[#3D332A] font-mono font-bold text-xs uppercase transition"
            title="Reset Ephemeral Visitor Session"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={exitKiosk}
            className="flex items-center gap-2 px-4 py-3 bg-oxblood/80 hover:bg-oxblood text-white border-2 border-oxblood font-mono font-bold text-xs uppercase transition shadow-letterpress-sm"
            title="Exit Touchscreen Kiosk Mode"
          >
            <XSquare className="w-4 h-4" />
            <span>[ Exit ]</span>
          </button>
        </div>
      </div>
    </aside>
    </>
  );
};
