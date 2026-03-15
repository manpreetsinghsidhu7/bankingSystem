import React, { useState, useEffect } from 'react';
import { Landmark, ArrowDownToLine, ArrowUpFromLine, CreditCard, Plus } from 'lucide-react';
import { getMyAccounts, deposit, withdraw, verifyPin } from '../services/account.service';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { OtpPinModal } from '../components/UI/OtpPinModal';
import { CARD_COLORS, getCardColor } from '../utils/cardColors';

const MAX_DEPOSIT = 50000;
const MAX_WITHDRAW = 10000;

const ATM = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [mode, setMode] = useState('deposit'); // deposit | withdraw
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [showPinModal, setShowPinModal] = useState(false);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);
  const selectedIdx = accounts.findIndex(a => a.id === selectedAccountId);
  const cardColor = CARD_COLORS[selectedIdx % 3] || CARD_COLORS[0];

  useEffect(() => {
    const fetch = async () => {
      try {
        const r = await getMyAccounts();
        const active = r.data.accounts.filter(a => a.pin_hash && (a.status === 'ACTIVE' || a.status === 'PENDING'));
        setAccounts(active);
        if (active.length > 0) setSelectedAccountId(active[0].id);
      } catch { toast.error('Failed to load accounts'); } finally { setInitializing(false); }
    };
    fetch();
  }, []);

  const maxAmount = mode === 'deposit' ? MAX_DEPOSIT : MAX_WITHDRAW;

  const quickAmounts = mode === 'deposit'
    ? [1000, 5000, 10000, 20000, 50000]
    : [500, 1000, 2000, 5000, 10000];

  const initiateTransaction = (e) => {
    e.preventDefault();
    if (selectedAccount?.status !== 'ACTIVE') {
      return toast.error('This account is pending approval. ATM services are temporarily unavailable.');
    }
    const val = parseFloat(amount);
    if (!val || val < 1) return toast.error('Please enter a valid amount of at least ₹1');
    if (val > maxAmount) return toast.error(`Maximum ${mode} limit is ₹${maxAmount.toLocaleString('en-IN')} per transaction`);
    setShowPinModal(true);
  };

  const executeTransaction = async (pin) => {
    setLoading(true); setShowPinModal(false);
    try {
      // Verify PIN first
      await verifyPin(selectedAccountId, pin);
      // Execute
      if (mode === 'deposit') {
        await deposit(selectedAccountId, parseFloat(amount), 'ATM Cash Deposit');
        toast.success(`₹${parseFloat(amount).toLocaleString('en-IN')} deposited successfully to your account`);
      } else {
        await withdraw(selectedAccountId, parseFloat(amount), 'ATM Cash Withdrawal');
        toast.success(`₹${parseFloat(amount).toLocaleString('en-IN')} withdrawn successfully from your account`);
      }
      setAmount('');
    } catch (err) { toast.error(err.message || 'Transaction could not be completed. Please try again.'); } finally { setLoading(false); }
  };

  if (initializing) return (
    <div className="animate-pulse space-y-8 max-w-4xl mx-auto pt-8">
      <div className="h-12 bg-surface-200 dark:bg-surface-800 rounded-2xl w-2/3"></div>
      <div className="h-96 bg-surface-200 dark:bg-surface-800 rounded-3xl"></div>
    </div>
  );

  if (accounts.length === 0) {
    return (
      <div className="max-w-3xl mx-auto mt-16 mb-24 animate-slide-up">
        <div className="relative bg-surface-900 rounded-3xl p-12 lg:p-16 text-center text-white overflow-hidden border border-surface-800">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 50% 50%, rgba(251,191,36,0.3) 0%, transparent 70%)` }}></div>
          <div className="relative z-10 max-w-md mx-auto">
            <Landmark className="w-12 h-12 text-brand-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold tracking-tight mb-4">ATM Services Unavailable</h1>
            <p className="text-surface-400 mb-10 text-sm">You need an active account with a PIN set up to use ATM services.</p>
            <button onClick={() => navigate('/dashboard')} className="bg-brand-500 text-surface-900 hover:bg-brand-400 px-8 py-4 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-brand-500/25 active:scale-[0.98] flex items-center mx-auto">
              <Plus className="w-5 h-5 mr-2" /> Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto font-sans w-full pb-12 animate-slide-up">
      <div className="mb-8">
        <p className="text-brand-500 font-semibold tracking-wider uppercase text-[11px] mb-1">Cash Services</p>
        <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-100">ATM</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Card + Form */}
        <div className="col-span-1 lg:col-span-3 space-y-6">

          {/* Card selector */}
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none">
            {accounts.map((acc, i) => {
              const cc = CARD_COLORS[i % 3];
              const isActive = acc.id === selectedAccountId;
              const isPending = acc.status === 'PENDING';
              return (
                <button key={acc.id} onClick={() => { setSelectedAccountId(acc.id); setAmount(''); }}
                  className={`relative bg-gradient-to-br ${cc.from} ${cc.to} rounded-2xl p-5 min-w-[220px] text-left text-white border transition-all ${
                    isActive 
                      ? 'border-brand-500 shadow-xl scale-[1.02] ring-2 ring-brand-500/20' 
                      : 'border-white/5 opacity-60 hover:opacity-90'
                  }`}>
                  <div className="absolute inset-0 rounded-2xl opacity-[0.04]" style={{ backgroundImage: `radial-gradient(circle at 70% 30%, ${cc.accent} 0%, transparent 50%)` }}></div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center border border-white/5"><img src="/images/VAYU.png" alt="" className="w-5 h-5 rounded" /></div>
                        <div className={`w-9 h-6 bg-gradient-to-br ${cc.chip} rounded-md shadow-sm`}></div>
                      </div>
                      <p className="text-surface-300 font-mono text-[11px] tracking-[0.2em] mb-1">•••• {acc.account_number.slice(-4)}</p>
                    </div>
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${isPending ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 'bg-green-500/20 text-green-400 border border-green-500/20'}`}>
                        {isPending ? 'Pending Approval' : 'Active'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mode toggle */}
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-1.5 flex">
            {[['deposit', ArrowDownToLine, 'Deposit'], ['withdraw', ArrowUpFromLine, 'Withdraw']].map(([m, Icon, label]) => (
              <button key={m} onClick={() => { setMode(m); setAmount(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all ${mode === m ? 'bg-brand-500 text-surface-900 shadow-md' : 'text-surface-500 hover:text-surface-900 dark:hover:text-surface-100'}`}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-sm p-6 sm:p-8 border border-surface-200 dark:border-surface-800">
            <form onSubmit={initiateTransaction} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">
                  {mode === 'deposit' ? 'Deposit Amount' : 'Withdrawal Amount'}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 font-semibold text-lg">₹</span>
                  <input type="number" min="1" max={maxAmount} required placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="block w-full bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/50 rounded-xl pl-10 pr-4 py-4 text-2xl font-bold text-surface-900 dark:text-surface-100 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all" />
                </div>
                <p className="text-[10px] text-surface-400">Max: ₹{maxAmount.toLocaleString('en-IN')} per transaction</p>
              </div>

              {/* Quick amounts */}
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map(q => (
                  <button key={q} type="button" onClick={() => setAmount(q.toString())}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${parseFloat(amount) === q ? 'bg-brand-500/10 border-brand-500/30 text-brand-600 dark:text-brand-400' : 'bg-surface-50 dark:bg-surface-800/50 border-surface-200 dark:border-surface-700/50 text-surface-600 dark:text-surface-300 hover:border-surface-300 dark:hover:border-surface-600'}`}>
                    ₹{q.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              <button type="submit" disabled={loading || !amount}
                className="w-full flex items-center justify-center py-4 rounded-xl text-sm font-bold text-surface-900 bg-brand-500 hover:bg-brand-400 transition-all disabled:opacity-40 shadow-lg shadow-brand-500/25 active:scale-[0.98] group">
                {loading ? <span className="animate-pulse">Processing...</span> : (
                  <>{mode === 'deposit' ? 'Deposit' : 'Withdraw'} ₹{parseFloat(amount || 0).toLocaleString('en-IN')}
                    {mode === 'deposit' ? <ArrowDownToLine className="ml-2 w-4 h-4" /> : <ArrowUpFromLine className="ml-2 w-4 h-4" />}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Info */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <div className="bg-surface-900 rounded-2xl p-7 text-white relative overflow-hidden border border-surface-800">
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 80% 20%, rgba(251,191,36,0.4) 0%, transparent 50%)` }}></div>
            <div className="relative z-10">
              <Landmark className="w-7 h-7 text-brand-500 mb-5" />
              <h3 className="text-lg font-bold mb-2 tracking-tight">VAYU ATM</h3>
              <p className="text-surface-400 leading-relaxed text-xs mb-6">Deposit or withdraw cash instantly from your VAYU account.</p>
              <div className="space-y-3">
                <div className="bg-surface-800 p-4 rounded-xl border border-surface-700/50 flex justify-between items-center">
                  <p className="text-surface-500 text-[10px] font-semibold uppercase tracking-wider">Max Deposit</p>
                  <p className="text-sm font-bold">₹{MAX_DEPOSIT.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-surface-800 p-4 rounded-xl border border-surface-700/50 flex justify-between items-center">
                  <p className="text-surface-500 text-[10px] font-semibold uppercase tracking-wider">Max Withdrawal</p>
                  <p className="text-sm font-bold">₹{MAX_WITHDRAW.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-surface-800 p-4 rounded-xl border border-surface-700/50 flex justify-between items-center">
                  <p className="text-surface-500 text-[10px] font-semibold uppercase tracking-wider">Fees</p>
                  <p className="text-sm font-bold text-green-400">Free</p>
                </div>
              </div>
            </div>
          </div>

          {/* Selected card detail */}
          {selectedAccount && (
            <div className={`relative bg-gradient-to-br ${cardColor.from} ${cardColor.to} rounded-2xl p-6 text-white overflow-hidden border border-surface-800/50`}>
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `radial-gradient(circle at 70% 30%, ${cardColor.accent} 0%, transparent 50%)` }}></div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center"><img src="/images/VAYU.png" alt="" className="w-4 h-4 rounded" /></div>
                    <span className="font-bold text-sm text-surface-300">VAYU</span>
                  </div>
                  <div className={`w-9 h-6 bg-gradient-to-br ${cardColor.chip} rounded-md`}></div>
                </div>
                <p className="text-surface-300 font-mono text-xs tracking-[0.2em]">{selectedAccount.account_number}</p>
                <p className="text-[9px] text-surface-500 uppercase tracking-widest">Selected for {mode}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <OtpPinModal isOpen={showPinModal} onClose={() => setShowPinModal(false)} onSubmit={executeTransaction} title={mode === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal'} length={6}
        submitLabel={mode === 'deposit' ? 'Deposit' : 'Withdraw'}
        subtitle={<span>{mode === 'deposit' ? 'Depositing' : 'Withdrawing'} <strong>₹{parseFloat(amount || 0).toLocaleString('en-IN')}</strong>. Enter your 6-digit PIN to confirm.</span>} />
    </div>
  );
};

export default ATM;
