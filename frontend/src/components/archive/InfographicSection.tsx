import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Scale, BookOpen, Clock, Award, ShieldCheck, 
  ChevronRight, BarChart2, PieChart, Layers, ArrowUpRight
} from 'lucide-react';

export const InfographicSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'constitution' | 'social' | 'economics' | 'corpus'>('constitution');

  const tabs = [
    { id: 'constitution', label: 'Constitution of India', icon: Scale },
    { id: 'social', label: 'Social Democracy Milestones', icon: Award },
    { id: 'economics', label: 'Monetary Economics & RBI', icon: BarChart2 },
    { id: 'corpus', label: 'Archival Corpus Scale', icon: Layers },
  ];

  return (
    <section className="deckled-paper-panel p-6 sm:p-8 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b-2 border-double border-ink pb-4">
        <div>
          <div className="flex items-center gap-2 text-oxblood font-mono text-xs uppercase tracking-widest font-bold">
            <span className="w-2 h-2 rounded-full bg-oxblood"></span>
            <span>HISTORICAL INFOGRAPHIC & QUANTITATIVE IMPACT MATRIX</span>
          </div>
          <h2 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl text-ink uppercase tracking-tight mt-1">
            The Archival Knowledge Infographic
          </h2>
          <p className="font-editorial text-xs sm:text-sm text-ink-700 italic max-w-2xl mt-1">
            Visualizing the historic timelines, drafting statistics, economic treatises, and archival provenance of Dr. B. R. Ambedkar's lifelong work.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-1 bg-[#EAE0CA] p-1 border border-ink/30 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif font-bold transition ${
                  active 
                    ? 'bg-[#782222] text-white shadow-xs' 
                    : 'text-ink/80 hover:text-ink hover:bg-[#DFD3BA]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Constitutional Architecture Infographic */}
      {activeTab === 'constitution' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#FAF4E6] border border-ink/20 p-4 space-y-2">
            <span className="text-[10px] font-mono text-oxblood font-bold uppercase tracking-wider">
              DRAFTING DURATION
            </span>
            <p className="font-serif font-black text-3xl sm:text-4xl text-ink">
              2y 11m 17d
            </p>
            <p className="text-xs font-editorial text-ink-700 leading-snug">
              From 29 Aug 1947 (Drafting Committee appointment) to 26 Nov 1949 (Constitution adoption).
            </p>
            <div className="pt-2 border-t border-ink/10 font-mono text-[10px] text-ink-500">
              CAD VOL. I–XI PROCEEDINGS
            </div>
          </div>

          <div className="bg-[#FAF4E6] border border-ink/20 p-4 space-y-2">
            <span className="text-[10px] font-mono text-oxblood font-bold uppercase tracking-wider">
              COMMITTEE SITTINGS
            </span>
            <p className="font-serif font-black text-3xl sm:text-4xl text-ink">
              141 Days
            </p>
            <p className="text-xs font-editorial text-ink-700 leading-snug">
              Dr. Ambedkar presided over line-by-line scrutiny of every single draft clause and fundamental right.
            </p>
            <div className="pt-2 border-t border-ink/10 font-mono text-[10px] text-ink-500">
              MINUTES PRESERVED
            </div>
          </div>

          <div className="bg-[#FAF4E6] border border-ink/20 p-4 space-y-2">
            <span className="text-[10px] font-mono text-oxblood font-bold uppercase tracking-wider">
              AMENDMENTS DEBATED
            </span>
            <p className="font-serif font-black text-3xl sm:text-4xl text-ink">
              2,473
            </p>
            <p className="text-xs font-editorial text-ink-700 leading-snug">
              Out of 7,635 amendments tabled, 2,473 were actively argued and responded to on the floor of the House.
            </p>
            <div className="pt-2 border-t border-ink/10 font-mono text-[10px] text-ink-500">
              PARLIAMENT HANSARD
            </div>
          </div>

          <div className="bg-[#FAF4E6] border border-ink/20 p-4 space-y-2">
            <span className="text-[10px] font-mono text-oxblood font-bold uppercase tracking-wider">
              ARTICLES & SCHEDULES
            </span>
            <p className="font-serif font-black text-3xl sm:text-4xl text-ink">
              395 / 8
            </p>
            <p className="text-xs font-editorial text-ink-700 leading-snug">
              Original constitutional enactment establishing sovereign democratic republic with universal franchise.
            </p>
            <div className="pt-2 border-t border-ink/10 font-mono text-[10px] text-ink-500">
              SIGNED 24 JAN 1950
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Social Democracy Milestones Infographic */}
      {activeTab === 'social' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#FAF4E6] border border-ink/20 p-4 space-y-2">
            <div className="flex items-center justify-between font-mono text-[11px] text-oxblood font-bold">
              <span>MAHAD SATYAGRAHA</span>
              <span>20 MARCH 1927</span>
            </div>
            <h4 className="font-serif font-bold text-base text-ink">Chavdar Tale Water Liberation</h4>
            <p className="text-xs font-editorial text-ink-700 leading-relaxed">
              First civil rights campaign asserting human dignity and civic equality at the public water tank of Mahad, Maharashtra.
            </p>
            <div className="pt-2 font-mono text-[10px] text-ink-500">
              LOCATION: RAIGAD • MANUSCRIPT REF: BAWS VOL. 17
            </div>
          </div>

          <div className="bg-[#FAF4E6] border border-ink/20 p-4 space-y-2">
            <div className="flex items-center justify-between font-mono text-[11px] text-oxblood font-bold">
              <span>POONA PACT</span>
              <span>24 SEPT 1932</span>
            </div>
            <h4 className="font-serif font-bold text-base text-ink">Legislative Representation Agreement</h4>
            <p className="text-xs font-editorial text-ink-700 leading-relaxed">
              Negotiated reserved legislative seats (increased from 71 to 148 in provincial legislatures) securing democratic representation.
            </p>
            <div className="pt-2 font-mono text-[10px] text-ink-500">
              LOCATION: YERWADA • SIGNED BY AMBEDKAR & LEADERS
            </div>
          </div>

          <div className="bg-[#FAF4E6] border border-ink/20 p-4 space-y-2">
            <div className="flex items-center justify-between font-mono text-[11px] text-oxblood font-bold">
              <span>DEEKSHABHOOMI</span>
              <span>14 OCT 1956</span>
            </div>
            <h4 className="font-serif font-bold text-base text-ink">Conversion to Buddhism</h4>
            <p className="text-xs font-editorial text-ink-700 leading-relaxed">
              Historic spiritual and social emancipation in Nagpur with 500,000 followers embracing the 22 vows of Navayana Buddhism.
            </p>
            <div className="pt-2 font-mono text-[10px] text-ink-500">
              LOCATION: NAGPUR • TREATISE: THE BUDDHA & HIS DHAMMA
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Economics Infographic */}
      {activeTab === 'economics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#FAF4E6] border border-ink/20 p-4 space-y-2">
            <span className="text-[10px] font-mono text-oxblood font-bold uppercase tracking-wider">
              DOCTORAL TREATISE • 1923
            </span>
            <h4 className="font-serif font-bold text-base text-ink">The Problem of the Rupee</h4>
            <p className="text-xs font-editorial text-ink-700 leading-relaxed">
              Submitted to University of London; foundational economic treatise presenting currency stabilization and banking reform that guided the creation of the Reserve Bank of India (RBI).
            </p>
            <div className="pt-2 border-t border-ink/10 font-mono text-[10px] text-ink-500">
              HILTON YOUNG COMMISSION TESTIMONY (1925)
            </div>
          </div>

          <div className="bg-[#FAF4E6] border border-ink/20 p-4 space-y-2">
            <span className="text-[10px] font-mono text-oxblood font-bold uppercase tracking-wider">
              PUBLIC FINANCE • 1921
            </span>
            <h4 className="font-serif font-bold text-base text-ink">Evolution of Provincial Finance</h4>
            <p className="text-xs font-editorial text-ink-700 leading-relaxed">
              Pioneered fiscal federalism, inter-provincial tax sharing, and center-state budgetary allocation principles enshrined in Article 280 (Finance Commission).
            </p>
            <div className="pt-2 border-t border-ink/10 font-mono text-[10px] text-ink-500">
              COLUMBIA UNIVERSITY Ph.D. DISSERTATION
            </div>
          </div>

          <div className="bg-[#FAF4E6] border border-ink/20 p-4 space-y-2">
            <span className="text-[10px] font-mono text-oxblood font-bold uppercase tracking-wider">
              LABOUR & RESOURCES • 1942–46
            </span>
            <h4 className="font-serif font-bold text-base text-ink">Damodar Valley & Tripartite Labour</h4>
            <p className="text-xs font-editorial text-ink-700 leading-relaxed">
              As Member for Labour & Irrigation, established the 8-hour workday, Employees' State Insurance (ESI), Central Waterways commission, and multi-purpose river valley projects.
            </p>
            <div className="pt-2 border-t border-ink/10 font-mono text-[10px] text-ink-500">
              VICEROY'S EXECUTIVE COUNCIL PORTFOLIO
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Corpus Scale Infographic */}
      {activeTab === 'corpus' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#FAF4E6] border border-ink/20 p-4 text-center space-y-1">
            <p className="font-serif font-black text-3xl sm:text-4xl text-oxblood">22 Vols</p>
            <p className="text-xs font-mono font-bold text-ink uppercase">BAWS Official Series</p>
            <p className="text-[10px] font-editorial text-ink-600">Ambedkar Foundation</p>
          </div>
          <div className="bg-[#FAF4E6] border border-ink/20 p-4 text-center space-y-1">
            <p className="font-serif font-black text-3xl sm:text-4xl text-ink">12 Vols</p>
            <p className="text-xs font-mono font-bold text-ink uppercase">CAD Debates</p>
            <p className="text-[10px] font-editorial text-ink-600">Parliament Hansard</p>
          </div>
          <div className="bg-[#FAF4E6] border border-ink/20 p-4 text-center space-y-1">
            <p className="font-serif font-black text-3xl sm:text-4xl text-oxblood">1,400+</p>
            <p className="text-xs font-mono font-bold text-ink uppercase">Indexed Speeches</p>
            <p className="text-[10px] font-editorial text-ink-600">1918–1956 Speeches</p>
          </div>
          <div className="bg-[#FAF4E6] border border-ink/20 p-4 text-center space-y-1">
            <p className="font-serif font-black text-3xl sm:text-4xl text-emerald-800">SHA-256</p>
            <p className="text-xs font-mono font-bold text-ink uppercase">Cryptographic Audit</p>
            <p className="text-[10px] font-editorial text-ink-600">Bit-rot Resilient</p>
          </div>
        </div>
      )}

      {/* Bottom Infographic Exploration Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-ink/15 text-xs font-mono">
        <span className="text-ink-600">
          Source: National Archives of India • Dr. Ambedkar Foundation • Parliament CAD Registry
        </span>
        <Link
          to="/timeline"
          className="text-oxblood font-bold uppercase tracking-wider hover:underline flex items-center gap-1"
        >
          <span>Examine Complete Historical Chronology</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
};
