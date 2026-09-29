import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { KioskProvider, useKiosk } from './context/KioskContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { KioskBar } from './components/layout/KioskBar';

// Critical path pages loaded eagerly for instant First Contentful Paint
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';

// Archival BroadSheet Loading Fallback for Suspense
const ArchivalLoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-ink">
    <div className="font-mono text-xs uppercase tracking-widest text-[#79402C] mb-2 animate-pulse">
      ── Retrieving Archival Ledger ──
    </div>
    <div className="font-serif italic text-sm text-ink/70">
      Consulting primary historical registers...
    </div>
  </div>
);

// Route-based code splitting for secondary public pages
const ExplorePage = lazy(() => import('./pages/ExplorePage').then(m => ({ default: m.ExplorePage })));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage').then(m => ({ default: m.DocumentsPage })));
const DocumentDetailPage = lazy(() => import('./pages/DocumentDetailPage').then(m => ({ default: m.DocumentDetailPage })));

const ManuscriptsPage = lazy(() => import('./pages/ManuscriptsPage').then(m => ({ default: m.ManuscriptsPage })));

const SpeechesPage = lazy(() => import('./pages/SpeechesPage').then(m => ({ default: m.SpeechesPage })));
const DebatesPage = lazy(() => import('./pages/DebatesPage').then(m => ({ default: m.DebatesPage })));
const MediaPage = lazy(() => import('./pages/MediaPage').then(m => ({ default: m.MediaPage })));
const MediaDetailPage = lazy(() => import('./pages/MediaDetailPage').then(m => ({ default: m.MediaDetailPage })));
const TimelinePage = lazy(() => import('./pages/TimelinePage').then(m => ({ default: m.TimelinePage })));
const KnowledgeGraphPage = lazy(() => import('./pages/KnowledgeGraphPage').then(m => ({ default: m.KnowledgeGraphPage })));
const EntityDetailPage = lazy(() => import('./pages/EntityDetailPage').then(m => ({ default: m.EntityDetailPage })));
const ResearchPage = lazy(() => import('./pages/ResearchPage').then(m => ({ default: m.ResearchPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const SystemStatusPage = lazy(() => import('./pages/SystemStatusPage').then(m => ({ default: m.SystemStatusPage })));

// Kiosk Pages (Lazy loaded in dedicated museum bundle chunk)
const KioskGraphPage = lazy(() => import('./pages/kiosk/KioskGraphPage').then(m => ({ default: m.KioskGraphPage })));
const KioskTimelinePage = lazy(() => import('./pages/kiosk/KioskTimelinePage').then(m => ({ default: m.KioskTimelinePage })));
const KioskEntityPage = lazy(() => import('./pages/kiosk/KioskEntityPage').then(m => ({ default: m.KioskEntityPage })));
const KioskMediaPage = lazy(() => import('./pages/kiosk/KioskMediaPage').then(m => ({ default: m.KioskMediaPage })));

const ServerFeatureUnavailable: React.FC = () => (
  <section className="mx-auto my-16 max-w-2xl border-2 border-ink bg-[#FAF6EE] p-8 text-center text-ink shadow-letterpress">
    <h1 className="font-serif text-2xl font-black">Not available in this static deployment</h1>
    <p className="mt-3 font-editorial text-sm">
      This feature requires trusted server-side storage or authentication. The Vercel site is a read-only frontend and does not simulate those capabilities.
    </p>
  </section>
);

const AppContent: React.FC = () => {
  const location = useLocation();
  const { isKiosk } = useKiosk();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isKiosk ? 'kiosk-mode pb-20' : ''}`}>
      {!isAdmin && <Header />}
      
      <main key={location.pathname} id="main-content" className="page-enter flex-1">
        <Suspense fallback={<ArchivalLoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/documents/:documentId" element={<DocumentDetailPage />} />
            <Route path="/manuscripts" element={<ManuscriptsPage />} />

            <Route path="/speeches" element={<SpeechesPage />} />
            <Route path="/debates" element={<DebatesPage />} />
            <Route path="/media" element={<MediaPage />} />
            <Route path="/media/:mediaId" element={<MediaDetailPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/knowledge-graph" element={<KnowledgeGraphPage />} />
            <Route path="/entities/:entityId" element={<EntityDetailPage />} />
            <Route path="/research" element={<ResearchPage />} />
            <Route path="/about" element={<AboutPage />} />

            {/* Server-owned features are intentionally disabled in static hosting. */}
            <Route path="/admin/*" element={<ServerFeatureUnavailable />} />
            <Route path="/demo/*" element={<ServerFeatureUnavailable />} />
            <Route path="/system-status" element={<SystemStatusPage />} />

            {/* Kiosk Routes */}
            <Route path="/kiosk/graph" element={<KioskGraphPage />} />
            <Route path="/kiosk/timeline" element={<KioskTimelinePage />} />
            <Route path="/kiosk/entity/:entityId" element={<KioskEntityPage />} />
            <Route path="/kiosk/media" element={<KioskMediaPage />} />
            <Route path="/kiosk/media/:mediaId" element={<MediaDetailPage />} />

          </Routes>
        </Suspense>
      </main>

      {!isAdmin && !isKiosk && <Footer />}
      <KioskBar />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <KioskProvider>
        <LanguageProvider>
          <Router>
            <AppContent />
          </Router>
        </LanguageProvider>
      </KioskProvider>
    </AuthProvider>
  );
};

export default App;
