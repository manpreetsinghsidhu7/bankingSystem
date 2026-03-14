import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Search, SortAsc, RefreshCw, ChevronDown, CheckCircle2, XCircle, Eye, EyeOff, Bell } from 'lucide-react';
import { getAllAccounts, updateAccountStatus } from '../services/admin.service';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Name A → Z', value: 'name_asc' },
  { label: 'Name Z → A', value: 'name_desc' },
];

const applySort = (arr, sort) => {
  const copy = [...arr];
  switch (sort) {
    case 'oldest': return copy.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    case 'name_asc': return copy.sort((a, b) => ((a.users?.first_name || '') + (a.users?.last_name || '')).localeCompare((b.users?.first_name || '') + (b.users?.last_name || '')));
    case 'name_desc': return copy.sort((a, b) => ((b.users?.first_name || '') + (b.users?.last_name || '')).localeCompare((a.users?.first_name || '') + (a.users?.last_name || '')));
    default: return copy.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
};

const AdminRequests = () => {
  const [allAccounts, setAllAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [sortOpen, setSortOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const loadAccounts = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res = await getAllAccounts(1, 500);
      setAllAccounts(res.data.accounts || []);
    } catch { toast.error('Failed to load accounts'); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadAccounts(); }, []);

  const handleApprove = async (id) => {
    setProcessingId(id);
    try { await updateAccountStatus(id, 'ACTIVE'); toast.success('Account approved! ✓'); loadAccounts(true); }
    catch (err) { toast.error(err.message || 'Failed to approve'); }
    finally { setProcessingId(null); }
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    try { await updateAccountStatus(id, 'CLOSED'); toast.success('Request rejected.'); loadAccounts(true); }
    catch (err) { toast.error(err.message || 'Failed to reject'); }
    finally { setProcessingId(null); }
  };

  const requests = useMemo(() => {
    const base = allAccounts.filter(a => a.status === 'PENDING');
    const q = search.trim().toLowerCase();
    const searched = !q ? base : base.filter(a => {
      const name = [a.users?.first_name, a.users?.last_name].join(' ').toLowerCase();
      return name.includes(q) || (a.account_number || '').toLowerCase().includes(q) || (a.users?.email || '').toLowerCase().includes(q) || (a.users?.phone_number || '').toLowerCase().includes(q);
    });
    return applySort(searched, sort);
  }, [allAccounts, search, sort]);

  if (loading) return (
    <div className="animate-pulse space-y-5 max-w-full pt-4">
      <div className="h-9 bg-surface-200 dark:bg-surface-800 rounded-xl w-64" />
      <div className="h-20 bg-surface-200 dark:bg-surface-800 rounded-2xl" />
      <div className="h-96 bg-surface-200 dark:bg-surface-800 rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-full pb-12 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-brand-500 font-semibold tracking-widest uppercase text-[11px] mb-1">Administration</p>
          <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-100 flex items-center gap-3">
            Requests
            {requests.length > 0 && (
              <span className="inline-block bg-amber-500 text-white text-sm font-bold px-2.5 py-1 rounded-full">{requests.length}</span>
            )}
          </h1>
          <p className="text-sm text-surface-400 mt-1">Pending account opening applications — approve or reject</p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Empty state */}
      {requests.length === 0 && !search ? (
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm flex flex-col items-center justify-center py-20 px-8 text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-2">All caught up!</h2>
          <p className="text-surface-400 text-sm max-w-sm">There are no pending account requests right now. New applications will appear here.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-surface-100 dark:border-surface-800 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, account number, email, phone…"
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
                <div className="absolute right-0 top-full mt-2 z-30 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl shadow-xl overflow-hidden w-44">
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: '900px' }}>
              <thead>
                <tr className="bg-surface-50 dark:bg-surface-800/40 border-b border-surface-200 dark:border-surface-700">
                  {['Applicant', 'Account No.', 'Email', 'Phone', 'DOB / Age', 'Gender', 'Applied At', 'Balance', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-surface-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800/60">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-surface-400 text-sm">No requests match your search.</td>
                  </tr>
                ) : requests.map(account => {
                  const u = account.users || {};
                  const fullName = [u.first_name, u.last_name].filter(Boolean).join(' ') || '—';
                  const initials = [u.first_name?.[0], u.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?';
                  const age = account.dob ? Math.floor((Date.now() - new Date(account.dob)) / (365.25 * 24 * 3600_000)) : null;
                  const dobStr = account.dob ? new Date(account.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
                  const appliedStr = account.created_at ? new Date(account.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
                  const appliedTime = account.created_at ? new Date(account.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';
                  const isProcessing = processingId === account.id;

                  return (
                    <tr key={account.id} className="hover:bg-amber-500/[0.03] transition-colors">
                      {/* Applicant */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[11px] font-bold border border-amber-500/20 shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">{fullName}</p>
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending</span>
                          </div>
                        </div>
                      </td>
                      {/* Account No */}
                      <td className="px-4 py-4">
                        <span className="font-mono text-[12px] text-surface-600 dark:text-surface-300 bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded-lg">{account.account_number}</span>
                      </td>
                      {/* Email */}
                      <td className="px-4 py-4"><span className="text-xs text-surface-600 dark:text-surface-300">{u.email || '—'}</span></td>
                      {/* Phone */}
                      <td className="px-4 py-4"><span className="text-xs text-surface-600 dark:text-surface-300">{u.phone_number || '—'}</span></td>
                      {/* DOB */}
                      <td className="px-4 py-4">
                        <p className="text-xs text-surface-600 dark:text-surface-300">{dobStr}</p>
                        {age !== null && <p className="text-[10px] text-surface-400 mt-0.5">{age} yrs</p>}
                      </td>
                      {/* Gender */}
                      <td className="px-4 py-4"><span className="text-xs text-surface-500">{account.gender || '—'}</span></td>
                      {/* Applied At */}
                      <td className="px-4 py-4">
                        <p className="text-xs text-surface-600 dark:text-surface-300">{appliedStr}</p>
                        <p className="text-[10px] text-surface-400 mt-0.5">{appliedTime}</p>
                      </td>
                      {/* Balance (initial deposit) */}
                      <td className="px-4 py-4">
                        {showBalance
                          ? <span className="text-sm font-bold text-surface-900 dark:text-surface-100">₹{parseFloat(account.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          : <span className="text-sm text-surface-400 font-mono tracking-widest">••••••</span>
                        }
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleApprove(account.id)} disabled={isProcessing}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-bold bg-emerald-500 text-white hover:bg-emerald-400 shadow-sm shadow-emerald-500/20 transition-all disabled:opacity-50 whitespace-nowrap">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button onClick={() => handleReject(account.id)} disabled={isProcessing}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-bold bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-rose-500/10 hover:text-rose-500 border border-surface-200 dark:border-surface-700 transition-all disabled:opacity-50 whitespace-nowrap">
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-surface-100 dark:border-surface-800">
            <p className="text-xs text-surface-400">
              {requests.length} pending request{requests.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequests;
