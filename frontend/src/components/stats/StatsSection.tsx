import React from 'react';
import { BookOpen, Globe, FileText, ShieldCheck } from 'lucide-react';

interface StatsSectionProps {
  stats?: {
    documents?: number;
    collections?: number;
    timeline?: number;
    entities?: number;
  };
}

export const StatsSection: React.FC<StatsSectionProps> = ({ stats: customStats }) => {
  const statsList = [
    { 
      label: 'COLLECTIONS', 
      value: customStats?.collections ? `${customStats.collections}+` : '43+',
      icon: BookOpen,
      desc: 'BAWS, Treatises & Media'
    },
    { 
      label: 'LANGUAGES', 
      value: '5',
      icon: Globe,
      desc: 'English, Marathi, Hindi & Classical'
    },
    { 
      label: 'ARCHIVAL SOURCES', 
      value: customStats?.timeline ? `${customStats.timeline}` : '31',
      icon: FileText,
      desc: 'Constituent Assembly & Foundation'
    },
    { 
      label: 'VERIFIED CORPUS', 
      value: '100%',
      icon: ShieldCheck,
      desc: 'Cryptographic SHA-256 Bit-Rot Audited'
    },
  ];

  return (
    <section className="relative w-full max-w-[98vw] lg:max-w-[96vw] xl:max-w-[1540px] mx-auto border-x-2 border-b-0 border-ink/40 bg-[#D4BE9B] archival-paper pt-4 sm:pt-6">
      
      {/* Top Eyebrow Tag */}
      <div className="text-center mb-3">
        <span className="inline-block bg-[#C5AD88] border border-ink/30 px-3 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest text-ink">
          VERIFIED INSTITUTIONAL REPOSITORY HOLDINGS
        </span>
      </div>

      {/* 4-Column Statistics Strip with Thin Vertical Rules */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-x-0 md:divide-x divide-ink/25 px-4 sm:px-8 py-2">
        {statsList.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center justify-center gap-3.5 px-2 py-1 text-center md:text-left"
            >
              {/* Archival Icon */}
              <div className="w-10 h-10 shrink-0 border border-ink/40 bg-[#C8AF8A] flex items-center justify-center shadow-2xs">
                <Icon className="w-5 h-5 text-[#79402C]" />
              </div>

              {/* Number and Label */}
              <div>
                <p className="font-serif font-black text-2xl sm:text-3xl text-[#1A1714] leading-none">
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-[11px] font-mono font-bold text-ink/80 uppercase tracking-wider mt-1 leading-none">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Authentic Torn / Ragged Deckled Paper Edge Spanning Full Width */}
      <div className="w-full mt-4 sm:mt-6 overflow-hidden leading-none select-none pointer-events-none">
        <img 
          src="/torn-edge-bottom.png" 
          alt="Archival deckled torn paper edge"
          className="w-full h-8 sm:h-10 lg:h-12 object-cover object-top opacity-95 filter drop-shadow-sm" 
        />
      </div>

    </section>
  );
};
