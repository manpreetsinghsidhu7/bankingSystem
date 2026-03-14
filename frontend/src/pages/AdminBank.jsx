import React, { useState, useEffect } from 'react';
import {
  Building2, Users, CreditCard, TrendingUp, TrendingDown,
  Clock, CheckCircle2, ShieldOff, ArrowLeftRight, RefreshCw,
  Banknote, BarChart3, PieChart, Zap,
} from 'lucide-react';
import { getAllAccounts, getAllTransactions } from '../services/admin.service';
import toast from 'react-hot-toast';

const fmt = (v) => `₹${parseFloat(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const fmtFull = (v) => `₹${parseFloat(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const StatCard = ({ icon: Icon, label, value, sub, iconBg, iconColor, highlight }) => (
  <div className={`bg-white dark:bg-surface-900 rounded-2xl p-6 border shadow-sm flex flex-col gap-3 transition-all hover:shadow-md hover:-translate-y-0.5 ${highlight ? 'border-brand-500/30 ring-1 ring-brand-500/10' : 'border-surface-200 dark:border-surface-800'}`}>
    <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-surface-400 mb-1">{label}</p>
      <p className="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-100">{value}</p>
      {sub && <p className="text-xs text-surface-400 mt-1">{sub}</p>}
    </div>
  </div>
);

const AdminBank = () => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAll = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const [accRes, txRes] = await Promise.all([
        getAllAccounts(1, 500),
        getAllTransactions(1, 1000),
      ]);
      setAccounts(accRes.data.accounts || []);
      setTransactions(txRes.data.transactions || []);
      setLastUpdated(new Date());
    } catch {
      toast.error('Failed to load bank data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Derived stats
  const totalUsers = [...new Set(accounts.map(a => a.user_id))].length;
  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter(a => a.status === 'ACTIVE').length;
  const frozenAccounts = accounts.filter(a => a.status === 'FROZEN').length;
  const closedAccounts = accounts.filter(a => a.status === 'CLOSED').length;
  const pendingAccounts = accounts.filter(a => a.status === 'PENDING').length;

  const totalMoneyInBank = accounts
    .filter(a => a.status === 'ACTIVE' || a.status === 'FROZEN')
    .reduce((s, a) => s + parseFloat(a.balance || 0), 0);

  const totalDeposits = transactions
    .filter(t => t.transaction_type === 'DEPOSIT')
    .reduce((s, t) => s + parseFloat(t.amount || 0), 0);

  const totalWithdrawals = transactions
    .filter(t => t.transaction_type === 'WITHDRAWAL')
    .reduce((s, t) => s + parseFloat(t.amount || 0), 0);

  const totalTransfers = transactions
    .filter(t => t.transaction_type === 'TRANSFER')
    .reduce((s, t) => s + parseFloat(t.amount || 0), 0);

  const depositCount = transactions.filter(t => t.transaction_type === 'DEPOSIT').length;
  const withdrawalCount = transactions.filter(t => t.transaction_type === 'WITHDRAWAL').length;
  const transferCount = transactions.filter(t => t.transaction_type === 'TRANSFER').length;
  const totalTx = transactions.length;

  // Today's activity
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTx = transactions.filter(t => (t.created_at || '').startsWith(todayStr));
  const todayVolume = todayTx.reduce((s, t) => s + parseFloat(t.amount || 0), 0);

  // Recent 7 days
  const last7 = transactions.filter(t => {
    const d = new Date(t.created_at);
    const now = new Date();
    return (now - d) / (1000 * 3600 * 24) <= 7;
  });
  const last7Volume = last7.reduce((s, t) => s + parseFloat(t.amount || 0), 0);

  // Biggest account balance
  const sortedByBalance = [...accounts].filter(a => ['ACTIVE', 'FROZEN'].includes(a.status)).sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));
  const richestBalance = sortedByBalance[0]?.balance || 0;

  // Top 5 accounts by balance (for mini bar chart)
  const top5 = sortedByBalance.slice(0, 5);

  if (loading) return (
    <div className="animate-pulse space-y-6 max-w-full pt-4">
      <div className="h-9 bg-surface-200 dark:bg-surface-800 rounded-xl w-48" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array(8).fill(0).map((_, i) => <div key={i} className="h-32 bg-surface-200 dark:bg-surface-800 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-full pb-16 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-brand-500 font-semibold tracking-widest uppercase text-[11px] mb-1">Administration</p>
          <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-100">Bank Overview</h1>
          <p className="text-sm text-surface-400 mt-1">
            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'Loading…'}
          </p>
        </div>
        <button onClick={() => fetchAll(true)} disabled={refreshing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-300 hover:border-brand-500/30 hover:text-brand-600 dark:hover:text-brand-400 transition-all self-start">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ─── Section: Bank Financials ─── */}
      <h2 className="text-xs font-bold uppercase tracking-widest text-surface-400 mb-4">Financials</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Building2} label="Total Money in Bank" value={fmt(totalMoneyInBank)} sub={`Across ${activeAccounts} active + ${frozenAccounts} frozen accs`} iconBg="bg-brand-500/10" iconColor="text-brand-500" highlight />
        <StatCard icon={TrendingDown} label="Net Deposits" value={fmt(totalDeposits)} sub={`${depositCount} deposit transactions`} iconBg="bg-emerald-500/10" iconColor="text-emerald-500" />
        <StatCard icon={TrendingUp} label="Net Withdrawals" value={fmt(totalWithdrawals)} sub={`${withdrawalCount} withdrawal transactions`} iconBg="bg-rose-500/10" iconColor="text-rose-500" />
        <StatCard icon={ArrowLeftRight} label="Total Transfers" value={fmt(totalTransfers)} sub={`${transferCount} transfer transactions`} iconBg="bg-blue-500/10" iconColor="text-blue-500" />
      </div>

      {/* ─── Section: Users & Accounts ─── */}
      <h2 className="text-xs font-bold uppercase tracking-widest text-surface-400 mb-4">Users & Accounts</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={Users} label="Total Users" value={totalUsers} iconBg="bg-purple-500/10" iconColor="text-purple-500" />
        <StatCard icon={CreditCard} label="Total Accounts" value={totalAccounts} iconBg="bg-slate-500/10" iconColor="text-slate-500" />
        <StatCard icon={CheckCircle2} label="Active Accounts" value={activeAccounts} iconBg="bg-emerald-500/10" iconColor="text-emerald-500" />
        <StatCard icon={ShieldOff} label="Frozen Accounts" value={frozenAccounts} iconBg="bg-blue-500/10" iconColor="text-blue-500" />
        <StatCard icon={Clock} label="Pending Approval" value={pendingAccounts} sub={pendingAccounts > 0 ? 'Needs attention' : 'All clear'} iconBg="bg-amber-500/10" iconColor="text-amber-500" />
      </div>

      {/* ─── Section: Activity ─── */}
      <h2 className="text-xs font-bold uppercase tracking-widest text-surface-400 mb-4">Activity</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Zap} label="Today's Transactions" value={todayTx.length} sub={`Volume: ${fmt(todayVolume)}`} iconBg="bg-yellow-500/10" iconColor="text-yellow-500" />
        <StatCard icon={BarChart3} label="7-Day Volume" value={fmt(last7Volume)} sub={`${last7.length} transactions`} iconBg="bg-indigo-500/10" iconColor="text-indigo-500" />
        <StatCard icon={Banknote} label="Total Transactions" value={totalTx} iconBg="bg-teal-500/10" iconColor="text-teal-500" />
        <StatCard icon={PieChart} label="Avg Balance / Active Acc" value={activeAccounts > 0 ? fmt(totalMoneyInBank / activeAccounts) : '₹0'} sub="Active accounts only" iconBg="bg-pink-500/10" iconColor="text-pink-500" />
      </div>

      {/* ─── Section: Top Accounts by Balance ─── */}
      {top5.length > 0 && (
        <>
          <h2 className="text-xs font-bold uppercase tracking-widest text-surface-400 mb-4">Top Accounts by Balance</h2>
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden mb-8">
            <div className="p-6 space-y-4">
              {top5.map((acc, idx) => {
                const u = acc.users || {};
                const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || '—';
                const bal = parseFloat(acc.balance || 0);
                const pct = richestBalance > 0 ? (bal / richestBalance) * 100 : 0;
                const ringColors = [
                  { bg: 'bg-brand-500/10', border: 'border-brand-500/20', text: 'text-brand-500', bar: '#f59e0b' },
                  { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500', bar: '#3b82f6' },
                  { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500', bar: '#10b981' },
                  { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-500', bar: '#a855f7' },
                  { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-500', bar: '#f43f5e' },
                ];
                const rc = ringColors[idx] || ringColors[0];
                return (
                  <div key={acc.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-surface-400 w-5">#{idx + 1}</span>
                        <div className={`w-7 h-7 ${rc.bg} border ${rc.border} rounded-lg flex items-center justify-center text-[10px] font-bold ${rc.text}`}>
                          {name[0] || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">{name}</p>
                          <p className="text-[10px] text-surface-400 font-mono">{acc.account_number}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-surface-900 dark:text-surface-100">{fmtFull(bal)}</span>
                    </div>
                    <div className="ml-8 h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: rc.bar }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ─── Transaction Type Distribution ─── */}
      <h2 className="text-xs font-bold uppercase tracking-widest text-surface-400 mb-4">Transaction Breakdown</h2>
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm p-6">
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: 'Deposits', count: depositCount, volume: totalDeposits, stroke: '#10b981', pct: totalTx > 0 ? (depositCount / totalTx) * 100 : 0 },
            { label: 'Withdrawals', count: withdrawalCount, volume: totalWithdrawals, stroke: '#f43f5e', pct: totalTx > 0 ? (withdrawalCount / totalTx) * 100 : 0 },
            { label: 'Transfers', count: transferCount, volume: totalTransfers, stroke: '#3b82f6', pct: totalTx > 0 ? (transferCount / totalTx) * 100 : 0 },
          ].map(({ label, count, volume, stroke, pct }) => (
            <div key={label} className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-surface-400 mb-3">{label}</p>
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-surface-100 dark:text-surface-800" />
                  <circle cx="18" cy="18" r="15.5" fill="none"
                    strokeWidth="3"
                    strokeDasharray={`${pct} ${100 - pct}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    stroke={stroke}
                    style={{ transition: 'stroke-dasharray 1s ease' }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-surface-900 dark:text-surface-100">{pct.toFixed(0)}%</span>
                </div>
              </div>
              <p className="text-lg font-bold text-surface-900 dark:text-surface-100">{count}</p>
              <p className="text-xs text-surface-400">{fmt(volume)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminBank;
