import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeftRight, Search, SortAsc, ChevronDown, RefreshCw,
  ArrowUpRight, ArrowDownLeft, ArrowRight, X, Hash, Calendar,
  DollarSign, User, Loader2, Filter,
} from 'lucide-react';
import { getAllTransactions } from '../services/admin.service';
import toast from 'react-hot-toast';

const TX_SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Amount ↑', value: 'amount_asc' },
  { label: 'Amount ↓', value: 'amount_desc' },
];

const TypeBadge = ({ type }) => {
  const map = {
    TRANSFER: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    DEPOSIT: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    WITHDRAWAL: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  };
  const Icon = type === 'DEPOSIT' ? ArrowDownLeft : type === 'WITHDRAWAL' ? ArrowUpRight : ArrowRight;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${map[type] || map.TRANSFER}`}>
      <Icon className="w-3 h-3" />
      {type}
    </span>
  );
};

const AdminTransactions = () => {
  const [allTx, setAllTx] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState('newest');
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterAmountMin, setFilterAmountMin] = useState('');
  const [filterAmountMax, setFilterAmountMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const loadTx = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      // Fetch large batch so client-side filtering is comprehensive
      const res = await getAllTransactions(1, 500);
      // Transactions don't have user join from the simple endpoint, so we work with what we have
      setAllTx(res.data.transactions || []);
    } catch (err) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadTx(); }, []);

  const clearFilters = () => {
    setSearch('');
    setFilterType('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterAmountMin('');
    setFilterAmountMax('');
  };

  const hasActiveFilters = search || filterType || filterDateFrom || filterDateTo || filterAmountMin || filterAmountMax;

  const applySort = (arr) => {
    const copy = [...arr];
    switch (sort) {
      case 'oldest': return copy.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case 'amount_asc': return copy.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
      case 'amount_desc': return copy.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
      default: return copy.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  };

  const filtered = useMemo(() => {
    let base = allTx;

    // Search: reference ID
    if (search) {
      const q = search.toLowerCase();
      base = base.filter(tx =>
        (tx.reference_id || '').toLowerCase().includes(q) ||
        (tx.description || '').toLowerCase().includes(q) ||
        (tx.id || '').toLowerCase().includes(q)
      );
    }

    // Type filter
    if (filterType) base = base.filter(tx => tx.transaction_type === filterType);

    // Date range
    if (filterDateFrom) base = base.filter(tx => new Date(tx.created_at) >= new Date(filterDateFrom));
    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999);
      base = base.filter(tx => new Date(tx.created_at) <= toDate);
    }

    // Amount range
    if (filterAmountMin) base = base.filter(tx => parseFloat(tx.amount) >= parseFloat(filterAmountMin));
    if (filterAmountMax) base = base.filter(tx => parseFloat(tx.amount) <= parseFloat(filterAmountMax));

    return applySort(base);
  }, [allTx, search, filterType, filterDateFrom, filterDateTo, filterAmountMin, filterAmountMax, sort]);

  const totalVolume = filtered.reduce((s, tx) => s + parseFloat(tx.amount || 0), 0);

  if (loading) return (
    <div className="animate-pulse space-y-6 max-w-7xl mx-auto pt-4">
      <div className="h-10 bg-surface-200 dark:bg-surface-800 rounded-2xl w-1/3"></div>
      <div className="h-64 bg-surface-200 dark:bg-surface-800 rounded-2xl"></div>
      <div className="h-96 bg-surface-200 dark:bg-surface-800 rounded-2xl"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-brand-500 font-semibold tracking-wider uppercase text-[11px] mb-1">Administration</p>
          <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-100">Transactions</h1>
        </div>
        <button onClick={() => loadTx(true)} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-300 hover:border-brand-500/30 hover:text-brand-600 transition-all self-start">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Tx (filtered)', value: filtered.length, fmt: v => v },
          { label: 'Transfers', value: filtered.filter(t => t.transaction_type === 'TRANSFER').length, fmt: v => v },
          { label: 'Deposits', value: filtered.filter(t => t.transaction_type === 'DEPOSIT').length, fmt: v => v },
          { label: 'Volume (filtered)', value: totalVolume, fmt: v => `₹${v.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
        ].map(({ label, value, fmt }) => (
          <div key={label} className="bg-white dark:bg-surface-900 rounded-2xl p-5 border border-surface-200 dark:border-surface-800 shadow-sm">
            <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">{fmt(value)}</p>
          </div>
        ))}
      </div>

      {/* Filters & Table */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-surface-100 dark:border-surface-800 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                placeholder="Search by reference ID, description…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-surface-900 dark:text-surface-100 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all placeholder:text-surface-400"
              />
            </div>

            {/* Filter Toggle */}
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all whitespace-nowrap ${showFilters || hasActiveFilters ? 'border-brand-500/30 bg-brand-500/10 text-brand-600 dark:text-brand-400' : 'border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50 text-surface-600 dark:text-surface-300 hover:border-surface-300'}`}>
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && <span className="bg-brand-500 text-surface-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">!</span>}
            </button>

            {/* Sort */}
            <div className="relative shrink-0">
              <button onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50 text-sm font-semibold text-surface-600 dark:text-surface-300 hover:border-surface-300 transition-all whitespace-nowrap">
                <SortAsc className="w-4 h-4" />
                {TX_SORT_OPTIONS.find(o => o.value === sort)?.label}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-2 z-30 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl shadow-xl overflow-hidden w-44">
                  {TX_SORT_OPTIONS.map(o => (
                    <button key={o.value} onClick={() => { setSort(o.value); setSortOpen(false); }}
                      className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${sort === o.value ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold' : 'text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800/50'}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-surface-50 dark:bg-surface-800/30 rounded-xl p-4 space-y-3 border border-surface-200/50 dark:border-surface-700/30">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {/* Type */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Type</label>
                  <select value={filterType} onChange={e => setFilterType(e.target.value)}
                    className="w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-900 dark:text-surface-100 outline-none focus:border-brand-500 transition-all">
                    <option value="">All Types</option>
                    <option value="TRANSFER">Transfer</option>
                    <option value="DEPOSIT">Deposit</option>
                    <option value="WITHDRAWAL">Withdrawal</option>
                  </select>
                </div>
                {/* Date From */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Date From</label>
                  <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)}
                    className="w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-900 dark:text-surface-100 outline-none focus:border-brand-500 transition-all" />
                </div>
                {/* Date To */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Date To</label>
                  <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)}
                    className="w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-900 dark:text-surface-100 outline-none focus:border-brand-500 transition-all" />
                </div>
                {/* Amount Min */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Min Amount (₹)</label>
                  <input type="number" min="0" placeholder="0" value={filterAmountMin} onChange={e => setFilterAmountMin(e.target.value)}
                    className="w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-900 dark:text-surface-100 outline-none focus:border-brand-500 transition-all" />
                </div>
                {/* Amount Max */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Max Amount (₹)</label>
                  <input type="number" min="0" placeholder="unlimited" value={filterAmountMax} onChange={e => setFilterAmountMax(e.target.value)}
                    className="w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-900 dark:text-surface-100 outline-none focus:border-brand-500 transition-all" />
                </div>
              </div>
              {hasActiveFilters && (
                <button onClick={clearFilters}
                  className="flex items-center gap-1.5 text-xs font-semibold text-surface-400 hover:text-red-500 transition-colors">
                  <X className="w-3.5 h-3.5" /> Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/20">
                {['Reference', 'Type', 'Amount', 'Sender Account', 'Receiver Account', 'Description', 'Date & Time', 'Status'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-surface-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-surface-400 text-sm">
                    {hasActiveFilters ? 'No transactions match your filters.' : 'No transactions found.'}
                  </td>
                </tr>
              ) : filtered.map(tx => (
                <tr key={tx.id}
                  className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedTx(tx)}>
                  <td className="px-5 py-4">
                    <span className="font-mono text-[11px] text-surface-600 dark:text-surface-300 bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded-lg">
                      {(tx.reference_id || tx.id || '').slice(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4"><TypeBadge type={tx.transaction_type} /></td>
                  <td className="px-4 py-4">
                    <span className={`text-sm font-bold ${tx.transaction_type === 'DEPOSIT' ? 'text-emerald-500' : tx.transaction_type === 'WITHDRAWAL' ? 'text-rose-500' : 'text-surface-900 dark:text-surface-100'}`}>
                      ₹{parseFloat(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-mono text-[11px] text-surface-500">{tx.sender_account_id ? tx.sender_account_id.slice(0, 8) + '…' : '—'}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-mono text-[11px] text-surface-500">{tx.receiver_account_id ? tx.receiver_account_id.slice(0, 8) + '…' : '—'}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs text-surface-500 dark:text-surface-400 max-w-[160px] truncate block">{tx.description || '—'}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <p className="text-xs text-surface-700 dark:text-surface-300 font-medium">{new Date(tx.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    <p className="text-[10px] text-surface-400">{new Date(tx.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${tx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between">
          <p className="text-xs text-surface-400">
            Showing <span className="font-semibold text-surface-600 dark:text-surface-300">{filtered.length}</span> transactions
            {hasActiveFilters && ' (filtered)'}
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-surface-400 hover:text-red-500 transition-colors flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setSelectedTx(null)}></div>
          <div className="relative bg-white dark:bg-surface-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in border border-surface-200/50 dark:border-surface-800/50">
            <div className="flex justify-between items-center p-5 border-b border-surface-100 dark:border-surface-800">
              <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">Transaction Detail</h3>
              <button onClick={() => setSelectedTx(null)} className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 bg-surface-100 dark:bg-surface-800 p-1.5 rounded-lg"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center pb-4 border-b border-surface-100 dark:border-surface-800">
                <TypeBadge type={selectedTx.transaction_type} />
                <p className="text-3xl font-bold text-surface-900 dark:text-surface-100 mt-3">₹{parseFloat(selectedTx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                <span className={`mt-2 inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${selectedTx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{selectedTx.status}</span>
              </div>
              <div className="space-y-3 text-xs">
                {[
                  ['Reference', (selectedTx.reference_id || selectedTx.id || '').toUpperCase()],
                  ['Type', selectedTx.transaction_type],
                  ['Description', selectedTx.description || '—'],
                  ['Sender ID', selectedTx.sender_account_id || '—'],
                  ['Receiver ID', selectedTx.receiver_account_id || '—'],
                  ['Date & Time', new Date(selectedTx.created_at).toLocaleString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between items-start gap-4">
                    <span className="text-surface-400 font-medium shrink-0">{l}</span>
                    <span className="font-semibold text-surface-900 dark:text-surface-200 text-right break-all">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;
