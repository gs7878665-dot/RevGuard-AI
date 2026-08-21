import React, { useState, useMemo } from 'react';
import { Search, Filter, Eye, ChevronLeft, ChevronRight, CheckCircle2, XCircle, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function CaseTable({ auditLogs, onSelectCase }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFailureCode, setSelectedFailureCode] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedOutcome, setSelectedOutcome] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Filtered dataset
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.payment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customer_id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCode = selectedFailureCode === 'all' || item.failure_code === selectedFailureCode;
      const matchesAction = selectedAction === 'all' || item.action_taken === selectedAction;
      const matchesOutcome = selectedOutcome === 'all' || item.outcome === selectedOutcome;

      return matchesSearch && matchesCode && matchesAction && matchesOutcome;
    });
  }, [auditLogs, searchTerm, selectedFailureCode, selectedAction, selectedOutcome]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage]);

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 mb-10">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Filter className="w-5 h-5 text-emerald-400" />
            Payment Recovery Audit Log
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Queryable audit trail per payment record showing root cause, risk verdict, policy action, and recovery status.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search payment ID or customer..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Failure Code</label>
          <select
            value={selectedFailureCode}
            onChange={(e) => { setSelectedFailureCode(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Failure Codes</option>
            <option value="insufficient_funds">insufficient_funds</option>
            <option value="card_expired">card_expired</option>
            <option value="bank_technical_error">bank_technical_error</option>
            <option value="mandate_expired">mandate_expired</option>
            <option value="mandate_not_approved">mandate_not_approved</option>
            <option value="card_blocked">card_blocked</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Action Taken</label>
          <select
            value={selectedAction}
            onChange={(e) => { setSelectedAction(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Actions</option>
            <option value="retry_scheduled">retry_scheduled</option>
            <option value="send_card_update_link">send_card_update_link</option>
            <option value="send_mandate_reauth_link">send_mandate_reauth_link</option>
            <option value="retry_immediate">retry_immediate</option>
            <option value="escalate_human_followup">escalate_human_followup</option>
            <option value="stop_and_flag">stop_and_flag</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Outcome</label>
          <select
            value={selectedOutcome}
            onChange={(e) => { setSelectedOutcome(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Outcomes</option>
            <option value="recovered">Recovered</option>
            <option value="failed">Failed</option>
            <option value="stopped">Stopped & Flagged</option>
            <option value="escalated_pending">Escalated Pending</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[10px]">
            <tr>
              <th className="px-4 py-3">Payment ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Root Cause</th>
              <th className="px-4 py-3">Risk Verdict</th>
              <th className="px-4 py-3">Action Taken</th>
              <th className="px-4 py-3">Outcome</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  No payment records match the selected filters.
                </td>
              </tr>
            ) : (
              paginatedLogs.map((item) => (
                <tr key={item.payment_id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-white">{item.payment_id}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{item.customer_id}</td>
                  <td className="px-4 py-3 font-semibold text-slate-200">₹{item.amount}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
                      {item.root_cause}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {item.risk_verdict === 'stop_and_flag' ? (
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-extrabold uppercase">
                        STOP & FLAG
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                        CONTINUE
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-emerald-400">{item.action_taken}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      item.outcome === 'recovered' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      item.outcome === 'stopped' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-rose-500/15 text-rose-300 border border-rose-500/20'
                    }`}>
                      {item.outcome}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onSelectCase(item)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      Audit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-xs text-slate-400">
        <div>
          Showing {filteredLogs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} cases
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-slate-300">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
