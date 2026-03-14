import React, { useState } from 'react';
import { X, Lock, Smartphone, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * PinSetupModal — 3-step flow:
 * Step 1: Send OTP to phone → verify
 * Step 2: Enter new 6-digit PIN + confirm
 * Step 3: Success
 *
 * Props:
 *   isOpen, onClose, onSubmit(pin), title, isChange (boolean)
 */
export const PinSetupModal = ({ isOpen, onClose, onSubmit, title = 'Create PIN', isChange = false }) => {
  const { user } = useAuth();
  const phone = user?.phone_number || '';
  const maskedPhone = phone.length > 4 ? `*******${phone.slice(-4)}` : phone;

  const [step, setStep] = useState(1); // 1=OTP, 2=PIN, 3=Done
  const [dummyOtp, setDummyOtp] = useState('');
  const [otpInput, setOtpInput] = useState(['', '', '', '']);
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetState = () => {
    setStep(1); setDummyOtp(''); setOtpInput(['', '', '', '']);
    setPin(['', '', '', '', '', '']); setConfirmPin(['', '', '', '', '', '']);
    setError(''); setLoading(false);
  };

  const handleClose = () => { resetState(); onClose(); };

  const sendOtp = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setDummyOtp(code);
  };

  React.useEffect(() => { if (isOpen) { resetState(); sendOtp(); } }, [isOpen]);

  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otpInput]; newOtp[idx] = val.slice(-1); setOtpInput(newOtp); setError('');
    if (val && idx < 3) document.getElementById(`otp-ps-${idx + 1}`)?.focus();
  };

  const handlePinChange = (arr, setArr, idx, val, prefix) => {
    if (!/^\d*$/.test(val)) return;
    const newArr = [...arr]; newArr[idx] = val.slice(-1); setArr(newArr); setError('');
    if (val && idx < 5) document.getElementById(`${prefix}-${idx + 1}`)?.focus();
  };

  const verifyOtp = () => {
    const entered = otpInput.join('');
    if (entered !== dummyOtp) { setError('Invalid OTP. Try again.'); return; }
    setStep(2);
  };

  const submitPin = async () => {
    const p = pin.join(''), cp = confirmPin.join('');
    if (p.length !== 6) { setError('Enter all 6 digits.'); return; }
    if (p !== cp) { setError('PINs do not match.'); return; }
    setLoading(true);
    try { await onSubmit(p); setStep(3); } catch { setError('Failed to set PIN.'); } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  const inputBox = "w-10 h-12 text-center text-lg font-bold rounded-xl border border-surface-700/50 bg-surface-800/50 text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={handleClose}></div>
      <div className="relative bg-surface-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in border border-surface-800/50 text-white">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-surface-800/50">
          <h3 className="text-sm font-bold">{step === 3 ? 'Done' : title}</h3>
          {step !== 3 && <button onClick={handleClose} className="text-surface-400 hover:text-surface-200 bg-surface-800 p-1.5 rounded-lg"><X className="h-4 w-4" /></button>}
        </div>

        <div className="p-6">
          {/* Step 1: OTP */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                  <Smartphone className="w-6 h-6 text-brand-400" />
                </div>
                <p className="text-sm text-surface-400">OTP sent to <strong className="text-surface-200">{maskedPhone}</strong></p>
                <p className="text-xs font-bold text-brand-400 bg-brand-500/10 px-3 py-1 rounded-lg inline-block mt-2">Demo OTP: {dummyOtp}</p>
              </div>
              <div className="flex justify-center gap-3">
                {otpInput.map((d, i) => (
                  <input key={i} id={`otp-ps-${i}`} type="text" inputMode="numeric" maxLength={1} value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)} className={inputBox} autoFocus={i === 0} />
                ))}
              </div>
              {error && <p className="text-xs text-red-400 text-center">{error}</p>}
              <button onClick={verifyOtp} disabled={otpInput.join('').length !== 4}
                className="w-full py-3.5 rounded-xl font-semibold text-sm bg-brand-500 text-surface-900 hover:bg-brand-400 transition-all disabled:opacity-40 active:scale-[0.98] flex items-center justify-center">
                Verify <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            </div>
          )}

          {/* Step 2: PIN entry */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center mb-2">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                  <Lock className="w-6 h-6 text-brand-400" />
                </div>
                <p className="text-sm text-surface-300 font-medium">{isChange ? 'Set your new 6-digit PIN' : 'Create a 6-digit payment PIN'}</p>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider block mb-2 text-center">New PIN</label>
                <div className="flex justify-center gap-2">
                  {pin.map((d, i) => (
                    <input key={i} id={`pin-n-${i}`} type="password" inputMode="numeric" maxLength={1} value={d}
                      onChange={(e) => handlePinChange(pin, setPin, i, e.target.value, 'pin-n')} className={inputBox} autoFocus={i === 0} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider block mb-2 text-center">Confirm PIN</label>
                <div className="flex justify-center gap-2">
                  {confirmPin.map((d, i) => (
                    <input key={i} id={`pin-c-${i}`} type="password" inputMode="numeric" maxLength={1} value={d}
                      onChange={(e) => handlePinChange(confirmPin, setConfirmPin, i, e.target.value, 'pin-c')} className={inputBox} />
                  ))}
                </div>
              </div>
              {error && <p className="text-xs text-red-400 text-center">{error}</p>}
              <button onClick={submitPin} disabled={loading || pin.join('').length !== 6 || confirmPin.join('').length !== 6}
                className="w-full py-3.5 rounded-xl font-semibold text-sm bg-brand-500 text-surface-900 hover:bg-brand-400 transition-all disabled:opacity-40 active:scale-[0.98]">
                {loading ? 'Setting...' : 'Set PIN'}
              </button>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-bold">PIN {isChange ? 'Updated' : 'Created'}!</h3>
              <p className="text-sm text-surface-400">Your 6-digit payment PIN is now active.</p>
              <button onClick={handleClose} className="w-full py-3.5 rounded-xl font-semibold text-sm bg-brand-500 text-surface-900 hover:bg-brand-400 transition-all active:scale-[0.98]">
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
