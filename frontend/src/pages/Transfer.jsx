import React, { useState, useEffect, useRef } from 'react';
import { Building2, CreditCard, AlignLeft, Send, Plus, UserCheck, Zap, Eye, EyeOff, ExternalLink, ChevronDown, Check } from 'lucide-react';
import { getMyAccounts, verifyReceiver, verifyPin } from '../services/account.service';
import { processTransfer, getTransactionHistory } from '../services/transaction.service';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { OtpPinModal } from '../components/UI/OtpPinModal';
import { getCardColor } from '../utils/cardColors';

const DAILY_LIMIT = 500000; // ₹5,00,000

const Transfer = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [receiverAccount, setReceiverAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [receiverVerified, setReceiverVerified] = useState(false);
  const [receiverName, setReceiverName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  // Custom Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Balance view
  const [showBalance, setShowBalance] = useState(false);
  const [showBalancePinModal, setShowBalancePinModal] = useState(false);

  // Daily limit tracking
  const [dailySpent, setDailySpent] = useState(0);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);
  const selectedIdx = accounts.findIndex(a => a.id === selectedAccountId);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        const r = await getMyAccounts();
        const activeAccounts = r.data.accounts.filter(a => a.pin_hash && (a.status === 'ACTIVE' || a.status === 'PENDING'));
        setAccounts(activeAccounts);
        if (activeAccounts.length > 0) {
          setSelectedAccountId(activeAccounts[0].id);
          // Calculate daily spent
          await calcDailySpent(activeAccounts[0].id);
        }
      } catch { toast.error('Could not load accounts'); } finally { setInitializing(false); }
    };
    fetch();
  }, []);

  const calcDailySpent = async (accId) => {
    try {
      const txRes = await getTransactionHistory(accId, 1, 100, {});
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      let spent = 0;
      txRes.data.transactions.forEach(tx => {
        const txDate = new Date(tx.created_at).toISOString().split('T')[0];
        if (txDate === todayStr && (tx.sender_account_id === accId || tx.type === 'WITHDRAWAL')) {
          spent += parseFloat(tx.amount);
        }
      });
      setDailySpent(spent);
    } catch { setDailySpent(0); }
  };

  const handleAccountChange = async (accId) => {
    setSelectedAccountId(accId);
    setIsDropdownOpen(false);
    setShowBalance(false);
    await calcDailySpent(accId);
  };

  const handleVerifyReceiver = async () => {
    if (!receiverAccount) return toast.error('Enter receiver account');
    setIsVerifying(true);
    try { const r = await verifyReceiver(receiverAccount); setReceiverName(r.data.name); setReceiverVerified(true); toast.success('Recipient verified'); }
    catch (err) { setReceiverVerified(false); setReceiverName(''); toast.error(err.message || 'Invalid account'); }
    finally { setIsVerifying(false); }
  };

  const handleReceiverChange = (e) => { setReceiverAccount(e.target.value); setReceiverVerified(false); setReceiverName(''); };

  const initiateTransfer = (e) => {
    e.preventDefault();
    if (selectedAccount?.status !== 'ACTIVE') {
      return toast.error('Sender account is pending approval. Payments are restricted.');
    }
    if (!receiverVerified) return toast.error('Verify recipient first');
    if (!selectedAccountId || !amount) return toast.error('Fill required fields');
    const transferAmount = parseFloat(amount);
    if (dailySpent + transferAmount > DAILY_LIMIT) {
      return toast.error(`Daily limit exceeded. Remaining: ₹${(DAILY_LIMIT - dailySpent).toLocaleString('en-IN')}`);
    }
    setShowPinModal(true);
  };

  const executeTransfer = async (pin) => {
    setLoading(true); setShowPinModal(false);
    try {
      await processTransfer({ senderAccountId: selectedAccountId, receiverAccountNumber: receiverAccount, amount: parseFloat(amount), description, pin });
      toast.success('Payment sent!');
      setReceiverAccount(''); setReceiverVerified(false); setReceiverName(''); setAmount(''); setDescription('');
      setDailySpent(prev => prev + parseFloat(amount));
    } catch (err) { toast.error(err.message || 'Failed'); } finally { setLoading(false); }
  };

  const handleBalancePinSubmit = async (pin) => {
    try {
      await verifyPin(selectedAccountId, pin);
      setShowBalancePinModal(false); setShowBalance(true);
      setTimeout(() => setShowBalance(false), 30000);
    } catch { toast.error('Incorrect PIN'); }
  };

  const remainingLimit = Math.max(0, DAILY_LIMIT - dailySpent);
  const limitPercent = Math.min(100, (dailySpent / DAILY_LIMIT) * 100);

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
            <h1 className="text-3xl font-bold tracking-tight mb-4">Transfers Locked</h1>
            <p className="text-surface-400 mb-10 text-sm">You need an active account with a PIN to make transfers.</p>
            <button onClick={() => navigate('/create-account')} className="bg-brand-500 text-surface-900 hover:bg-brand-400 px-8 py-4 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-brand-500/25 active:scale-[0.98] flex items-center mx-auto">
              <Plus className="w-5 h-5 mr-2" /> Open Account / Create PIN
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto font-sans w-full pb-12 animate-slide-up">
      <div className="mb-8">
        <p className="text-brand-500 font-semibold tracking-wider uppercase text-[11px] mb-1">Payments</p>
        <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-100">Send Money</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Form */}
        <div className="col-span-1 lg:col-span-3">
          <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-sm p-6 sm:p-8 border border-surface-200 dark:border-surface-800">
            <form onSubmit={initiateTransfer} className="space-y-6">
              {/* From — custom dropdown */}
              <div className="space-y-1.5" ref={dropdownRef}>
                <label className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Pay From</label>
                <div className="relative">
                  <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center justify-between w-full bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/50 rounded-xl px-4 py-3 text-sm text-left outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all">
                    <div className="flex items-center space-x-3">
                      <Building2 className="h-4 w-4 text-surface-400" />
                      {selectedAccount ? (
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${getCardColor(selectedIdx).from} ${getCardColor(selectedIdx).to}`}></div>
                          <span className="font-semibold text-surface-900 dark:text-surface-100">Checking •••• {selectedAccount.account_number.slice(-4)}</span>
                        </div>
                      ) : (
                        <span className="text-surface-400">Select an account</span>
                      )}
                    </div>
                    <ChevronDown className={`h-4 w-4 text-surface-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl shadow-xl overflow-hidden animate-slide-down">
                      <div className="p-1 space-y-1">
                        {accounts.map((acc, idx) => {
                          const cc = getCardColor(idx);
                          return (
                            <button key={acc.id} type="button" onClick={() => handleAccountChange(acc.id)}
                              className={`flex items-center justify-between w-full p-3 rounded-lg text-left transition-all ${
                                selectedAccountId === acc.id ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400' : 'hover:bg-surface-50 dark:hover:bg-surface-800/50 text-surface-600 dark:text-surface-300'
                              }`}>
                              <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cc.from} ${cc.to} flex items-center justify-center text-[8px] text-white font-bold`}>
                                  {acc.account_number.slice(-2)}
                                </div>
                                <div>
                                  <p className="text-xs font-bold">Checking •••• {acc.account_number.slice(-4)}</p>
                                  <p className={`text-[10px] font-medium ${acc.status === 'PENDING' ? 'text-amber-500' : 'text-green-500'}`}>
                                    {acc.status === 'PENDING' ? 'Pending Approval' : 'Active'}
                                  </p>
                                </div>
                              </div>
                              {selectedAccountId === acc.id && <Check className="h-4 w-4" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                {/* Balance toggle */}
                {selectedAccount && (
                  <div className="flex items-center justify-between mt-2 bg-surface-50 dark:bg-surface-800/30 rounded-xl px-4 py-2.5 border border-surface-200/50 dark:border-surface-700/30">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-surface-400 font-semibold uppercase tracking-wider">Balance:</span>
                      <span className="text-sm font-bold text-surface-900 dark:text-surface-100">
                        {showBalance ? `₹${parseFloat(selectedAccount.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹••••••'}
                      </span>
                    </div>
                    <button type="button" onClick={() => showBalance ? setShowBalance(false) : setShowBalancePinModal(true)}
                      className="text-surface-400 hover:text-brand-500 transition-colors p-1">
                      {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Recipient */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Send To</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                    <input type="text" required placeholder="Account number" value={receiverAccount} onChange={handleReceiverChange}
                      className="block w-full bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/50 rounded-xl pl-11 pr-4 py-3 text-sm text-surface-900 dark:text-surface-100 font-semibold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all tracking-wider" />
                  </div>
                  <button type="button" onClick={handleVerifyReceiver} disabled={isVerifying || !receiverAccount || receiverVerified}
                    className="px-5 rounded-xl font-semibold text-xs border border-brand-500/30 text-brand-600 dark:text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 disabled:opacity-40 transition-colors">
                    {isVerifying ? '...' : receiverVerified ? '✓' : 'Verify'}
                  </button>
                </div>
                {receiverVerified && (
                  <div className="flex items-center text-xs font-medium text-green-600 dark:text-green-400 bg-green-500/10 p-2.5 rounded-xl mt-1.5 border border-green-500/10">
                    <UserCheck className="w-4 h-4 mr-2" /> {receiverName}
                  </div>
                )}
              </div>

              {/* Amount + Memo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 font-semibold">₹</span>
                    <input type="number" min="1" max={remainingLimit} required disabled={!receiverVerified} placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
                      className="block w-full bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/50 rounded-xl pl-9 pr-4 py-3 text-xl font-bold text-surface-900 dark:text-surface-100 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all disabled:opacity-40" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Memo</label>
                  <div className="relative">
                    <AlignLeft className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                    <input type="text" disabled={!receiverVerified} placeholder="What for?" value={description} onChange={(e) => setDescription(e.target.value)}
                      className="block w-full bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/50 rounded-xl pl-11 pr-4 py-3 text-sm text-surface-900 dark:text-surface-100 font-medium outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all disabled:opacity-40" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading || !receiverVerified}
                className="w-full flex items-center justify-center py-4 rounded-xl text-sm font-bold text-surface-900 bg-brand-500 hover:bg-brand-400 transition-all disabled:opacity-40 shadow-lg shadow-brand-500/25 active:scale-[0.98] group">
                {loading ? <span className="animate-pulse">Processing...</span> : <>Pay ₹{amount || '0.00'} <Send className="ml-2 h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /></>}
              </button>
            </form>
          </div>
        </div>

        {/* Info Panel */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <div className="bg-surface-900 rounded-2xl p-7 text-white relative overflow-hidden border border-surface-800">
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 80% 20%, rgba(251,191,36,0.4) 0%, transparent 50%)` }}></div>
            <div className="relative z-10">
              <Zap className="w-7 h-7 text-brand-500 mb-5" />
              <h3 className="text-lg font-bold mb-2 tracking-tight">Zero Fees</h3>
              <p className="text-surface-400 leading-relaxed text-xs mb-6">VAYU-to-VAYU transfers are instant and free.</p>
              <div className="space-y-3">
                <div className="bg-surface-800 p-4 rounded-xl border border-surface-700/50">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-surface-500 text-[10px] font-semibold uppercase tracking-wider">Daily Limit</p>
                    <p className="text-sm font-bold">₹{DAILY_LIMIT.toLocaleString('en-IN')}</p>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-surface-700 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${limitPercent}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-[10px] text-surface-500">Used: ₹{dailySpent.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-brand-400 font-semibold">Left: ₹{remainingLimit.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="bg-surface-800 p-4 rounded-xl border border-surface-700/50 flex justify-between items-center">
                  <p className="text-surface-500 text-[10px] font-semibold uppercase tracking-wider">Speed</p>
                  <p className="text-sm font-bold">Instant</p>
                </div>
              </div>
            </div>
          </div>

          {/* Extend limit link */}
          <Link to={`/contact?subject=${encodeURIComponent('Increase Daily Transfer Limit')}&body=${encodeURIComponent('I would like to increase my daily transfer limit to ')}`}
            className="flex items-center justify-between bg-white dark:bg-surface-900 rounded-2xl p-4 border border-surface-200 dark:border-surface-800 hover:border-brand-500/30 transition-all group">
            <div>
              <p className="text-xs font-bold text-surface-900 dark:text-surface-100">Need a higher limit?</p>
              <p className="text-[10px] text-surface-400">Contact your branch manager</p>
            </div>
            <ExternalLink className="w-4 h-4 text-surface-400 group-hover:text-brand-500 transition-colors" />
          </Link>
        </div>
      </div>

      <OtpPinModal isOpen={showPinModal} onClose={() => setShowPinModal(false)} onSubmit={executeTransfer} title="Authorize Payment" length={6}
        subtitle={<span>Sending <strong>₹{parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> to <strong>{receiverName}</strong>. Enter your 6-digit PIN.</span>} />

      <OtpPinModal isOpen={showBalancePinModal} onClose={() => setShowBalancePinModal(false)} onSubmit={handleBalancePinSubmit} title="Verify PIN" length={6}
        subtitle="Enter your PIN to view account balance." />
    </div>
  );
};

export default Transfer;
