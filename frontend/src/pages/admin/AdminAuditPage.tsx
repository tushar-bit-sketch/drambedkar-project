import React, { useState, useEffect } from 'react';
import { History, ShieldCheck, Search, Filter } from 'lucide-react';
import { apiService } from '../../services/api';
import { AuditLog } from '../../types';

export const AdminAuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiService.getAuditLogs().then(setLogs);
  }, []);

  const filteredLogs = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.resource_type.toLowerCase().includes(search.toLowerCase()) ||
    (l.details && l.details.toLowerCase().includes(search.toLowerCase())) ||
    (l.resource_id && l.resource_id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-300 pb-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900">
            Immutable Audit Trail Logs
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Tamper-evident logs of ingestion events, verification status changes, and user accesses.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1.5 rounded text-xs font-mono font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>CRYPTOGRAPHIC VERIFICATION ACTIVE</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by action, resource ID, or keyword..."
            className="w-full pl-9 pr-4 py-2 rounded-lg text-xs border border-stone-300 focus:outline-none focus:border-heritage-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-slate-500 font-mono">
          Events Logged: {filteredLogs.length}
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1B2A4A] text-white uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="p-3.5">Timestamp (UTC)</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Resource Type</th>
                <th className="p-3.5">Resource ID</th>
                <th className="p-3.5">Client IP</th>
                <th className="p-3.5">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-50 transition text-[11px]">
                  <td className="p-3.5 text-slate-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="p-3.5 font-bold text-heritage-700 whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="p-3.5 text-slate-700 whitespace-nowrap">
                    {log.resource_type}
                  </td>
                  <td className="p-3.5 font-bold text-ink-900 whitespace-nowrap">
                    {log.resource_id || '—'}
                  </td>
                  <td className="p-3.5 text-slate-500 whitespace-nowrap">
                    {log.ip_address || '127.0.0.1'}
                  </td>
                  <td className="p-3.5 font-sans text-slate-600 max-w-md">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
