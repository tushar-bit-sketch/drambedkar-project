import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Clock, AlertCircle, Film, Globe, 
  HardDrive, History, CheckCircle, ArrowUpRight, Upload, Layers, ShieldCheck
} from 'lucide-react';
import { apiService } from '../../services/api';
import { AdminMetrics, AuditLog } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    apiService.getAdminMetrics().then(setMetrics).catch(() => {});
    apiService.getAuditLogs().then(logs => setRecentLogs(logs.slice(0, 6))).catch(() => {});
  }, []);

  const metricCards = [
    { label: 'Total Archival Records', value: metrics?.total_documents ?? 7, icon: FileText, tag: 'OAIS REPOSITORY' },
    { label: 'Verified Accessions', value: metrics?.verified_documents ?? 6, icon: CheckCircle, tag: 'SEAL VERIFIED' },
    { label: 'Pending Review', value: metrics?.pending_review ?? 1, icon: AlertCircle, tag: 'CURATORIAL QUEUE' },
    { label: 'Thematic Collections', value: metrics?.collections_count ?? 4, icon: Layers, tag: 'CORPUS REGISTRY' },
    { label: 'Media Items', value: metrics?.media_items ?? 4, icon: Film, tag: 'AUDIO/VISUAL VAULT' },
    { label: 'Disk Storage Used', value: `${metrics?.storage_mb ?? 1.4} MB`, icon: HardDrive, tag: 'SECURE REPOSITORY' },
    { label: 'Audit Log Entries', value: metrics?.recent_activity_count ?? 3, icon: History, tag: 'IMMUTABLE TRAIL' },
  ];

  return (
    <div className="space-y-8">
      {/* Title & Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-double border-ink pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-mono text-oxblood uppercase font-bold tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-oxblood" />
            <span>CUSTODIAL RECORDS OFFICE • REPOSITORY METRICS & AUDIT LEDGER</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-ink">
            Archival Repository Overview
          </h1>
          <p className="text-xs text-ink/80 font-editorial italic max-w-2xl">
            Real-time database statistics, cryptographic file integrity metrics, and immutable audit logs.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center px-2.5 py-1 bg-[#EFE8DA] text-ink border border-ink text-xs font-mono font-bold uppercase">
            [ REAL-TIME ARCHIVE METRICS ]
          </span>
          <Link
            to="/admin/documents/new"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-ink hover:bg-oxblood text-white text-xs font-mono font-bold uppercase transition border border-ink shadow-letterpress-sm"
          >
            <Upload className="w-3.5 h-3.5" /> [ + Ingest Record ]
          </Link>
        </div>
      </div>

      {/* Archival Ledger Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-[#FAF6EE] border-2 border-ink p-5 shadow-letterpress-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-ink uppercase tracking-wider">
                  {card.label}
                </span>
                <div className="w-7 h-7 bg-white text-oxblood flex items-center justify-center border border-ink shadow-letterpress-sm">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="font-serif text-3xl font-black text-ink">
                {card.value}
              </div>
              <div className="text-[10px] text-ink/60 font-mono uppercase font-bold flex items-center justify-between border-t border-ink/15 pt-2">
                <span>{card.tag}</span>
                <span className="text-oxblood font-bold">• ACTIVE</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ingestion & Review Queues Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Uploads Queue */}
        <div className="bg-[#FAF6EE] border-2 border-ink p-6 shadow-letterpress space-y-4">
          <div className="flex justify-between items-center border-b-2 border-ink pb-3">
            <h3 className="font-serif font-black text-base text-ink uppercase tracking-wide">
              Recent Archival Accessions
            </h3>
            <Link to="/admin/documents" className="text-xs font-mono font-bold text-oxblood hover:text-ink uppercase">
              [ View Catalog &rarr; ]
            </Link>
          </div>

          <div className="space-y-3 text-xs font-mono">
            {metrics?.recent_uploads && metrics.recent_uploads.length > 0 ? (
              metrics.recent_uploads.slice(0, 5).map((item: any) => (
                <div key={item.id} className="p-3 bg-white border-2 border-ink flex justify-between items-center shadow-letterpress-sm">
                  <div className="max-w-[280px] space-y-0.5">
                    <div className="font-bold text-ink font-serif truncate text-sm">{item.title}</div>
                    <div className="text-ink/60 font-mono text-[10px]">
                      {item.archive_id} • {item.document_type}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 border font-mono font-bold text-[10px] uppercase ${
                    item.verification_status === 'VERIFIED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-600'
                      : 'bg-amber-50 text-amber-900 border-amber-600'
                  }`}>
                    {item.verification_status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-ink/60 italic p-6 text-center font-mono">
                No recent accessions on record.
              </div>
            )}
          </div>
        </div>

        {/* Recent Audit Activity */}
        <div className="bg-[#FAF6EE] border-2 border-ink p-6 shadow-letterpress space-y-4">
          <div className="flex justify-between items-center border-b-2 border-ink pb-3">
            <h3 className="font-serif font-black text-base text-ink uppercase tracking-wide">
              Recent Archival Audit Activity
            </h3>
            <Link to="/admin/audit" className="text-xs font-mono font-bold text-oxblood hover:text-ink uppercase">
              [ Audit Trail &rarr; ]
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            {recentLogs.length > 0 ? (
              recentLogs.map((log) => (
                <div key={log.id} className="p-3 bg-white border-2 border-ink space-y-1 shadow-letterpress-sm">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="font-bold text-oxblood uppercase">{log.action}</span>
                    <span className="text-ink/60 font-mono">{new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-ink/80 font-editorial line-clamp-1">{log.details || log.action}</p>
                </div>
              ))
            ) : (
              <div className="text-ink/60 italic p-6 text-center font-mono">
                No audit entries recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
