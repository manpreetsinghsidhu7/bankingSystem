import React, { useState } from 'react';
import { Lock, ArrowRight, Smartphone, Key, ShieldCheck } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthVisuals } from '../components/UI/AuthVisuals';
import { OtpPinModal } from '../components/UI/OtpPinModal';
import { resetPasswordBypass } from '../services/auth.service';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginWithOtp, setLoginWithOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpModalState, setOtpModalState] = useState({ isOpen: false, type: '', dummyOtp: '', maskedIdentity: '' });
  const [resetMode, setResetMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetIdentifier, setResetIdentifier] = useState('');

  const { login, loginWithOtp: contextLoginWithOtp } = useAuth();

  const generateMaskedIdentity = (ident) => {
    if (!ident) return 'your method';
    if (ident.includes('@')) {
      const [name, domain] = ident.split('@');
      return name.length > 3 ? `${name.substring(0, 3)}***@${domain}` : `${name[0]}***@${domain}`;
    }
    return ident.length > 4 ? `*******${ident.slice(-4)}` : `*******${ident}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier) return toast.error('Enter your Email or Phone');
    if (loginWithOtp) {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setOtpModalState({ isOpen: true, type: 'LOGIN_OTP', dummyOtp: code, maskedIdentity: generateMaskedIdentity(identifier) });
    } else {
      if (!password) return toast.error('Enter your password');
      setIsLoading(true);
      try { await login(identifier, password); } catch {} finally { setIsLoading(false); }
    }
  };

  const handleForgotPassword = () => {
    if (!identifier) return toast.error('Enter your Email or Phone first');
    setResetIdentifier(identifier);
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setOtpModalState({ isOpen: true, type: 'FORGOT_PASSWORD', dummyOtp: code, maskedIdentity: generateMaskedIdentity(identifier) });
  };

  const handleOtpSubmit = async (enteredOtp) => {
    if (enteredOtp !== otpModalState.dummyOtp) return toast.error('Invalid OTP');
    const type = otpModalState.type;
    setOtpModalState({ ...otpModalState, isOpen: false });
    if (type === 'LOGIN_OTP') {
      setIsLoading(true);
      try { await contextLoginWithOtp(identifier); } catch {} finally { setIsLoading(false); }
    } else if (type === 'FORGOT_PASSWORD') {
      toast.success('Verified! Set your new password.');
      setResetMode(true);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    if (newPassword.length < 8) return toast.error('Minimum 8 characters required');
    setIsLoading(true);
    try {
      await resetPasswordBypass(resetIdentifier, newPassword);
      toast.success('Password updated. Login now.');
      setResetMode(false);
      setNewPassword(''); setConfirmPassword(''); setPassword(''); setLoginWithOtp(false);
    } catch (err) {
      toast.error(err.message || 'Reset failed');
    } finally { setIsLoading(false); }
  };

  return (
    /* Mobile: column (visuals top, form bottom). Desktop: row (left visual, right form) */
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-surface-950 font-sans">
      <AuthVisuals />

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 sm:px-12 lg:p-20 relative">
        <div className="max-w-sm w-full space-y-8 animate-slide-up">
          <div>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
              {resetMode ? 'Reset Password' : 'Welcome back'}
            </h2>
            <p className="mt-1.5 text-sm text-surface-500 dark:text-surface-400">
              {resetMode ? 'Create your new secure password.' : 'Sign in to your VAYU account.'}
            </p>
          </div>

          {!resetMode ? (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <Input label="Email or Phone" id="identifier" type="text" required placeholder="you@example.com" icon={Smartphone} value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
              {!loginWithOtp && (
                <Input label="Password" id="password" type="password" required={!loginWithOtp} placeholder="Enter password" icon={Lock} value={password} onChange={(e) => setPassword(e.target.value)} />
              )}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input type="checkbox" checked={loginWithOtp} onChange={(e) => setLoginWithOtp(e.target.checked)} className="w-3.5 h-3.5 text-brand-500 border-surface-300 dark:border-surface-600 rounded focus:ring-brand-500 cursor-pointer bg-transparent" />
                  <span className="text-xs font-medium text-surface-500 dark:text-surface-400">Login with OTP</span>
                </label>
                {!loginWithOtp && (
                  <button type="button" onClick={handleForgotPassword} className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>
              <Button type="submit" className="w-full h-12 text-sm shadow-lg group border-none bg-brand-500 hover:bg-brand-400 text-surface-900 rounded-xl transition-all font-bold" isLoading={isLoading}>
                {!isLoading && (
                  <span className="flex items-center justify-center w-full">
                    {loginWithOtp ? 'Send OTP' : 'Sign In'}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                )}
              </Button>
              <p className="text-center text-xs text-surface-500 dark:text-surface-400">
                No account? <Link to="/register" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">Register</Link>
              </p>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleResetSubmit}>
              <div className="bg-brand-500/10 dark:bg-brand-500/5 p-3.5 rounded-xl flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-brand-700 dark:text-brand-300 leading-relaxed">
                  Identity verified for <strong>{generateMaskedIdentity(resetIdentifier)}</strong>. Enter new credentials.
                </p>
              </div>
              <Input label="New Password" type="password" required placeholder="Min 8 characters" icon={Key} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <Input label="Confirm Password" type="password" required placeholder="Repeat password" icon={Key} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              <Button type="submit" className="w-full h-12 text-sm shadow-lg border-none bg-brand-500 hover:bg-brand-400 text-surface-900 rounded-xl font-bold" isLoading={isLoading}>
                {!isLoading && 'Update Password'}
              </Button>
              <button type="button" onClick={() => { setResetMode(false); setLoginWithOtp(false); }}
                className="w-full text-xs font-medium text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors text-center">
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>

      <OtpPinModal
        isOpen={otpModalState.isOpen}
        onClose={() => setOtpModalState({ ...otpModalState, isOpen: false })}
        onSubmit={handleOtpSubmit}
        title={otpModalState.type === 'LOGIN_OTP' ? 'OTP Verification' : 'Identity Check'}
        length={4}
        subtitle={
          <span>
            OTP sent to <strong>{otpModalState.maskedIdentity}</strong>
            <br />
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded inline-block mt-2">
              Demo OTP: {otpModalState.dummyOtp}
            </span>
          </span>
        }
      />
    </div>
  );
};

export default Login;
