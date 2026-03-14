import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard, Search, SortAsc, RefreshCw, ChevronDown,
  CheckCircle2, XCircle, Clock, ShieldOff, ShieldCheck, Eye, EyeOff, AlertCircle,
} from 'lucide-react';
import { getAllAccounts, updateAccountStatus } from '../services/admin.service';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Name A → Z', value: 'name_asc' },
  { label: 'Name Z → A', value: 'name_desc' },
  { label: 'Balance ↑', value: 'balance_asc' },
  { label: 'Balance ↓', value: 'balance_desc' },
];

const STATUS_STYLES = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  PENDING: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  FROZEN: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  CLOSED: 'bg-surface-400/10 text-surface-400 border-surface-400/20',
};

const statusBadge = (status) => (
  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_STYLES[status] || STATUS_STYLES.CLOSED}`}>
    {status}
  </span>
);

const applySort = (arr, sort) => {
  const copy = [...arr];
  switch (sort) {
    case 'oldest': return copy.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    case 'name_asc': return copy.sort((a, b) => ((a.users?.first_name || '') + (a.users?.last_name || '')).localeCompare((b.users?.first_name || '') + (b.users?.last_name || '')));
    case 'name_desc': return copy.sort((a, b) => ((b.users?.first_name || '') + (b.users?.last_name || '')).localeCompare((a.users?.first_name || '') + (a.users?.last_name || '')));
    case 'balance_asc': return copy.sort((a, b) => parseFloat(a.balance || 0) - parseFloat(b.balance || 0));
    case 'balance_desc': return copy.sort((a, b) => parseFloat(b.balance || 0) - parseFloat(a.balance || 0));
    default: return copy.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
};

const AccountTable = ({ accounts, onApprove, onFreeze, onUnfreeze, showBalance, emptyMsg }) => (
  <div className="overflow-x-auto">
    <table className="w-full" style={{ minWidth: '960px' }}>
      <thead>
        <tr className="bg-surface-50 dark:bg-surface-800/40 border-b border-surface-200 dark:border-surface-700">
          <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-surface-400 w-[220px]">Account Holder</th>
          <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-surface-400">Account No.</th>
          <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-surface-400">Email</th>
          <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-surface-400">Phone</th>
          <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-surface-400">DOB / Age</th>
          <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-surface-400">Gender</th>
          <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-surface-400">Created At</th>
          <th className="px-4 py-3.5 text-right text-[11px] font-bold uppercase tracking-widest text-surface-400">Balance</th>
          <th className="px-4 py-3.5 text-center text-[11px] font-bold uppercase tracking-widest text-surface-400">Status</th>
          <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-surface-400">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-surface-100 dark:divide-surface-800/60">
        {accounts.length === 0 ? (
          <tr>
            <td colSpan={10} className="py-16 text-center text-surface-400 text-sm">{emptyMsg}</td>
          </tr>
        ) : accounts.map((account) => {
          const u = account.users || {};
          const fullName = [u.first_name, u.last_name].filter(Boolean).join(' ') || '—';
          const initials = [u.first_name?.[0], u.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?';
          const age = account.dob
            ? Math.floor((Date.now() - new Date(account.dob)) / (365.25 * 24 * 3600_000))
            : null;
          const dofStr = account.dob
            ? new Date(account.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—';
          const createdStr = account.created_at
            ? new Date(account.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—';
          const createdTime = account.created_at
            ? new Date(account.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            : '';

          return (
            <tr key={account.id} className="hover:bg-surface-50/60 dark:hover:bg-surface-800/30 transition-colors group">
              {/* Name */}
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-[11px] font-bold border border-brand-500/20 shrink-0">
                    {initials}
                  </div>
                  <span className="text-sm font-semibold text-surface-900 dark:text-surface-100 leading-tight">{fullName}</span>
                </div>
              </td>
              {/* Account No */}
              <td className="px-4 py-4">
                <span className="font-mono text-[12px] text-surface-600 dark:text-surface-300 bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded-lg">{account.account_number}</span>
              </td>
              {/* Email */}
              <td className="px-4 py-4">
                <span className="text-xs text-surface-600 dark:text-surface-300">{u.email || '—'}</span>
              </td>
              {/* Phone */}
              <td className="px-4 py-4">
                <span className="text-xs text-surface-600 dark:text-surface-300">{u.phone_number || '—'}</span>
              </td>
              {/* DOB / Age */}
              <td className="px-4 py-4">
                <p className="text-xs text-surface-600 dark:text-surface-300">{dofStr}</p>
                {age !== null && <p className="text-[10px] text-surface-400 mt-0.5">{age} yrs</p>}
              </td>
              {/* Gender */}
              <td className="px-4 py-4">
                <span className="text-xs text-surface-500">{account.gender || '—'}</span>
              </td>
              {/* Created At */}
              <td className="px-4 py-4">
                <p className="text-xs text-surface-600 dark:text-surface-300">{createdStr}</p>
                <p className="text-[10px] text-surface-400 mt-0.5">{createdTime}</p>
              </td>
              {/* Balance */}
              <td className="px-4 py-4 text-right">
                {showBalance
                  ? <span className="text-sm font-bold text-surface-900 dark:text-surface-100">
                      ₹{parseFloat(account.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  : <span className="text-sm text-surface-400 font-mono tracking-widest">••••••</span>
                }
              </td>
              {/* Status */}
              <td className="px-4 py-4 text-center">{statusBadge(account.status)}</td>
              {/* Action */}
              <td className="px-4 py-4">
                <div className="flex items-center gap-1.5">
                  {account.status === 'ACTIVE' && (
                    <button onClick={() => onFreeze(account.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-all whitespace-nowrap">
                      <ShieldOff className="w-3.5 h-3.5" /> Freeze
                    </button>
                  )}
                  {account.status === 'FROZEN' && (
                    <button onClick={() => onUnfreeze(account.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all whitespace-nowrap">
                      <ShieldCheck className="w-3.5 h-3.5" /> Unfreeze
                    </button>
                  )}
                  {account.status === 'CLOSED' && (
                    <span className="text-[11px] text-surface-400">Closed</span>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const AdminAccounts = () => {
  const [allAccounts, setAllAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [sortOpen, setSortOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  const loadAccounts = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res = await getAllAccounts(1, 500);
      setAllAccounts(res.data.accounts || []);
    } catch { toast.error('Failed to load accounts'); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadAccounts(); }, []);

  const handleFreeze = async (id) => {
    try { await updateAccountStatus(id, 'FROZEN'); toast.success('Account frozen'); loadAccounts(true); }
    catch (err) { toast.error(err.message || 'Failed'); }
  };
  const handleUnfreeze = async (id) => {
    try { await updateAccountStatus(id, 'ACTIVE'); toast.success('Account unfrozen'); loadAccounts(true); }
    catch (err) { toast.error(err.message || 'Failed'); }
  };

  const activeAccounts = useMemo(() => {
    const base = allAccounts.filter(a => a.status !== 'PENDING');
    const q = search.trim().toLowerCase();
    const searched = !q ? base : base.filter(a => {
      const name = [a.users?.first_name, a.users?.last_name].join(' ').toLowerCase();
      return name.includes(q) || (a.account_number || '').toLowerCase().includes(q) || (a.users?.email || '').toLowerCase().includes(q) || (a.users?.phone_number || '').toLowerCase().includes(q);
    });
    return applySort(searched, sort);
  }, [allAccounts, search, sort]);

  const pendingCount = allAccounts.filter(a => a.status === 'PENDING').length;

  if (loading) return (
    <div className="animate-pulse space-y-5 max-w-full pt-4">
      <div className="h-9 bg-surface-200 dark:bg-surface-800 rounded-xl w-64" />
      <div className="h-20 bg-surface-200 dark:bg-surface-800 rounded-2xl" />
      <div className="h-96 bg-surface-200 dark:bg-surface-800 rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-full pb-12 animate-slide-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-brand-500 font-semibold tracking-widest uppercase text-[11px] mb-1">Administration</p>
          <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-100">Accounts</h1>
          <p className="text-sm text-surface-400 mt-1">All active, frozen and closed bank accounts</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {pendingCount > 0 && (
            <a href="/admin/requests"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all">
              <AlertCircle className="w-4 h-4" /> {pendingCount} Pending
            </a>
          )}
          <button onClick={() => setShowBalance(!showBalance)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-300 hover:border-brand-500/30 transition-all">
            {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showBalance ? 'Hide Balances' : 'Show Balances'}
          </button>
          <button onClick={() => loadAccounts(true)} disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-300 hover:border-brand-500/30 transition-all">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Accounts', value: allAccounts.length, icon: CreditCard, c: 'text-blue-500', b: 'bg-blue-500/10' },
          { label: 'Active', value: allAccounts.filter(a => a.status === 'ACTIVE').length, icon: CheckCircle2, c: 'text-emerald-500', b: 'bg-emerald-500/10' },
          { label: 'Frozen', value: allAccounts.filter(a => a.status === 'FROZEN').length, icon: ShieldOff, c: 'text-blue-500', b: 'bg-blue-500/10' },
          { label: 'Closed', value: allAccounts.filter(a => a.status === 'CLOSED').length, icon: XCircle, c: 'text-surface-400', b: 'bg-surface-400/10' },
        ].map(({ label, value, icon: Icon, c, b }) => (
          <div key={label} className="bg-white dark:bg-surface-900 rounded-2xl p-5 border border-surface-200 dark:border-surface-800 shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 ${b} rounded-xl flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${c}`} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-surface-100 dark:border-surface-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name, account no., email, phone…"
              className="w-full bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-surface-900 dark:text-surface-100 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all placeholder:text-surface-400" />
          </div>
          <div className="relative shrink-0">
            <button onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50 text-sm font-semibold text-surface-600 dark:text-surface-300 hover:border-surface-300 transition-all whitespace-nowrap">
              <SortAsc className="w-4 h-4" />
              {SORT_OPTIONS.find(o => o.value === sort)?.label}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-2 z-30 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl shadow-xl overflow-hidden w-48">
                {SORT_OPTIONS.map(o => (
                  <button key={o.value} onClick={() => { setSort(o.value); setSortOpen(false); }}
                    className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${sort === o.value ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold' : 'text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800/50'}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <AccountTable
          accounts={activeAccounts}
          onFreeze={handleFreeze}
          onUnfreeze={handleUnfreeze}
          showBalance={showBalance}
          emptyMsg={search ? 'No accounts match your search.' : 'No accounts found.'}
        />

        <div className="px-5 py-3 border-t border-surface-100 dark:border-surface-800">
          <p className="text-xs text-surface-400">
            Showing <span className="font-semibold text-surface-600 dark:text-surface-300">{activeAccounts.length}</span> account{activeAccounts.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAccounts;
