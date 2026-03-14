import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Contact = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillSubject = searchParams.get('subject') || '';
  const prefillBody = searchParams.get('body') || '';

  const [formData, setFormData] = useState({
    name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
    email: user?.email || '',
    subject: prefillSubject || '',
    message: prefillBody || ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputClass = "block w-full bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/50 rounded-xl px-4 py-3 text-sm text-surface-900 dark:text-surface-100 font-medium focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none";

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto mt-16 mb-24 animate-slide-up font-sans">
        <div className="bg-white dark:bg-surface-900 rounded-3xl p-10 border border-surface-200 dark:border-surface-800 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-3">Request Received</h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed max-w-sm mx-auto mb-8">
            Thank you, <strong className="text-surface-900 dark:text-surface-200">{formData.name}</strong>. Your request has been submitted successfully
            and will be reviewed by your designated Branch Manager and VAYU Bank officials.
            You will receive a confirmation via email within 2-3 business days.
          </p>
          <p className="text-xs text-surface-400 mb-8">
            Reference: <span className="font-mono text-brand-500">REQ-{Date.now().toString(36).toUpperCase()}</span>
          </p>
          <button onClick={() => navigate('/dashboard')}
            className="inline-flex items-center bg-brand-500 text-surface-900 px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-brand-400 transition-all shadow-lg shadow-brand-500/25 active:scale-[0.98]">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto font-sans w-full pb-12 animate-slide-up">
      <div className="mb-8">
        <p className="text-brand-500 font-semibold tracking-wider uppercase text-[11px] mb-1">Support</p>
        <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-100">Contact Manager</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Submit a request to your branch manager.</p>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-sm p-6 sm:p-8 border border-surface-200 dark:border-surface-800">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Full Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className={`${inputClass} opacity-60 cursor-not-allowed`} readOnly />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Email</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className={`${inputClass} opacity-60 cursor-not-allowed`} readOnly />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Subject</label>
            <input type="text" name="subject" required value={formData.subject} onChange={handleChange} className={inputClass} placeholder="What is your request about?" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Message</label>
            <textarea name="message" required rows={5} value={formData.message} onChange={handleChange} className={`${inputClass} resize-none`}
              placeholder="Describe your request in detail..." />
          </div>

          <button type="submit"
            className="w-full flex items-center justify-center py-4 rounded-xl text-sm font-bold text-surface-900 bg-brand-500 hover:bg-brand-400 transition-all shadow-lg shadow-brand-500/25 active:scale-[0.98] group">
            Submit Request <Send className="ml-2 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
