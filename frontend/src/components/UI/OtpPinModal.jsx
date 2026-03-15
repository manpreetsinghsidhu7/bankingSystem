import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

export const OtpPinModal = ({ isOpen, onClose, onSubmit, title, subtitle, length = 4, placeholder = "•", submitLabel = "Confirm" }) => {
  const [digits, setDigits] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setDigits(Array(length).fill(''));
      setTimeout(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 150);
    }
  }, [isOpen, length]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return;

    const newValues = [...digits];
    newValues[index] = value;
    setDigits(newValues);

    if (value !== '' && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && digits[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length === length) {
      onSubmit(code);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', top: 0, left: 0 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-surface-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in border border-surface-200/50 dark:border-surface-700/50 p-8 mx-4">
        <button onClick={onClose} className="absolute top-5 right-5 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl">
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-8 pt-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-500/10 dark:bg-brand-500/15 flex items-center justify-center mb-4">
            <div className="w-6 h-6 rounded-full bg-brand-500 animate-pulse-slow"></div>
          </div>
          <h3 className="text-xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">{title}</h3>
          <div className="text-sm text-surface-500 dark:text-surface-400 mt-2">{subtitle}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center gap-2.5">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={el => inputRefs.current[idx] = el}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                placeholder={placeholder}
                className="w-12 h-14 text-center text-xl font-bold bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:bg-white dark:focus:bg-surface-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all duration-200 text-surface-900 dark:text-surface-100"
                style={{ fontSize: '20px' }}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={digits.join('').length !== length}
            className="w-full py-3.5 rounded-xl text-surface-900 font-bold text-sm bg-brand-500 hover:bg-brand-400 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-brand-500/25 active:scale-[0.98]"
          >
            {submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
};
