import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Compass, BookOpen, Landmark, FileText, Users, Globe, BookMarked } from 'lucide-react';

interface HeroSectionProps {
  stats?: {
    documents?: number;
    collections?: number;
    timeline?: number;
    entities?: number;
    relations?: number;
  };
}

export const HeroSection: React.FC<HeroSectionProps> = ({ stats }) => {
  const [query, setQuery] = useState('');
  const [introIndex, setIntroIndex] = useState(0);
  const [introLength, setIntroLength] = useState(0);
  const navigate = useNavigate();
  const introLines = [
    'Welcome. Explore the life, ideas, and public record of Dr. B. R. Ambedkar.',
    'Search the catalogue, follow a historical timeline, and discover connections across the archive.',
    'A growing digital prototype, built to make heritage easier for everyone to explore.',
  ];
  const introLine = introLines[introIndex];

  useEffect(() => {
    const complete = introLength >= introLine.length;
    const timer = window.setTimeout(() => {
      if (complete) {
        setIntroIndex((index) => (index + 1) % introLines.length);
        setIntroLength(0);
      } else {
        setIntroLength((length) => length + 1);
      }
    }, complete ? 1900 : 34);
    return () => window.clearTimeout(timer);
  }, [introIndex, introLength, introLine, introLines.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const statsList = [
    {
      label: 'CATALOGUE RECORDS',
      value: stats?.documents ?? 0,
      icon: BookMarked,
      link: '/documents',
    },
    {
      label: 'COLLECTIONS',
      value: stats?.collections ?? 0,
      icon: Globe,
      link: '/explore',
    },
    {
      label: 'INDEXED ENTITIES',
      value: stats?.entities ?? 0,
      icon: FileText,
      link: '/knowledge-graph',
    },
    {
      label: 'RECORDED CONNECTIONS',
      value: stats?.relations ?? 0,
      icon: Users,
      link: '/knowledge-graph',
    },
  ];

  return (
    <div className="broadsheet-root w-full">

      {/* ═══════════════════════════════════════════════════════════════
          THE BROADSHEET SHEET
          One continuous aged-parchment surface.
          Artwork on left and right bleeds in behind real DOM text.
          ═══════════════════════════════════════════════════════════════ */}
      <div
        className="broadsheet-sheet relative w-full overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse at 25% 30%, rgba(195,157,103,0.62) 0%, transparent 55%),
            radial-gradient(ellipse at 75% 70%, rgba(157,119,73,0.48) 0%, transparent 50%),
            #B8915E
          `,
        }}
      >

        {/* ── Paper grain (pure SVG noise, no assets) ─────────────── */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
        />

        {/* ── Vignette — darkens edges, brightens center ────────── */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{
            background: 'radial-gradient(ellipse at 50% 45%, rgba(117,76,39,0.16) 0%, rgba(117,76,39,0.08) 65%, transparent 100%)',
          }}
        />

        {/* ══════════════════════════════════════════════════════════
            LEFT PANEL — Dr. Ambedkar portrait + newspaper collage
            Anchored to left edge, bleeds toward center
            ══════════════════════════════════════════════════════════ */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute left-0 top-0 bottom-0 z-[3] opacity-20 sm:opacity-100 transition-opacity"
          style={{ width: 'clamp(180px, 24vw, 360px)' }}
        >
          <img
            src="/hero-panel-left-alpha.png"
            alt=""
            className="w-full h-full object-cover object-right-top"
            style={{
              filter: 'sepia(0.35) contrast(1.05) brightness(0.88) grayscale(0.08)',
              mixBlendMode: 'multiply',
            }}
          />
        </div>

        {/* ══════════════════════════════════════════════════════════
            RIGHT PANEL — Parliament + CAD newspaper collage
            Anchored to right edge, bleeds toward center
            ══════════════════════════════════════════════════════════ */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute right-0 top-0 bottom-0 z-[3] opacity-20 sm:opacity-100 transition-opacity"
          style={{ width: 'clamp(180px, 24vw, 360px)' }}
        >
          <img
            src="/hero-panel-right-alpha.png"
            alt=""
            className="w-full h-full object-cover object-left-top"
            style={{
              filter: 'sepia(0.35) contrast(1.03) brightness(0.86) grayscale(0.08)',
              mixBlendMode: 'multiply',
            }}
          />
        </div>


        {/* ══════════════════════════════════════════════════════════
            EDITORIAL HERO — All real DOM, z-index above artwork
            ══════════════════════════════════════════════════════════ */}
        <div className="relative z-[10] w-full">

          {/* Center content column */}
          <div
            className="mx-auto flex flex-col items-center text-center"
            style={{
              maxWidth: 'min(1080px, 86vw)',
              padding: 'clamp(20px,2.8vw,40px) 8px clamp(14px,2vw,28px)',
            }}
          >

            {/* ── Eyebrow / Publication Banner ─────────────────── */}
            <div className="flex items-center gap-2 w-full mb-3 sm:mb-4">
              <div
                aria-hidden="true"
                className="flex-1 h-px"
                style={{ background: 'linear-gradient(to right, transparent, rgba(26,23,20,0.40))' }}
              />
              <Landmark className="w-2.5 h-2.5 text-[#7A3F2A] shrink-0" aria-hidden="true" />
              <span className="font-mono text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.17em] text-ink/60 whitespace-nowrap select-none">
                Digital heritage catalogue&nbsp;•&nbsp;Interactive prototype
              </span>
              <Landmark className="w-2.5 h-2.5 text-[#7A3F2A] shrink-0" aria-hidden="true" />
              <div
                aria-hidden="true"
                className="flex-1 h-px"
                style={{ background: 'linear-gradient(to left, transparent, rgba(26,23,20,0.40))' }}
              />
            </div>

            {/* ── Ornamental rule above headline ────────────────── */}
            <div aria-hidden="true" className="w-full space-y-[3px] mb-2">
              <div className="w-full h-px" style={{ background: 'rgba(26,23,20,0.50)' }} />
              <div className="w-full h-px" style={{ background: 'rgba(26,23,20,0.20)' }} />
            </div>

            {/* ★ HEADLINE — real DOM text matching publication 2-line layout ★ */}
            <h1
              className="text-ink uppercase w-full tracking-tight"
              style={{
                fontFamily: '"DM Sans", Inter, sans-serif',
                fontWeight: 650,
                fontSize: 'clamp(32px, 4.2vw, 60px)',
                lineHeight: 1.05,
                letterSpacing: '-0.035em',
                textShadow: '0 1px 0 rgba(255,255,255,0.4)',
                marginBottom: 'clamp(10px,1.4vw,16px)',
              }}
            >
              <span className="block whitespace-normal sm:whitespace-nowrap">The Ambedkar Digital</span>
              <span className="block whitespace-normal sm:whitespace-nowrap">Heritage Archive</span>
            </h1>


            {/* ── Ornamental rule below headline ────────────────── */}
            <div aria-hidden="true" className="w-full space-y-[3px] mb-3">
              <div className="w-full h-px" style={{ background: 'rgba(26,23,20,0.50)' }} />
              <div className="w-full h-px" style={{ background: 'rgba(26,23,20,0.20)' }} />
            </div>

            {/* ── Deck / Subtitle ───────────────────────────────── */}
            <p
              className="text-[#2A211A] leading-snug mb-4 sm:mb-5"
              style={{
                fontFamily: '"Source Sans 3", Arial, sans-serif',
                fontSize: 'clamp(15px, 1.35vw, 19px)',
              }}
            >
              Preserving writings, speeches, manuscripts and historical records.<br className="hidden sm:inline" />
              Making knowledge accessible to everyone.
            </p>

            {/* ── Fleuron ornament ──────────────────────────────── */}
            <div aria-hidden="true" className="font-mono text-[#79402C] text-sm mb-4 sm:mb-5 tracking-widest select-none">
              ─── ❧ ───
            </div>

            {/* ★ SEARCH DESK — real functional form ★ */}
            <form
              onSubmit={handleSearch}
              className="w-full mb-4 sm:mb-5"
              role="search"
              aria-label="Archive Search"
            >
              <div
                className="flex items-center w-full"
                style={{
                  background: '#EDE0C2',
                  border: '2px solid rgba(26,23,20,0.85)',
                  boxShadow: 'inset 0 1px 3px rgba(26,23,20,0.10), 2px 2px 0 rgba(26,23,20,0.08)',
                }}
              >
                <div className="pl-3 text-ink/45 shrink-0" aria-hidden="true">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search writings, speeches, debates, manuscripts..."
                  className="flex-1 bg-transparent py-2.5 px-2 text-ink placeholder:text-ink/40 focus:outline-none"
                  style={{
                    fontFamily: '"Source Sans 3", Arial, sans-serif',
                    fontSize: 'clamp(12px,1.05vw,14px)',
                  }}
                />
                <button
                  type="submit"
                  className="shrink-0 font-serif font-bold text-[#F5EDD8] hover:bg-[#79402C] transition cursor-pointer flex items-center gap-1.5"
                  style={{
                    background: '#1A1714',
                    padding: '0 clamp(14px,1.5vw,22px)',
                    alignSelf: 'stretch',
                    fontSize: 'clamp(11px,0.95vw,13px)',
                  }}
                >
                  Search&nbsp;→
                </button>
              </div>
            </form>

            {/* ★ ACTION BUTTONS — real Links ★ */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full">
              <Link
                to="/explore"
                className="flex items-center gap-2 font-serif font-bold text-[#FAF4E8] hover:opacity-90 active:scale-[0.98] transition"
                style={{
                  background: '#79402C',
                  border: '1.5px solid #4F2416',
                  boxShadow: '2px 2px 0 rgba(26,23,20,0.22)',
                  padding: 'clamp(7px,0.9vw,11px) clamp(18px,2.2vw,28px)',
                  fontSize: 'clamp(11px,1vw,14px)',
                }}
              >
                <Compass className="w-3.5 h-3.5" aria-hidden="true" />
                Explore the Archive
              </Link>

              <Link
                to="/research"
                className="flex items-center gap-2 font-serif font-bold text-[#1A1714] hover:opacity-90 active:scale-[0.98] transition"
                style={{
                  background: 'rgba(220,198,168,0.85)',
                  border: '1.5px solid rgba(90,64,28,0.55)',
                  boxShadow: '2px 2px 0 rgba(26,23,20,0.14)',
                  padding: 'clamp(7px,0.9vw,11px) clamp(18px,2.2vw,28px)',
                  fontSize: 'clamp(11px,1vw,14px)',
                }}
              >
                <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                Research the Collection
              </Link>
            </div>

            <p className="mt-5 min-h-12 max-w-2xl font-sans text-sm leading-relaxed tracking-wide text-ink/85 sm:text-base" aria-label={introLine} aria-live="off">
              {introLine.slice(0, introLength)}
              <span aria-hidden="true" className="typing-caret ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-[#79402C] sm:h-5" />
            </p>

          </div>{/* end center column */}

        </div>{/* end editorial content */}

        {/* ══════════════════════════════════════════════════════════
            STATISTICS STRIP — continuation of the front page
            ══════════════════════════════════════════════════════════ */}
        <div
          className="relative z-[10] w-full border-t border-ink/25"
          style={{ background: 'rgba(176,148,104,0.35)' }}
        >
          {/* Holdings label */}
          <div className="flex items-center justify-center py-1.5 border-b border-ink/15">
            <span className="font-mono text-[8.5px] sm:text-[9px] uppercase tracking-[0.18em] text-ink/55 select-none">
              ── Catalogue Snapshot • Browser-Based Prototype ──
            </span>
          </div>

          {/* Four stat columns */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-ink/18 mx-auto"
            style={{ maxWidth: '1500px' }}
          >
            {statsList.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link
                  key={stat.label}
                  to={stat.link}
                  className="flex items-center justify-center gap-2.5 sm:gap-3 py-3.5 sm:py-4 px-4 hover:bg-white/10 transition group"
                >
                  <Icon
                    className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 text-[#5A3818] group-hover:text-[#79402C] transition"
                    aria-hidden="true"
                  />
                  <div className="text-left">
                    <p
                      className="text-ink font-serif font-black leading-none"
                      style={{ fontSize: 'clamp(18px,2.4vw,30px)' }}
                    >
                      {stat.value}
                    </p>
                    <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.12em] text-ink/60 mt-0.5 leading-none">
                      {stat.label}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Deckled torn bottom edge ───────────────────────────── */}
        <div
          className="relative z-[10] w-full overflow-hidden leading-none select-none pointer-events-none"
          aria-hidden="true"
        >
          <img
            src="/torn-edge-bottom.png"
            alt=""
            className="w-full object-cover object-top"
            style={{ height: 'clamp(24px,2.2vw,42px)', filter: 'sepia(0.12) contrast(1.05)' }}
          />
        </div>

      </div>{/* end broadsheet-sheet */}
    </div>
  );
};
