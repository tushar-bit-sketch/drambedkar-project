import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Film, Volume2, Image as ImageIcon, Play, Search, 
  CheckCircle2, Clock, Calendar, Sparkles, Filter, ChevronRight
} from 'lucide-react';
import { mediaApi } from '../../services/mediaApi';
import { MediaAsset } from '../../types/media';

export const KioskMediaPage: React.FC = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    mediaApi.getKioskFeed(mediaTypeFilter === 'ALL' ? undefined : mediaTypeFilter)
      .then(res => {
        if (mounted) {
          setAssets(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [mediaTypeFilter]);

  const filteredAssets = searchQuery.trim() === ''
    ? assets
    : assets.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.historical_context?.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <Film className="w-8 h-8 text-amber-400" />;
      case 'AUDIO': return <Volume2 className="w-8 h-8 text-emerald-400" />;
      case 'PHOTOGRAPH': return <ImageIcon className="w-8 h-8 text-blue-400" />;
      default: return <Film className="w-8 h-8 text-stone-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EFE6] flex flex-col p-4 sm:p-8 select-none text-ink">
      {/* Kiosk Header Banner */}
      <div className="bg-[#FAF6EE] text-ink border-2 border-double border-ink p-6 sm:p-8 shadow-letterpress flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-white text-oxblood flex items-center justify-center border-2 border-ink shadow-letterpress-sm font-bold text-2xl shrink-0">
            <Film className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-oxblood uppercase font-bold tracking-widest">
                [ TOUCHSCREEN ARCHIVAL GALLERY • AUTHENTIC MASTERS ]
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-ink mt-0.5">
              Historical Audiovisual Vault
            </h1>
            <p className="text-xs sm:text-sm text-ink/80 font-editorial italic mt-0.5">
              Verified original recordings, speeches, ceremonies, and photographic glass plates.
            </p>
          </div>
        </div>

        {/* Media Type Filter Pills (Touch-Friendly Large Buttons) */}
        <div className="flex flex-wrap items-center gap-2 bg-[#EFE8DA] p-2 border-2 border-ink shadow-letterpress-sm w-full md:w-auto font-mono text-xs">
          {[
            { id: 'ALL', label: 'All Media' },
            { id: 'VIDEO', label: 'Film & Video' },
            { id: 'AUDIO', label: 'Audio Records' },
            { id: 'PHOTOGRAPH', label: 'Photographs' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setMediaTypeFilter(f.id)}
              className={`flex-1 md:flex-initial px-4 py-2.5 border font-bold uppercase transition-all text-center ${
                mediaTypeFilter === f.id
                  ? 'bg-oxblood text-white border-oxblood shadow-letterpress-sm'
                  : 'bg-white text-ink border-ink/40 hover:border-ink'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Touch Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-3xl">
          <Search className="w-5 h-5 text-ink/40 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Touch to search speeches, titles, historical context..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-white border-2 border-ink shadow-letterpress-sm text-xs sm:text-sm font-mono text-ink placeholder:text-ink/40 focus:outline-none focus:border-oxblood transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#EFE8DA] hover:bg-[#E2D7C3] border border-ink text-xs font-mono font-bold uppercase text-ink"
            >
              [ Clear ]
            </button>
          )}
        </div>
      </div>

      {/* Grid of Media Cards */}
      {loading ? (
        <div className="bg-[#FAF6EE] border-2 border-ink p-12 text-center shadow-letterpress font-mono space-y-3 max-w-md mx-auto my-12">
          <div className="archival-loading-bar mb-3" />
          <p className="text-xs uppercase font-bold text-ink tracking-widest">[ Loading Verified Archival Media... ]</p>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="bg-[#FAF6EE] border-2 border-ink p-12 text-center shadow-letterpress max-w-xl mx-auto my-12 space-y-3 font-mono">
          <Film className="w-12 h-12 text-oxblood mx-auto" />
          <h3 className="font-serif text-xl font-bold text-ink">No Archival Recordings Found</h3>
          <p className="text-xs text-ink/70 font-editorial">
            No media matches the selected criteria. Try selecting another filter or clearing the search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map(asset => (
            <div
              key={asset.id}
              onClick={() => navigate(`/kiosk/media/${asset.id}`)}
              className="bg-[#FAF6EE] border-2 border-ink overflow-hidden shadow-letterpress-sm hover:shadow-letterpress transition cursor-pointer flex flex-col group"
            >
              {/* Thumbnail / Poster Area */}
              <div className="relative aspect-video bg-[#1A1714] flex items-center justify-center overflow-hidden border-b-2 border-ink">
                <img
                  src={mediaApi.getPosterUrl(asset.id)}
                  alt={asset.title}
                  className="w-full h-full object-cover filter contrast-105 group-hover:scale-105 transition duration-300"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                
                {/* Play Indicator */}
                <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <div className="w-14 h-14 bg-white text-ink flex items-center justify-center border-2 border-ink shadow-letterpress-sm">
                    <Play className="w-7 h-7 fill-current ml-1" />
                  </div>
                </div>

                {/* Top Badges */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5 font-mono">
                  <span className="px-2 py-0.5 bg-ink text-white text-[10px] font-bold border border-ink uppercase">
                    {asset.media_type}
                  </span>
                  <span className="px-2 py-0.5 bg-oxblood text-white text-[10px] font-bold border border-ink uppercase">
                    {asset.format}
                  </span>
                </div>

                {/* Duration Badge */}
                {asset.duration && (
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-ink text-white font-mono text-[10px] flex items-center gap-1 border border-ink font-bold">
                    <Clock className="w-3 h-3 text-oxblood-light" />
                    <span>{formatDuration(asset.duration)}</span>
                  </div>
                )}
              </div>

              {/* Details Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-ink/70">
                    {asset.date && (
                      <span className="flex items-center gap-1 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-oxblood" />
                        {asset.date}
                      </span>
                    )}
                    <span className="px-1.5 py-0.2 bg-[#EFE8DA] text-ink border border-ink/30 font-bold uppercase">
                      {asset.archive_id}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-ink line-clamp-2 leading-snug group-hover:text-oxblood transition">
                    {asset.title}
                  </h3>

                  <p className="text-xs text-ink/80 font-editorial line-clamp-2 leading-relaxed">
                    {asset.description || 'Verified archival accession.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-ink/20 flex items-center justify-between font-mono text-xs">
                  <span className="text-[10px] text-ink/60 uppercase font-bold">
                    Format: {asset.format || 'Master'}
                  </span>
                  <div className="flex items-center gap-1 text-oxblood font-bold uppercase">
                    <span>[ Touch to Play ]</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
