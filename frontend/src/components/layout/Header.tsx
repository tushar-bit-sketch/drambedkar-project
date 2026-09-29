import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Landmark, Globe, Monitor, Sparkles, BookOpen,
  FileText, Scale, ChevronDown
} from 'lucide-react';
import { useKiosk } from '../../context/KioskContext';
import { useLanguage, LanguageCode } from '../../context/LanguageContext';

export const Header: React.FC = () => {
  const location = useLocation();
  const { isKiosk, enterKiosk } = useKiosk();
  const { language, setLanguage, supportedLanguages } = useLanguage();
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCollectionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setCollectionsOpen(false);
  }, [location.pathname]);

  const collectionLinks = [
    { name: 'Explore All Holdings', path: '/explore', icon: Landmark },
    { name: 'Writings & Treatises', path: '/documents', icon: BookOpen },
    { name: 'Rare Manuscripts', path: '/manuscripts', icon: FileText },
    { name: 'Historic Speeches', path: '/speeches', icon: Sparkles },
    { name: 'Constituent Assembly Debates', path: '/debates', icon: Scale },
  ];

  const isCollectionsActive = ['/explore', '/documents', '/manuscripts', '/speeches', '/debates'].some(
    p => location.pathname === p || (p !== '/' && location.pathname.startsWith(p))
  );

  // Broadsheet masthead is always visible at the top of every page
  const headerClass = 'bg-[#D8C4A3] border-b border-ink/40 sticky top-0 z-50 w-full';

  return (
    <header className={headerClass}>


      {/* Skip Navigation for Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-1 focus:left-2 focus:z-50 focus:px-3 focus:py-1 focus:bg-ink focus:text-white focus:font-mono focus:text-xs"
      >
        [ Skip to Main Content ]
      </a>

      {/* 1. Compact Top Utility Bar */}
      <div className="bg-[#CDB692] text-ink border-b border-ink/25 px-3 sm:px-6 py-1.5 text-xs font-sans">
        <div className="w-full max-w-[98vw] lg:max-w-[96vw] xl:max-w-[1540px] mx-auto flex flex-wrap justify-between items-center gap-2">
          {/* Left Attestation */}
          <div className="flex items-center gap-2 text-ink text-[10px] sm:text-[11px] truncate font-medium">
            <span className="flex items-center gap-1 font-semibold text-ink">
              <Landmark className="w-3.5 h-3.5 text-[#79402C]" />
              Digital Heritage Catalogue • Interactive Prototype
            </span>
            <span className="hidden md:inline text-ink/40">|</span>
            <span className="hidden md:inline text-ink/80">Source-linked public history</span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px]">
            {/* Language Dropdown */}
            <div className="flex items-center gap-1 bg-[#D8C4A3] border border-ink/40 px-1.5 py-0.5">
              <Globe className="w-3 h-3 text-ink/75" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="bg-transparent text-ink text-[10px] focus:outline-none cursor-pointer font-sans"
                aria-label="Interface Language"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label} ({lang.native})
                  </option>
                ))}
              </select>
            </div>

            {/* Static deployment status */}
            <Link 
              to="/system-status" 
              className="flex items-center gap-1.5 bg-[#D8C4A3] border border-ink/40 px-2 py-0.5 hover:bg-[#C5AD88] transition text-ink font-mono"
            >
              <span>Deployment Status</span>
            </Link>

            {/* Launch Kiosk Mode */}
            {!isKiosk && (
              <button
                onClick={enterKiosk}
                className="hidden sm:flex items-center gap-1 bg-[#D8C4A3] border border-ink/40 px-2 py-0.5 hover:bg-[#C5AD88] transition text-ink font-mono cursor-pointer"
                title="Touchscreen Museum Display Mode"
              >
                <Monitor className="w-3 h-3" />
                <span>Launch Kiosk Mode</span>
              </button>
            )}

          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="bg-[#D4BE9B] border-b border-ink/30">
        <div className="w-full max-w-[98vw] lg:max-w-[96vw] xl:max-w-[1540px] mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          {/* Left Branding & Wordmark */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            {/* Authentic Circular Vintage Stamp */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-ink flex items-center justify-center bg-[#C8AF8A] shadow-xs">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-ink/50 flex items-center justify-center">
                <span className="font-serif font-black text-base sm:text-lg text-ink leading-none">अ</span>
              </div>
            </div>
            <div>
              <h1 className="font-serif font-black text-lg sm:text-xl text-ink tracking-tight uppercase leading-none">
                Ambedkar Archive
              </h1>
              <p className="text-[8px] sm:text-[9px] font-mono text-ink/75 uppercase tracking-widest mt-0.5 leading-none font-semibold">
                Digital Heritage Knowledge Platform
              </p>
            </div>
          </Link>

          {/* Right Navigation Links */}
          <nav className="relative z-20 flex w-full flex-wrap items-center justify-start gap-1 py-1 text-xs font-serif font-bold sm:w-auto sm:justify-end sm:gap-2 lg:gap-3 sm:text-sm">
            {/* Home Active Button (matching the rich red printed pill button in picture) */}
            <Link
              to="/"
              className={`px-3.5 py-1 text-xs sm:text-sm transition-colors whitespace-nowrap ${
                location.pathname === '/'
                  ? 'archival-stamp'
                  : 'text-ink hover:text-[#79402C]'
              }`}
            >
              Home
            </Link>

            {/* Search */}
            <Link
              to="/search"
              className={`px-2 py-1 transition-colors whitespace-nowrap ${
                location.pathname === '/search' ? 'text-[#79402C] underline' : 'text-ink hover:text-[#79402C]'
              }`}
            >
              Search
            </Link>

            {/* Collections Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                aria-expanded={collectionsOpen}
                aria-controls="collections-menu"
                onClick={() => setCollectionsOpen(!collectionsOpen)}
                className={`flex items-center gap-0.5 px-2 py-1 transition-colors whitespace-nowrap cursor-pointer ${
                  isCollectionsActive ? 'text-[#79402C] font-bold' : 'text-ink hover:text-[#79402C]'
                }`}
              >
                <span>Collections</span>
                <ChevronDown className="w-3 h-3 text-ink/60" />
              </button>

              {collectionsOpen && (
                <div id="collections-menu" className="absolute left-0 top-full mt-1 w-56 border border-ink/40 bg-[#DCCBAE] py-1 shadow-lg z-50">
                  <div className="px-3 py-1 border-b border-ink/15 text-[9px] font-mono uppercase tracking-widest text-oxblood font-bold">
                    Holding Registries
                  </div>
                  {collectionLinks.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setCollectionsOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-ink hover:bg-[#EAE0CA] transition"
                    >
                      <item.icon className="w-3.5 h-3.5 text-oxblood" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Audio/Video */}
            <Link
              to="/media"
              className={`px-2 py-1 transition-colors whitespace-nowrap ${
                location.pathname.startsWith('/media') ? 'text-[#79402C] underline' : 'text-ink hover:text-[#79402C]'
              }`}
            >
              Audio/Video
            </Link>

            {/* Timeline */}
            <Link
              to="/timeline"
              className={`px-2 py-1 transition-colors whitespace-nowrap ${
                location.pathname === '/timeline' ? 'text-[#79402C] underline' : 'text-ink hover:text-[#79402C]'
              }`}
            >
              Timeline
            </Link>

            {/* Knowledge Graph */}
            <Link
              to="/knowledge-graph"
              className={`px-2 py-1 transition-colors whitespace-nowrap ${
                location.pathname === '/knowledge-graph' ? 'text-[#79402C] underline' : 'text-ink hover:text-[#79402C]'
              }`}
            >
              Knowledge Graph
            </Link>

            {/* AI Assistant */}
            <Link
              to="/research"
              className={`px-2 py-1 transition-colors whitespace-nowrap ${
                location.pathname === '/research' ? 'text-[#79402C] underline' : 'text-ink hover:text-[#79402C]'
              }`}
            >
              AI Assistant
            </Link>

            {/* About */}
            <Link
              to="/about"
              className={`px-2 py-1 transition-colors whitespace-nowrap ${
                location.pathname === '/about' ? 'text-[#79402C] underline' : 'text-ink hover:text-[#79402C]'
              }`}
            >
              About
            </Link>
          </nav>
        </div>
      </div>

      {/* 3. Archival Status & Verification Strip */}
      <div className="bg-[#C5AD88] border-b border-ink/30 px-3 sm:px-6 py-1.5 text-[10px] sm:text-[11px] font-mono text-ink">
        <div className="w-full max-w-[98vw] lg:max-w-[96vw] xl:max-w-[1540px] mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left Text */}
          <div className="prototype-ticker flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-ink inline-block shrink-0"></span>
            <span className="sr-only">
              PROTOTYPE: Explore the current catalogue and discover capabilities planned for future implementation.
            </span>
            <div className="prototype-ticker__window min-w-0 flex-1 overflow-hidden" aria-hidden="true">
              <div className="prototype-ticker__track">
                {[0, 1].map((copy) => (
                  <span key={copy} className="prototype-ticker__copy">
                    <strong>PROTOTYPE:</strong>&nbsp; Explore the current catalogue and discover capabilities planned for future implementation.
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
