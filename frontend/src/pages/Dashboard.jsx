import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, X, Plus, Eye, EyeOff, Key, CreditCard, ChevronRight, TrendingUp, TrendingDown, Lock, Trash2 } from 'lucide-react';
import { getMyAccounts, verifyPin, setPin, deleteAccount } from '../services/account.service';
import { getTransactionHistory, getTransactionDetail } from '../services/transaction.service';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { OtpPinModal } from '../components/UI/OtpPinModal';
import { PinSetupModal } from '../components/UI/PinSetupModal';
import { getCardColor } from '../utils/cardColors';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlyInflow, setMonthlyInflow] = useState(0);
  const [monthlyOutflow, setMonthlyOutflow] = useState(0);
  const [selectedTx, setSelectedTx] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({ type: '', startDate: '' });
  const [showBalance, setShowBalance] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pinSetupIsChange, setPinSetupIsChange] = useState(false);
  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetAcc, setDeleteTargetAcc] = useState(null);
  const [deletePin, setDeletePin] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const hasPin = !!account?.pin_hash;

  const fetchDashboardData = async () => {
    try {
      const accRes = await getMyAccounts();
      if (accRes.data.accounts.length > 0) {
        setAccounts(accRes.data.accounts);
        const currentAcc = account ? accRes.data.accounts.find(a => a.id === account.id) : accRes.data.accounts[0];
        setAccount(currentAcc);

        // Only fetch transactions if PIN is set
        if (currentAcc?.pin_hash) {
          const txRes = await getTransactionHistory(currentAcc.id, 1, 50, filters);
          setTransactions(txRes.data.transactions);
          const currentMonth = new Date().getMonth();
          let inflow = 0, outflow = 0;
          txRes.data.transactions.forEach(tx => {
            if (new Date(tx.created_at).getMonth() === currentMonth) {
              (tx.receiver_account_id === currentAcc.id || tx.type === 'DEPOSIT') ? inflow += parseFloat(tx.amount) : outflow += parseFloat(tx.amount);
            }
          });
          setMonthlyInflow(inflow); setMonthlyOutflow(outflow);
        } else {
          setTransactions([]); setMonthlyInflow(0); setMonthlyOutflow(0);
        }
      } else {
        setAccounts([]); setAccount(null); setTransactions([]);
      }
    } catch { toast.error('Failed to load data'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboardData(); }, [filters]);

  const handleSelectAccount = (acc) => { setAccount(acc); setShowBalance(false); setFilters({ type: '', startDate: '' }); };
  const handleTxClick = async (txId) => { try { const r = await getTransactionDetail(txId); setSelectedTx(r.data.transaction); setIsModalOpen(true); } catch { toast.error('Failed to load details'); } };
  const handlePinSubmit = async (pin) => { try { await verifyPin(account.id, pin); setShowPinModal(false); setShowBalance(true); toast.success('Balance unlocked'); setTimeout(() => setShowBalance(false), 30000); } catch { toast.error('Incorrect PIN'); } };

  const handleCreatePin = async (pin) => {
    await setPin(account.id, pin);
    toast.success('PIN created!');
    setShowPinSetup(false);
    // Refresh data
    setLoading(true);
    await fetchDashboardData();
  };

  const handleChangePin = async (pin) => {
    await setPin(account.id, pin);
    toast.success('PIN updated!');
    setShowPinSetup(false);
  };

  const openCreatePin = () => { setPinSetupIsChange(false); setShowPinSetup(true); };
  const openChangePin = () => { setPinSetupIsChange(true); setShowPinSetup(true); };

  const openDeleteModal = (acc, e) => { e.stopPropagation(); setDeleteTargetAcc(acc); setDeletePin(''); setDeletePassword(''); setShowDeleteModal(true); };
  const handleDeleteAccount = async () => {
    if (!deletePassword) return toast.error('Enter your VAYU password');
    setDeleteLoading(true);
    try {
      // Verify password first
      await api.post('/auth/login', { identifier: user?.email, password: deletePassword });
      // Delete account with PIN
      await deleteAccount(deleteTargetAcc.id, deletePin || '000000');
      toast.success('Account deleted');
      setShowDeleteModal(false);
      // Refresh
      setLoading(true);
      setAccount(null);
      await fetchDashboardData();
    } catch (err) { toast.error(err.message || 'Deletion failed'); } finally { setDeleteLoading(false); }
  };

  if (loading) return (
    <div className="animate-pulse space-y-8 max-w-5xl mx-auto pt-8">
      <div className="h-12 bg-surface-200 dark:bg-surface-800 rounded-2xl w-2/3"></div>
      <div className="h-64 bg-surface-200 dark:bg-surface-800 rounded-3xl"></div>
      <div className="h-96 bg-surface-200 dark:bg-surface-800 rounded-3xl"></div>
    </div>
  );

  if (!account && accounts.length === 0) {
    return (
      <div className="max-w-3xl mx-auto mt-16 mb-24 animate-slide-up">
        <div className="relative bg-surface-900 rounded-3xl p-12 lg:p-16 text-center text-white overflow-hidden border border-surface-800">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 50% 50%, rgba(251,191,36,0.3) 0%, transparent 70%)` }}></div>
          <div className="relative z-10 max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
              <img src="/images/VAYU.png" alt="VAYU" className="w-12 h-12 rounded-xl" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-4">Start Your Journey</h1>
            <p className="text-surface-400 mb-10 leading-relaxed text-sm">Open a VAYU account to unlock transfers, insights, and wealth management tools.</p>
            <button onClick={() => navigate('/create-account')} className="bg-brand-500 text-surface-900 hover:bg-brand-400 px-8 py-4 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-brand-500/25 active:scale-[0.98] flex items-center mx-auto">
              <Plus className="w-5 h-5 mr-2" /> Open Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const createdAt = new Date(account.created_at);
  const expiry = new Date(createdAt.getTime());
  expiry.setFullYear(expiry.getFullYear() + 5);
  const expiryStr = `${String(expiry.getMonth() + 1).padStart(2, '0')}/${String(expiry.getFullYear()).slice(-2)}`;

  return (
    <div className="space-y-8 pb-12 w-full max-w-6xl mx-auto font-sans animate-slide-up">
      
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
        <div>
          <p className="text-brand-500 font-semibold tracking-wider uppercase text-[11px] mb-1">Dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-100">Hello, {user?.first_name}</h1>
        </div>
      </section>

      {/* Account Tabs — last 4 digits only in list */}
      <section className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {accounts.map((acc, idx) => {
          const cc = getCardColor(idx);
          const isSelected = account.id === acc.id;
          return (
            <button key={acc.id} onClick={() => handleSelectAccount(acc)}
              className={`relative flex flex-col items-start px-5 py-3.5 rounded-2xl border transition-all duration-200 min-w-[180px] text-left group ${
                isSelected
                  ? `bg-gradient-to-br ${cc.from} ${cc.to} border-transparent shadow-lg scale-[1.02] text-white`
                  : 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 hover:border-surface-300 dark:hover:border-surface-700 text-surface-600 dark:text-surface-300'
              }`}>
              <div className={`absolute inset-0 rounded-2xl opacity-[0.03] ${isSelected ? '' : 'hidden'}`} style={{ backgroundImage: `radial-gradient(circle at 70% 30%, ${cc.accent} 0%, transparent 50%)` }}></div>
              <span className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${isSelected ? 'text-surface-300' : 'text-surface-400'}`}>
                {acc.status === 'PENDING' ? 'Pending Approval' : 'Active Account'}
              </span>
              <span className={`text-lg font-bold tracking-tight ${isSelected ? 'text-white' : ''}`}>
                ••{acc.account_number.slice(-4)}
              </span>
              {/* Delete icon */}
              <span onClick={(e) => openDeleteModal(acc, e)}
                className={`absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  isSelected ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-surface-400 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100'
                }`}>
                <Trash2 className="w-3.5 h-3.5" />
              </span>
            </button>
          );
        })}
        {accounts.length < 3 && (
          <button onClick={() => navigate('/create-account')} className="flex items-center justify-center px-5 py-5 rounded-2xl border-2 border-dashed border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all min-w-[100px] text-surface-400 hover:text-brand-500">
            <Plus className="w-6 h-6" />
          </button>
        )}
      </section>

      {/* Main Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Card + Balance/PIN */}
        <div className="lg:col-span-5 space-y-5">
          {/* Virtual Card — FULL account number, colored by index */}
          {(() => { const cc = getCardColor(accounts.findIndex(a => a.id === account.id)); return (
          <div className={`relative bg-gradient-to-br ${cc.from} ${cc.to} rounded-3xl p-7 text-white overflow-hidden shadow-2xl shadow-surface-900/30 border border-surface-800/50 aspect-[1.6/1]`}>
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(circle at 70% 30%, ${cc.accent} 0%, transparent 50%)` }}></div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/5"><img src="/images/VAYU.png" alt="" className="w-5 h-5 rounded" /></div>
                  <span className="font-bold tracking-wider text-sm text-surface-300">VAYU</span>
                </div>
                <div className={`w-10 h-7 bg-gradient-to-br ${cc.chip} rounded-md`}></div>
              </div>
              <p className="text-surface-300 font-mono text-sm tracking-[0.2em] mt-6">{account?.account_number}</p>
              <div className="flex justify-between items-end">
                <div><p className="text-[9px] text-surface-600 uppercase tracking-widest mb-0.5">Name</p><p className="text-xs font-semibold text-surface-300 tracking-wide">{user?.first_name} {user?.last_name}</p></div>
                <div className="text-right"><p className="text-[9px] text-surface-600 uppercase tracking-widest mb-0.5">Valid</p><p className="text-xs font-semibold text-surface-300 font-mono">{expiryStr}</p></div>
              </div>
            </div>
          </div>
          ); })()}

          {/* PIN Required State — no PIN yet */}
          {!hasPin && (
            <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-brand-500/20 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-brand-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 mb-1">Set Up Your PIN</h3>
                  <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed mb-4">Create a 6-digit payment PIN to unlock your balance, transactions, and transfers.</p>
                  <button onClick={openCreatePin} className="bg-brand-500 text-surface-900 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-brand-400 transition-all shadow-md shadow-brand-500/25 active:scale-[0.98]">
                    Create PIN
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Balance Card — only when PIN exists */}
          {hasPin && (
            <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-1.5">Available Balance</p>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-lg font-medium text-surface-400">₹</span>
                    <h2 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-100">
                      {showBalance ? parseFloat(account?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '••••••'}
                    </h2>
                  </div>
                </div>
                <button onClick={() => showBalance ? setShowBalance(false) : setShowPinModal(true)}
                  className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-500 flex items-center justify-center hover:bg-brand-500/10 hover:text-brand-500 transition-all">
                  {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="pt-4 mt-4 border-t border-surface-100 dark:border-surface-800">
                <button onClick={openChangePin} className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center transition-colors">
                  <Key className="w-3.5 h-3.5 mr-1.5" /> Change PIN
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Stats + Transactions — only when PIN exists */}
        {hasPin ? (
          <div className="lg:col-span-7 space-y-5">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 border border-surface-200 dark:border-surface-800 shadow-sm">
                <div className="w-9 h-9 bg-green-500/10 rounded-xl flex items-center justify-center mb-3"><TrendingUp className="w-4 h-4 text-green-500" /></div>
                <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-1">Monthly Inflow</p>
                <h3 className="text-xl font-bold tracking-tight text-surface-900 dark:text-surface-100">₹{monthlyInflow.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
              </div>
              <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 border border-surface-200 dark:border-surface-800 shadow-sm">
                <div className="w-9 h-9 bg-red-500/10 rounded-xl flex items-center justify-center mb-3"><TrendingDown className="w-4 h-4 text-red-500" /></div>
                <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-1">Monthly Outflow</p>
                <h3 className="text-xl font-bold tracking-tight text-surface-900 dark:text-surface-100">₹{monthlyOutflow.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden flex-1 flex flex-col">
              <div className="p-5 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between">
                <h3 className="text-sm font-bold tracking-tight text-surface-900 dark:text-surface-100">Activity</h3>
                <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="text-[11px] font-medium bg-surface-100 dark:bg-surface-800 border-0 rounded-lg px-3 py-1.5 text-surface-600 dark:text-surface-300 outline-none cursor-pointer">
                  <option value="">All</option><option value="TRANSFER">Transfers</option><option value="DEPOSIT">Deposits</option><option value="WITHDRAWAL">Withdraws</option>
                </select>
              </div>
              <div className="overflow-y-auto max-h-[400px]">
                {transactions.length === 0 ? (
                  <div className="px-6 py-16 text-center"><p className="text-surface-400 text-sm">No transactions yet.</p></div>
                ) : (
                  <div className="divide-y divide-surface-100 dark:divide-surface-800">
                    {transactions.map((tx) => {
                      const isPositive = tx.receiver_account_id === account?.id || tx.type === 'DEPOSIT';
                      return (
                        <div key={tx.id} onClick={() => handleTxClick(tx.id)} className="flex items-center justify-between px-5 py-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer group">
                          <div className="flex items-center space-x-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                              {isPositive ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">{tx.description || 'System Transfer'}</p>
                              <p className="text-[10px] text-surface-400 font-medium uppercase tracking-wider">{tx.type} • {tx.reference_id?.split('-')[0]}</p>
                            </div>
                          </div>
                          <div className="text-right flex items-center space-x-3">
                            <div>
                              <p className={`text-sm font-bold ${isPositive ? 'text-green-500' : 'text-surface-900 dark:text-surface-100'}`}>
                                {isPositive ? '+' : '-'}₹{parseFloat(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </p>
                              <p className="text-[10px] text-surface-400 mt-0.5">{new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-surface-300 dark:text-surface-600 group-hover:text-brand-500 transition-colors" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // No PIN — show locked message
          <div className="lg:col-span-7 flex items-center justify-center">
            <div className="text-center py-16 px-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                <Lock className="w-7 h-7 text-surface-400" />
              </div>
              <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100 mb-2">PIN Required</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400 max-w-xs mx-auto">Create your 6-digit payment PIN to view balances, transactions, and monthly analytics.</p>
            </div>
          </div>
        )}
      </section>

      {/* Transaction Detail Modal */}
      {isModalOpen && selectedTx && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-surface-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in border border-surface-200/50 dark:border-surface-800/50">
            <div className="flex justify-between items-center p-5 border-b border-surface-100 dark:border-surface-800">
              <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">Receipt</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 bg-surface-100 dark:bg-surface-800 p-1.5 rounded-lg"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="text-center pb-5 border-b border-surface-100 dark:border-surface-800">
                <span className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Amount</span>
                <p className="text-3xl font-bold text-surface-900 dark:text-surface-100 mt-1">₹{parseFloat(selectedTx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                <span className={`mt-2 inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${selectedTx.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>{selectedTx.status}</span>
              </div>
              <div className="space-y-3 text-xs">
                {[['Ref', selectedTx.reference_id?.split('-')[0].toUpperCase()], ['Type', selectedTx.type], ['Date', new Date(selectedTx.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })]].map(([l, v]) => (
                  <div key={l} className="flex justify-between items-center"><span className="text-surface-400 font-medium">{l}</span><span className="font-semibold text-surface-900 dark:text-surface-200">{v}</span></div>
                ))}
              </div>
              <div className="pt-4 border-t border-surface-100 dark:border-surface-800">
                <p className="text-[10px] text-surface-400 font-medium uppercase tracking-wider mb-1.5">Memo</p>
                <p className="text-sm text-surface-700 dark:text-surface-300 bg-surface-50 dark:bg-surface-800 p-3 rounded-xl">{selectedTx.description || 'Standard operation.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <OtpPinModal isOpen={showPinModal} onClose={() => setShowPinModal(false)} onSubmit={handlePinSubmit} title="Verify PIN" length={6} subtitle="Enter your 6-digit secure PIN to unlock balance." />
      <PinSetupModal isOpen={showPinSetup} onClose={() => setShowPinSetup(false)} onSubmit={pinSetupIsChange ? handleChangePin : handleCreatePin} title={pinSetupIsChange ? 'Change PIN' : 'Create PIN'} isChange={pinSetupIsChange} />

      {/* Delete Account Modal */}
      {showDeleteModal && deleteTargetAcc && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowDeleteModal(false)}></div>
          <div className="relative bg-surface-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in border border-surface-800/50 text-white">
            <div className="flex justify-between items-center p-5 border-b border-surface-800/50">
              <h3 className="text-sm font-bold text-red-400">Delete Account</h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-surface-400 hover:text-surface-200 bg-surface-800 p-1.5 rounded-lg"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-surface-300">Permanently delete account <strong className="text-red-400 font-mono">{deleteTargetAcc.account_number}</strong>?</p>
              <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 text-xs text-red-400 space-y-1">
                <p>• This action is <strong>irreversible</strong></p>
                <p>• Account with positive balance cannot be deleted</p>
                <p>• Transaction history will be lost</p>
              </div>
              {deleteTargetAcc.pin_hash && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">Account PIN</label>
                  <input type="password" value={deletePin} onChange={(e) => setDeletePin(e.target.value)} placeholder="6-digit PIN" maxLength={6}
                    className="block w-full bg-surface-800/50 border border-surface-700/50 rounded-xl px-4 py-3 text-sm text-white font-medium focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all outline-none" />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">VAYU Password</label>
                <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Your login password"
                  className="block w-full bg-surface-800/50 border border-surface-700/50 rounded-xl px-4 py-3 text-sm text-white font-medium focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all outline-none" />
              </div>
              <button onClick={handleDeleteAccount} disabled={deleteLoading || !deletePassword}
                className="w-full py-3.5 rounded-xl font-semibold text-sm bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-40 active:scale-[0.98]">
                {deleteLoading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
