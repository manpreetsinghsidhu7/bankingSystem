import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, closeProfile } from '../services/user.service';
import { getMyAccounts } from '../services/account.service';
import toast from 'react-hot-toast';
import { User, Lock, AlertTriangle, ShieldCheck, Mail, Trash2, X } from 'lucide-react';
import api from '../services/api';
import { OtpPinModal } from '../components/UI/OtpPinModal';

const Settings = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [accountCount, setAccountCount] = useState(0);
  
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || ''
  });

  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [showOtp, setShowOtp] = useState(false);
  const [dummyOtp, setDummyOtp] = useState('');
  const [maskedIdentity, setMaskedIdentity] = useState('');

  // Delete profile state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try { const r = await getMyAccounts(); setAccountCount(r.data.accounts?.length || 0); } catch {}
    };
    fetchAccounts();
  }, []);

  const generateMask = (ident) => {
    if (!ident) return 'your method';
    if (ident.includes('@')) { const [n, d] = ident.split('@'); return n.length > 3 ? `${n.substring(0, 3)}***@${d}` : `${n[0]}***@${d}`; }
    return ident.length > 4 ? `*******${ident.slice(-4)}` : `*******${ident}`;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const resp = await updateProfile(formData);
      updateUserProfile({ ...user, ...resp.data.user });
      toast.success('Profile updated');
    } catch (err) { toast.error(err.message || 'Update failed'); } finally { setIsLoading(false); }
  };

  const initiatePasswordUpdate = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) return toast.error('Passwords do not match');
    const ident = user?.email || user?.phone_number;
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setDummyOtp(code); setMaskedIdentity(generateMask(ident)); setShowOtp(true);
  };

  const handleOtpSubmit = async (entered) => {
    if (entered !== dummyOtp) return toast.error('Invalid OTP');
    setShowOtp(false); setIsPasswordLoading(true);
    try {
      await api.patch('/auth/change-password', { oldPassword: 'BYPASS_OTP', newPassword: passwordData.newPassword });
      toast.success('Password changed');
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.message || 'Failed'); } finally { setIsPasswordLoading(false); }
  };

  const openDeleteProfile = () => {
    if (accountCount > 0) {
      toast.error(`You have ${accountCount} bank account(s). Please delete all accounts first.`);
      return;
    }
    setDeletePassword('');
    setShowDeleteModal(true);
  };

  const handleDeleteProfile = async () => {
    if (!deletePassword) return toast.error('Enter your password');
    setDeleteLoading(true);
    try {
      // Verify password
      await api.post('/auth/login', { identifier: user?.email, password: deletePassword });
      await closeProfile();
      toast.success('Account deleted');
      logout();
    } catch (err) { toast.error(err.message || 'Deletion failed'); } finally { setDeleteLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans w-full pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-400 flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-surface-900 dark:text-surface-100">Personal Info</h2>
                <p className="text-[10px] font-medium text-surface-400 uppercase tracking-wider">General</p>
              </div>
            </div>
            {/* Delete profile icon */}
            <button onClick={openDeleteProfile} title="Delete VAYU Profile"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-surface-400 hover:text-red-500 hover:bg-red-500/10 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5">
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              {[['First Name', 'first_name', 'text'], ['Last Name', 'last_name', 'text'], ['Phone', 'phone_number', 'tel']].map(([label, key, type]) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">{label}</label>
                  <input type={type} required={key !== 'phone_number'} placeholder={key === 'phone_number' ? '+91 99999 99999' : ''}
                    value={formData[key]} onChange={(e) => setFormData({...formData, [key]: e.target.value})}
                    className="block w-full bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/50 rounded-xl px-4 py-3 text-sm text-surface-900 dark:text-surface-100 font-medium focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
                  />
                </div>
              ))}
              <button type="submit" disabled={isLoading}
                className="w-full py-3 text-sm font-semibold text-brand-600 dark:text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 rounded-xl transition-colors mt-2">
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* Security Card */}
        <div className="bg-surface-900 dark:bg-surface-900 rounded-2xl border border-surface-800 overflow-hidden shadow-sm text-white relative">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <ShieldCheck className="w-32 h-32 text-brand-500" strokeWidth={0.5} />
          </div>
          <div className="p-5 border-b border-surface-800/50 flex items-center space-x-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-surface-800 text-brand-400 flex items-center justify-center">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Security</h2>
              <p className="text-[10px] font-medium text-surface-500 uppercase tracking-wider">Password</p>
            </div>
          </div>
          <div className="p-5 relative z-10">
            <form onSubmit={initiatePasswordUpdate} className="space-y-4">
              <p className="text-xs text-surface-400 leading-relaxed">An OTP will be sent for verification before updating.</p>
              {[['New Password', 'newPassword'], ['Confirm', 'confirmPassword']].map(([label, key]) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">{label}</label>
                  <input type="password" required value={passwordData[key]}
                    onChange={(e) => setPasswordData({...passwordData, [key]: e.target.value})}
                    className="block w-full bg-surface-800/50 border border-surface-700/50 rounded-xl px-4 py-3 text-sm text-white font-medium focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none placeholder-surface-600"
                    placeholder={key === 'newPassword' ? 'Min 8 chars' : 'Repeat'}
                  />
                </div>
              ))}
              <button type="submit" disabled={isPasswordLoading || !passwordData.newPassword}
                className="w-full flex justify-center items-center py-3 text-sm font-semibold text-white border border-surface-700 bg-surface-800 hover:bg-surface-700 rounded-xl transition-colors disabled:opacity-40">
                <Mail className="w-4 h-4 mr-2 opacity-50" /> Send OTP & Update
              </button>
            </form>
          </div>
        </div>
      </div>

      <OtpPinModal isOpen={showOtp} onClose={() => setShowOtp(false)} onSubmit={handleOtpSubmit} title="Verify Identity" length={4}
        subtitle={<span>OTP sent to <strong>{maskedIdentity}</strong><br/><span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded inline-block mt-2">Demo OTP: {dummyOtp}</span></span>}
      />

      {/* Delete Profile Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowDeleteModal(false)}></div>
          <div className="relative bg-surface-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in border border-surface-800/50 text-white">
            <div className="flex justify-between items-center p-5 border-b border-surface-800/50">
              <h3 className="text-sm font-bold text-red-400">Delete Account</h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-surface-400 hover:text-surface-200 bg-surface-800 p-1.5 rounded-lg"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-surface-300">Permanently delete your <strong className="text-red-400">VAYU portal profile</strong>?</p>
              <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 text-xs text-red-400 space-y-1">
                <p>• This action is <strong>irreversible</strong></p>
                <p>• You must have <strong>no bank accounts</strong> linked</p>
                <p>• Your login credentials will be deleted</p>
                <p>• You won't be able to access VAYU services</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">Confirm Password</label>
                <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Your login password"
                  className="block w-full bg-surface-800/50 border border-surface-700/50 rounded-xl px-4 py-3 text-sm text-white font-medium focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all outline-none" />
              </div>
              <button onClick={handleDeleteProfile} disabled={deleteLoading || !deletePassword}
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

export default Settings;
