import React, { useState } from 'react';
import { Lock, User, ArrowRight, Smartphone } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/auth.service';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { AuthVisuals } from '../components/UI/AuthVisuals';
import { OtpPinModal } from '../components/UI/OtpPinModal';

const Register = () => {
  const [formData, setFormData] = useState({ first_name: '', middle_name: '', last_name: '', identifier: '', password: '' });
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [dummyOtp, setDummyOtp] = useState('');
  const [maskedIdentity, setMaskedIdentity] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const generateMask = (ident) => {
    if (ident.includes('@')) { const [n, d] = ident.split('@'); return `${n.substring(0, 3)}***@${d}`; }
    return `*******${ident.slice(-4)}`;
  };

  const initiateRegistration = (e) => {
    e.preventDefault();
    if (!agreed) return toast.error('Accept Terms & Conditions');
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setDummyOtp(code);
    setMaskedIdentity(generateMask(formData.identifier));
    setShowOtp(true);
  };

  const handleOtpSubmit = async (enteredOtp) => {
    if (enteredOtp !== dummyOtp) return toast.error('Invalid OTP');
    setShowOtp(false);
    setIsLoading(true);
    try {
      const nameParts = [formData.first_name];
      if (formData.middle_name) nameParts.push(formData.middle_name);
      await registerUser({ first_name: nameParts.join(' '), last_name: formData.last_name, identifier: formData.identifier, password: formData.password });
      toast.success('Registered! Logging in...');
      await login(formData.identifier, formData.password);
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally { setIsLoading(false); }
  };

  return (
    /* Mobile: column (visuals top, form bottom). Desktop: row (left visual, right form) */
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-surface-950 font-sans">
      <AuthVisuals />

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 sm:px-12 lg:p-20 relative">
        <div className="max-w-sm w-full space-y-8 animate-slide-up">
          <div>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">Create Account</h2>
            <p className="mt-1.5 text-sm text-surface-500 dark:text-surface-400">Join the VAYU ecosystem.</p>
          </div>

          <form className="space-y-4" onSubmit={initiateRegistration}>
            <div className="grid grid-cols-3 gap-2">
              <Input label="First" name="first_name" type="text" required placeholder="First" value={formData.first_name} onChange={handleChange} />
              <Input label="Middle" name="middle_name" type="text" placeholder="Optional" value={formData.middle_name} onChange={handleChange} />
              <Input label="Last" name="last_name" type="text" required placeholder="Last" value={formData.last_name} onChange={handleChange} />
            </div>
            <Input label="Email or Phone" name="identifier" type="text" required placeholder="you@example.com" icon={Smartphone} value={formData.identifier} onChange={handleChange} />
            <Input label="Password" name="password" type="password" required placeholder="Min 8 characters" icon={Lock} value={formData.password} onChange={handleChange} />

            <label className="flex items-start space-x-2.5 cursor-pointer pt-1">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-3.5 h-3.5 text-brand-500 border-surface-300 dark:border-surface-600 rounded mt-0.5 bg-transparent" required />
              <span className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
                I agree to the <a href="#" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">Terms</a> and <a href="#" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">Privacy Policy</a>
              </span>
            </label>

            <Button type="submit" className="w-full h-12 text-sm shadow-lg group border-none bg-brand-500 hover:bg-brand-400 text-surface-900 rounded-xl font-bold" isLoading={isLoading}>
              {!isLoading && (
                <span className="flex items-center justify-center w-full">Register <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" /></span>
              )}
            </Button>

            <p className="text-center text-xs text-surface-500 dark:text-surface-400">
              Have an account? <Link to="/login" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">Sign In</Link>
            </p>
          </form>
        </div>
      </div>

      <OtpPinModal
        isOpen={showOtp}
        onClose={() => setShowOtp(false)}
        onSubmit={handleOtpSubmit}
        title="Verify Identity"
        length={4}
        subtitle={
          <span>
            OTP sent to <strong>{maskedIdentity}</strong>
            <br />
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded inline-block mt-2">
              Demo OTP: {dummyOtp}
            </span>
          </span>
        }
      />
    </div>
  );
};

export default Register;
