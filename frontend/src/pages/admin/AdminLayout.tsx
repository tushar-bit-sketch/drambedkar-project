import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Film, Tags, Users, 
  History, Settings, Shield, ArrowLeft, LogOut, CheckCircle2, UserCheck,
  Layers, Upload, Cpu, Search, Languages, Volume2,
  Network, Clock, Monitor, ShieldCheck, Sparkles, Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { DemoBanner } from '../../components/archive/DemoBanner';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, login, logout, user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Demo Steering', path: '/admin/demo', icon: Sparkles },
    { label: 'System Diagnostics', path: '/admin/system-status', icon: Activity },
    { label: 'Documents Catalog', path: '/admin/documents', icon: FileText },
    { label: 'OCR Digitization', path: '/admin/ocr', icon: Cpu },
    { label: 'Search & Vector Index', path: '/admin/search-index', icon: Search },
    { label: 'Knowledge Graph', path: '/admin/knowledge-graph', icon: Network },
    { label: 'Timeline Curation', path: '/admin/timeline', icon: Clock },
    { label: 'Translations Review', path: '/admin/translations', icon: Languages },
    { label: 'Voice & Languages', path: '/admin/languages', icon: Volume2 },
    { label: 'Archival Collections', path: '/admin/collections', icon: Layers },
    { label: 'Batch Ingestion', path: '/admin/import', icon: Upload },
    { label: 'Media Management', path: '/admin/media', icon: Film },
    { label: 'Kiosk Fleet', path: '/admin/kiosks', icon: Monitor },
    { label: 'Security & Telemetry', path: '/admin/security', icon: ShieldCheck },
    { label: 'Metadata Standards', path: '/admin/metadata', icon: Tags },
    { label: 'User & RBAC', path: '/admin/users', icon: Users },
    { label: 'Audit Logs', path: '/admin/audit', icon: History },
  ];

  const handleRoleChange = (newRole: UserRole) => {
    login(newRole);
  };

  const isActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-[#F4EFE6] flex flex-col text-ink">
      <DemoBanner customMessage="ARCHIVAL ADMINISTRATION PORTAL — INSTITUTIONAL CURATORIAL CONSOLE" />

      {/* Admin Top Header */}
      <header className="bg-[#FAF6EE] text-ink border-b-2 border-double border-ink px-4 sm:px-6 py-3 flex items-center justify-between shadow-letterpress-sm">
        <div className="flex items-center space-x-3">
          <Link to="/" className="text-ink hover:text-oxblood flex items-center gap-1.5 text-xs font-mono font-bold uppercase transition">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">[ Return to Public Archive ]</span>
          </Link>
          <span className="text-ink/30">|</span>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-oxblood" />
            <span className="font-serif font-black text-sm sm:text-base tracking-tight text-ink">
              Archival Administration & Records Office
            </span>
          </div>
        </div>

        {/* Role Switcher for Phase 1 RBAC Testing */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="hidden md:flex items-center gap-2 bg-white px-3 py-1 border-2 border-ink shadow-letterpress-sm">
            <span className="text-ink/70 font-mono uppercase text-[11px] font-bold">Role:</span>
            <select
              value={role}
              onChange={(e) => handleRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-oxblood font-mono font-bold focus:outline-none cursor-pointer text-xs uppercase"
            >
              <option value="SUPER_ADMIN" className="bg-[#FAF6EE] text-ink font-mono">SUPER_ADMIN</option>
              <option value="ARCHIVIST" className="bg-[#FAF6EE] text-ink font-mono">ARCHIVIST</option>
              <option value="RESEARCHER" className="bg-[#FAF6EE] text-ink font-mono">RESEARCHER</option>
              <option value="REVIEWER" className="bg-[#FAF6EE] text-ink font-mono">REVIEWER</option>
              <option value="VISITOR" className="bg-[#FAF6EE] text-ink font-mono">VISITOR (Read Only)</option>
            </select>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="p-1.5 bg-white text-ink hover:bg-oxblood hover:text-white border-2 border-ink shadow-letterpress-sm transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Sidebar */}
        <aside aria-label="Admin Navigation" className="w-full md:w-64 bg-[#1A1714] text-[#FAF6EE] border-r-2 border-ink p-4 space-y-6 flex-shrink-0">
          <div className="p-3 bg-[#23201C] border border-[#3D332A] shadow-inner space-y-1">
            <div className="text-[10px] text-[#FAF6EE]/60 font-mono uppercase tracking-wider font-bold">Logged In Officer</div>
            <div className="font-bold text-sm text-[#FAF6EE] font-serif truncate">{user?.full_name || 'Archival Officer'}</div>
            <div className="text-[10px] text-oxblood-light font-mono font-bold bg-[#FAF6EE]/10 px-1.5 py-0.5 inline-block border border-[#3D332A] uppercase">
              {role}
            </div>
          </div>

          <nav className="space-y-1 font-mono text-xs">
            {navItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2.5 px-3 py-2 border transition ${
                    active
                      ? 'bg-oxblood text-white border-oxblood shadow-letterpress-sm font-bold'
                      : 'text-[#FAF6EE]/80 hover:bg-[#23201C] hover:text-white border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="uppercase tracking-wider text-[11px]">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-[#3D332A] text-[10px] font-mono text-[#FAF6EE]/60 space-y-1">
            <div className="text-white font-bold uppercase">[ NODE: CENTRAL ARCHIVE #01 ]</div>
            <div>POSTGRESQL SCHEMA V1.0 • OAIS ISO 14721</div>
            <div>OAUTH2 / JWT ACTIVE • ED25519 ATTESTATION</div>
          </div>
        </aside>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
