import React, { useState, useEffect } from 'react';
import { User, Calendar, UploadCloud, ChevronRight, Smartphone, CreditCard, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { getMyAccounts } from '../services/account.service';
import { updateProfile } from '../services/user.service';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCardColor } from '../utils/cardColors';

const MAX_ACCOUNTS = 3;
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

const CreateAccount = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [existingAccounts, setExistingAccounts] = useState([]);
  const [initializing, setInitializing] = useState(true);
  const [cooldownLeft, setCooldownLeft] = useState(0);

  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
  const defaultDob = eighteenYearsAgo.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '', middle_name: '', last_name: user?.last_name || '',
    email: user?.email || '', phone_number: user?.phone_number || '', dob: defaultDob,
    gender: 'Male', aadhaar_number: '', pan_number: '', currency: 'INR', agreeTerms: false
  });

  useEffect(() => {
    if (user?.first_name) {
      const parts = user.first_name.split(' ');
      if (parts.length > 1) setFormData(prev => ({ ...prev, first_name: parts[0], middle_name: parts.slice(1).join(' ') }));
    }
  }, [user]);

  // Load existing accounts
  useEffect(() => {
    const fetch = async () => {
      try {
        const r = await getMyAccounts();
        setExistingAccounts(r.data.accounts || []);
        // Check cooldown from last account creation
        if (r.data.accounts?.length > 0) {
          const latest = r.data.accounts.reduce((a, b) => new Date(a.created_at) > new Date(b.created_at) ? a : b);
          const elapsed = Date.now() - new Date(latest.created_at).getTime();
          if (elapsed < COOLDOWN_MS) setCooldownLeft(Math.ceil((COOLDOWN_MS - elapsed) / 1000));
        }
      } catch {} finally { setInitializing(false); }
    };
    fetch();
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const t = setInterval(() => setCooldownLeft(prev => prev <= 1 ? 0 : prev - 1), 1000);
    return () => clearInterval(t);
  }, [cooldownLeft]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreeTerms) return toast.error('Accept Terms & Conditions');
    if (cooldownLeft > 0) return toast.error(`Please wait ${formatTimer(cooldownLeft)} before creating another account`);
    if (formData.dob) {
      const bd = new Date(formData.dob); let age = new Date().getFullYear() - bd.getFullYear();
      const m = new Date().getMonth() - bd.getMonth();
      if (m < 0 || (m === 0 && new Date().getDate() < bd.getDate())) age--;
      if (age < 18) return toast.error('Must be 18+ to open account');
    }
    setLoading(true);
    try {
      const nameParts = [formData.first_name]; if (formData.middle_name) nameParts.push(formData.middle_name);
      const up = await updateProfile({ first_name: nameParts.join(' '), last_name: formData.last_name, phone_number: formData.phone_number });
      updateUserProfile({ ...user, ...up.data.user });
      await api.post('/accounts', { currency: formData.currency, dob: formData.dob, gender: formData.gender, aadhaar_number: formData.aadhaar_number, pan_number: formData.pan_number });
      toast.success('Account created! Please set up your PIN from the dashboard.');
      navigate('/dashboard');
    } catch (err) { toast.error(err.message || 'Failed'); } finally { setLoading(false); }
  };

  const formatTimer = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const inputClass = "block w-full bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/50 rounded-xl px-4 py-3 text-sm text-surface-900 dark:text-surface-100 font-medium focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none";

  if (initializing) return (
    <div className="animate-pulse space-y-8 max-w-3xl mx-auto pt-8">
      <div className="h-12 bg-surface-200 dark:bg-surface-800 rounded-2xl w-2/3"></div>
      <div className="h-96 bg-surface-200 dark:bg-surface-800 rounded-3xl"></div>
    </div>
  );

  // === MAX ACCOUNTS REACHED ===
  if (existingAccounts.length >= MAX_ACCOUNTS) {
    return (
      <div className="max-w-3xl mx-auto font-sans w-full pb-12 animate-slide-up">
        <div className="mb-8">
          <p className="text-brand-500 font-semibold tracking-wider uppercase text-[11px] mb-1">Account</p>
          <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-100">Open an Account</h1>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-sm p-8 border border-surface-200 dark:border-surface-800 space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-brand-500/10 p-3 rounded-xl text-brand-500 flex-shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 mb-1">Account Limit Reached</h2>
              <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
                You've already opened the maximum of <strong className="text-surface-900 dark:text-surface-100">{MAX_ACCOUNTS} bank accounts</strong> with VAYU. 
                To open a new account, you would need to close an existing one from your dashboard.
              </p>
            </div>
          </div>

          <div className="border-t border-surface-100 dark:border-surface-800 pt-6">
            <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-4">Your Active Accounts</p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {existingAccounts.map((acc, i) => {
                const cc = getCardColor(i);
                return (
                  <div key={acc.id} className={`relative bg-gradient-to-br ${cc.from} ${cc.to} rounded-2xl p-5 min-w-[220px] text-white border border-surface-800/50 flex-shrink-0`}>
                    <div className="absolute inset-0 rounded-2xl opacity-[0.04]" style={{ backgroundImage: `radial-gradient(circle at 70% 30%, ${cc.accent} 0%, transparent 50%)` }}></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-6 h-6 bg-white/10 rounded-md flex items-center justify-center"><img src="/images/VAYU.png" alt="" className="w-4 h-4 rounded" /></div>
                        <div className={`w-8 h-5 bg-gradient-to-br ${cc.chip} rounded-sm`}></div>
                      </div>
                      <p className="text-surface-300 font-mono text-[10px] tracking-[0.2em]">•••• {acc.account_number.slice(-4)}</p>
                      <p className="text-[9px] text-surface-500 mt-2 uppercase tracking-wider">{acc.status}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button onClick={() => navigate('/dashboard')}
            className="w-full py-3.5 rounded-xl font-semibold text-sm text-brand-600 dark:text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 transition-colors">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto font-sans w-full pb-12 animate-slide-up">
      <div className="mb-8">
        <p className="text-brand-500 font-semibold tracking-wider uppercase text-[11px] mb-1">Account</p>
        <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-100">Open an Account</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Provide your identity details to get started.</p>
      </div>

      {/* Cooldown notice */}
      {cooldownLeft > 0 && (
        <div className="mb-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-center space-x-3">
          <div className="bg-amber-500/10 p-2 rounded-lg text-amber-500"><AlertCircle className="w-4 h-4" /></div>
          <div>
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Cooldown Active</p>
            <p className="text-xs text-surface-500">Please wait <strong className="text-amber-600 dark:text-amber-400 font-mono">{formatTimer(cooldownLeft)}</strong> before creating another account.</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-sm p-6 sm:p-8 border border-surface-200 dark:border-surface-800">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1 */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 pb-2 border-b border-surface-100 dark:border-surface-800">Personal Details</h3>
            <div className="grid grid-cols-3 gap-3">
              {[['First', 'first_name', true], ['Middle', 'middle_name', false], ['Last', 'last_name', true]].map(([label, key, req]) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">{label}</label>
                  <input type="text" required={req} name={key} value={formData[key]} onChange={handleChange} className={inputClass} />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Email</label>
                <input type="email" disabled value={formData.email} className={`${inputClass} opacity-50 cursor-not-allowed`} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Phone</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                  <input type="tel" required name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="+91" className={`${inputClass} pl-11`} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                  <input type="date" required name="dob" value={formData.dob} onChange={handleChange} className={`${inputClass} pl-11`} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Gender</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                  <select name="gender" value={formData.gender} onChange={handleChange} className={`${inputClass} pl-11 appearance-none cursor-pointer`}>
                    <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-5 pt-4 border-t border-surface-100 dark:border-surface-800">
            <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 pb-2 border-b border-surface-100 dark:border-surface-800">Identity Verification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[['Aadhaar (12 Digits)', 'aadhaar_number', '0000 0000 0000', '12'], ['PAN (10 Chars)', 'pan_number', 'ABCDE1234F', '10']].map(([label, key, ph, ml]) => (
                <div key={key} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">{label}</label>
                    <input name={key} type="text" required placeholder={ph} maxLength={ml} value={key === 'pan_number' ? formData[key].toUpperCase() : formData[key]} onChange={handleChange}
                      className={`${inputClass} tracking-widest ${key === 'pan_number' ? 'uppercase' : ''}`} />
                  </div>
                  <div className="border border-dashed border-surface-300 dark:border-surface-700 rounded-xl p-3.5 flex items-center justify-center bg-surface-50/50 dark:bg-surface-800/30 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors relative cursor-pointer group">
                    <div className="flex flex-col items-center">
                      <UploadCloud className="h-5 w-5 text-surface-400 group-hover:text-brand-500 transition-colors mb-1" />
                      <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400">Upload {key === 'aadhaar_number' ? 'Aadhaar' : 'PAN'}</span>
                    </div>
                    <input type="file" accept="image/*,.pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Terms & Submit */}
          <div className="pt-6 border-t border-surface-100 dark:border-surface-800 space-y-5">
            <label className="flex items-start space-x-3 cursor-pointer bg-surface-50 dark:bg-surface-800/30 p-4 rounded-xl border border-surface-200 dark:border-surface-700/50">
              <input id="agreeTerms" name="agreeTerms" type="checkbox" required checked={formData.agreeTerms} onChange={handleChange}
                className="w-4 h-4 border-surface-300 dark:border-surface-600 rounded text-brand-500 mt-0.5 bg-transparent" />
              <div>
                <span className="text-sm font-semibold text-surface-900 dark:text-surface-100">I agree to the VAYU Customer Agreement</span>
                <p className="text-xs text-surface-400 mt-0.5">I certify I am 18+ and information is truthful.</p>
              </div>
            </label>

            <button type="submit" disabled={loading || cooldownLeft > 0}
              className="w-full flex items-center justify-center py-4 rounded-xl text-sm font-bold text-surface-900 bg-brand-500 hover:bg-brand-400 transition-all disabled:opacity-50 shadow-lg shadow-brand-500/25 active:scale-[0.98] group">
              {loading ? <span className="animate-pulse">Processing...</span> : <>Submit Application <ChevronRight className="ml-1.5 h-4 w-4 group-hover:translate-x-0.5 transition-transform" /></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAccount;
