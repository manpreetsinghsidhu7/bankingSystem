import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  ArrowRight, Shield, Zap, Globe, CreditCard, Send, BarChart3,
  Lock, Smartphone, Users, CheckCircle, ChevronRight, Sun, Moon,
  Banknote, TrendingUp, Eye, Clock, Fingerprint, Building2,
  ArrowUpRight, Menu, X, Landmark, Coins, Star, Wallet,
} from 'lucide-react';

const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [mobileNav, setMobileNav] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile nav open
  useEffect(() => {
    document.body.style.overflow = mobileNav ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileNav]);

  const features = [
    { icon: Send, title: 'Instant Transfers', desc: 'Send money to any VAYU account instantly with zero fees. Real-time settlement, every time.', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: Shield, title: 'Bank-Grade Security', desc: 'AES-256 encryption, 6-digit PIN protection, and OTP verification for every sensitive operation.', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: Landmark, title: 'ATM Access', desc: 'Deposit or withdraw cash at any VAYU ATM. PIN-verified transactions with instant balance updates.', color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Monitor monthly inflows and outflows. Instant visibility into your complete financial health.', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { icon: Eye, title: 'Privacy-First Design', desc: 'Balance is hidden by default and unlocked only via PIN. Your data, your control.', color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { icon: Fingerprint, title: 'OTP Authentication', desc: 'Login with OTP, reset passwords securely, and verify identity — all without third-party apps.', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  ];

  const services = [
    { icon: Building2, title: 'Account Opening', desc: 'Open a verified savings account in minutes. Admin-approved for complete security and KYC compliance.' },
    { icon: Banknote, title: 'Deposits & Withdrawals', desc: 'Fund your account and withdraw seamlessly via ATM. All transactions logged in real-time.' },
    { icon: Send, title: 'Peer-to-Peer Transfers', desc: 'Transfer to any VAYU account holder using their account number. Zero fees, instant settlement.' },
    { icon: Landmark, title: 'ATM Services', desc: 'Deposit and withdraw cash at VAYU ATMs using your 6-digit PIN. Supports multiple linked accounts.' },
    { icon: Lock, title: 'Secure PIN Management', desc: 'Create, change, or reset your 6-digit payment PIN at any time from your dashboard.' },
    { icon: TrendingUp, title: 'Financial Dashboard', desc: 'View your portfolio, track monthly cash flows, and manage multiple accounts from one place.' },
  ];

  const stats = [
    { value: '₹0', label: 'Transfer Fees', sub: 'Always free' },
    { value: '< 1s', label: 'Settlement Time', sub: 'Instant processing' },
    { value: '256-bit', label: 'Encryption', sub: 'Bank grade' },
    { value: '24/7', label: 'Availability', sub: 'Always on' },
  ];

  const steps = [
    { step: '01', title: 'Create Your Portal Account', desc: 'Register with your email or phone number and set a secure password.' },
    { step: '02', title: 'Complete KYC Verification', desc: 'Submit your Aadhaar, PAN, and personal details for identity verification.' },
    { step: '03', title: 'Get Admin Approval', desc: 'Your application is reviewed and approved by VAYU administrators.' },
    { step: '04', title: 'Start Banking', desc: 'Set your payment PIN and begin transfers, ATM access, tracking finances, and more.' },
  ];

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#services', label: 'Services' },
    { href: '#how-it-works', label: 'How It Works' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-surface-950 text-surface-900 dark:text-surface-100 font-sans transition-colors duration-300 overflow-x-hidden">

      {/* ═══════════ NAVBAR ═══════════ */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-surface-950/80 backdrop-blur-xl border-b border-surface-200/50 dark:border-surface-800/50 shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2.5">
              <div className="h-9 w-9 bg-surface-100 dark:bg-surface-800 rounded-xl flex items-center justify-center border border-surface-200 dark:border-surface-700/50">
                <img src="/images/VAYU.png" alt="VAYU" className="w-6 h-6 rounded-full" />
              </div>
              <span className="text-lg font-bold tracking-tight">VAYU BANK</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map(({ href, label }) => (
                <a key={href} href={href} className="text-sm font-medium text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 transition-colors">{label}</a>
              ))}
            </nav>

            <div className="hidden md:flex items-center space-x-3">
              <button onClick={toggleTheme} className="p-2 rounded-xl text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <Link to="/login" className="text-sm font-medium text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100 transition-colors px-4 py-2">
                Sign In
              </Link>
              <Link to="/register" className="text-sm font-semibold bg-brand-500 text-surface-900 px-5 py-2.5 rounded-xl hover:bg-brand-400 transition-all shadow-lg shadow-brand-500/25 active:scale-[0.98]">
                Get Started
              </Link>
            </div>

            {/* Mobile: theme + hamburger */}
            <div className="flex md:hidden items-center space-x-1">
              <button onClick={toggleTheme} className="p-2 rounded-xl text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={() => setMobileNav(true)}
                className="p-2 rounded-xl text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
                aria-label="Open menu">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Sidebar Nav ── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden transition-opacity duration-300 ${mobileNav ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileNav(false)}
        aria-hidden="true"
      />
      {/* Drawer */}
      <div className={`fixed top-0 right-0 bottom-0 z-[70] w-72 max-w-[85vw] bg-white dark:bg-surface-900 shadow-2xl border-l border-surface-200/50 dark:border-surface-800/50 flex flex-col md:hidden transition-transform duration-300 ease-out ${mobileNav ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100 dark:border-surface-800">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-surface-100 dark:bg-surface-800 rounded-xl flex items-center justify-center border border-surface-200 dark:border-surface-700/50">
              <img src="/images/VAYU.png" alt="VAYU" className="w-5 h-5 rounded-full" />
            </div>
            <span className="text-sm font-bold text-surface-900 dark:text-surface-100">VAYU BANK</span>
          </div>
          <button onClick={() => setMobileNav(false)}
            className="p-2 rounded-xl text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
            aria-label="Close menu">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-surface-400 px-3 mb-4">Menu</p>
          {navLinks.map(({ href, label }) => (
            <a key={href} href={href} onClick={() => setMobileNav(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100 transition-all">
              {label}
            </a>
          ))}
        </nav>

        {/* CTA buttons */}
        <div className="px-4 py-5 border-t border-surface-100 dark:border-surface-800 space-y-3">
          <Link to="/login" onClick={() => setMobileNav(false)}
            className="flex items-center justify-center w-full px-5 py-3 rounded-2xl text-sm font-semibold border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all">
            Sign In
          </Link>
          <Link to="/register" onClick={() => setMobileNav(false)}
            className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-2xl text-sm font-bold bg-brand-500 text-surface-900 hover:bg-brand-400 shadow-lg shadow-brand-500/25 transition-all active:scale-[0.98]">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative pt-28 pb-20 lg:pt-44 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-500/8 dark:bg-brand-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/3 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-5 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left copy */}
            <div className="max-w-xl animate-slide-up">
              <div className="inline-flex items-center space-x-2 bg-brand-500/10 dark:bg-brand-500/5 text-brand-600 dark:text-brand-400 px-4 py-2 rounded-full text-xs font-semibold mb-8 border border-brand-500/20">
                <Zap className="w-3.5 h-3.5" />
                <span>Next-Generation Digital Banking</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Your wealth,{' '}
                <span className="text-gradient">reimagined.</span>
              </h1>

              <p className="text-lg text-surface-500 dark:text-surface-400 leading-relaxed mb-10 max-w-lg">
                VAYU Bank delivers instant transfers, ATM access, real-time analytics, and bank-grade security — all wrapped in an interface designed for the modern Indian.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link to="/register" className="inline-flex items-center bg-brand-500 text-surface-900 px-8 py-4 rounded-2xl font-bold text-sm hover:bg-brand-400 transition-all shadow-xl shadow-brand-500/30 active:scale-[0.98] group">
                  Open Free Account
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link to="/login" className="inline-flex items-center text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 transition-colors text-sm font-medium group px-2">
                  Already a member?
                  <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-10 pt-8 border-t border-surface-200/50 dark:border-surface-800/50">
                {[['RBI Compliant', Shield], ['256-bit Encrypted', Lock], ['24/7 Access', Globe], ['ATM Ready', Landmark]].map(([label, Icon]) => (
                  <div key={label} className="flex items-center space-x-1.5">
                    <Icon className="w-4 h-4 text-brand-500" />
                    <span className="text-[11px] font-medium text-surface-400">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right visual — Card stack (desktop only) */}
            <div className="hidden lg:block relative">
              <div className="relative w-full max-w-md ml-auto">
                {/* Main card */}
                <div className="relative bg-gradient-to-br from-surface-900 to-surface-950 rounded-3xl p-8 shadow-2xl shadow-surface-900/40 border border-surface-800/50 animate-float z-10">
                  <div className="absolute inset-0 rounded-3xl opacity-[0.04]" style={{ backgroundImage: `radial-gradient(circle at 70% 30%, rgba(251,191,36,0.5) 0%, transparent 50%)` }} />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-16">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-surface-800 rounded-xl flex items-center justify-center border border-surface-700/50">
                          <img src="/images/VAYU.png" alt="" className="w-6 h-6 rounded" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white tracking-wide">VAYU Bank</p>
                          <p className="text-[9px] text-surface-500 uppercase tracking-widest">Platinum</p>
                        </div>
                      </div>
                      <div className="w-12 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-md shadow-lg shadow-brand-500/30" />
                    </div>
                    <p className="text-surface-500 font-mono text-sm tracking-[0.3em] mb-8">4829  ••••  ••••  7163</p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] text-surface-600 uppercase tracking-widest mb-1">Cardholder</p>
                        <p className="text-sm font-semibold text-surface-200">VAYU MEMBER</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-surface-600 uppercase tracking-widest mb-1">Valid Thru</p>
                        <p className="text-sm font-semibold text-surface-200 font-mono">12/31</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating stat card */}
                <div className="absolute -bottom-6 -left-8 bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-xl border border-surface-200 dark:border-surface-700/50 animate-float-delayed z-20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-surface-400 uppercase tracking-wider font-medium">Monthly Growth</p>
                      <p className="text-lg font-bold text-surface-900 dark:text-surface-100">+₹12,450</p>
                    </div>
                  </div>
                </div>

                {/* ATM badge */}
                <div className="absolute -top-4 -right-4 w-14 h-14 bg-brand-500 rounded-2xl shadow-xl shadow-brand-500/30 flex items-center justify-center animate-float-fast z-20 rotate-12">
                  <Landmark className="w-6 h-6 text-surface-900" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ STATS BAR ═══════════ */}
      <section className="border-y border-surface-200/50 dark:border-surface-800/50 bg-surface-50/50 dark:bg-surface-900/30">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl lg:text-3xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">{s.value}</p>
                <p className="text-sm font-semibold text-surface-600 dark:text-surface-300 mt-1">{s.label}</p>
                <p className="text-[11px] text-surface-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="features" className="py-16 sm:py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="text-brand-500 font-semibold text-xs uppercase tracking-wider mb-3">Why VAYU?</p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">Built for the way you bank</h2>
            <p className="text-surface-500 dark:text-surface-400 leading-relaxed">Every feature is crafted to give you complete control over your finances with zero friction.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i} className="group bg-white dark:bg-surface-900 rounded-2xl p-6 sm:p-7 border border-surface-200 dark:border-surface-800 hover:border-surface-300 dark:hover:border-surface-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className={`w-11 h-11 ${f.bg} rounded-xl flex items-center justify-center mb-5`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-base font-bold text-surface-900 dark:text-surface-100 mb-2">{f.title}</h3>
                <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SERVICES ═══════════ */}
      <section id="services" className="py-16 sm:py-20 lg:py-28 bg-surface-50/50 dark:bg-surface-900/20 border-y border-surface-200/30 dark:border-surface-800/30">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-brand-500 font-semibold text-xs uppercase tracking-wider mb-3">Our Services</p>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">Everything you need,<br />nothing you don't.</h2>
              <p className="text-surface-500 dark:text-surface-400 leading-relaxed mb-8 max-w-md">VAYU provides a comprehensive suite of banking services — from account creation and ATM access to real-time transaction monitoring — all accessible from your browser.</p>
              <Link to="/register" className="inline-flex items-center bg-brand-500 text-surface-900 px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-brand-400 transition-all shadow-lg shadow-brand-500/25 active:scale-[0.98] group">
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="space-y-4">
              {services.map((s, i) => (
                <div key={i} className="bg-white dark:bg-surface-900 rounded-2xl p-5 sm:p-6 border border-surface-200 dark:border-surface-800 flex items-start space-x-4 group hover:border-brand-500/30 transition-all duration-200">
                  <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-brand-500/20 transition-colors">
                    <s.icon className="w-5 h-5 text-brand-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 mb-1">{s.title}</h3>
                    <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="how-it-works" className="py-16 sm:py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="text-brand-500 font-semibold text-xs uppercase tracking-wider mb-3">How It Works</p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">Start banking in 4 steps</h2>
            <p className="text-surface-500 dark:text-surface-400 leading-relaxed">From sign-up to your first ATM withdrawal or transfer — it only takes minutes.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, i) => (
              <div key={i} className="relative">
                <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 sm:p-7 border border-surface-200 dark:border-surface-800 h-full">
                  <span className="text-4xl font-bold text-surface-100 dark:text-surface-800 block mb-4">{s.step}</span>
                  <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 mb-2">{s.title}</h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 z-10 text-surface-300 dark:text-surface-700">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SECURITY SECTION ═══════════ */}
      <section className="py-16 sm:py-20 lg:py-28 bg-surface-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-5 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-brand-400 font-semibold text-xs uppercase tracking-wider mb-3">Security First</p>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">Your money is safe.<br />We guarantee it.</h2>
              <p className="text-surface-400 leading-relaxed mb-10 max-w-md">VAYU employs multiple layers of security — from encrypted storage to real-time fraud monitoring — so you can bank without worry.</p>

              <div className="space-y-5">
                {[
                  ['Passwords hashed with bcrypt (10 rounds)', 'Every password is cryptographically secured before storage.'],
                  ['6-digit Payment PIN for transactions', 'No transfer, ATM operation, or balance reveal happens without your PIN.'],
                  ['Account lockout after 5 failed attempts', 'Brute-force attacks are automatically blocked for 15 minutes.'],
                  ['OTP verification for sensitive actions', 'Password resets and logins can require one-time passcodes.'],
                ].map(([title, desc], i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-surface-200">{title}</p>
                      <p className="text-xs text-surface-500 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                <div className="w-64 h-64 rounded-full border-2 border-surface-800 flex items-center justify-center relative">
                  <div className="w-44 h-44 rounded-full border-2 border-surface-800 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-brand-500/10 flex items-center justify-center border border-brand-500/20 animate-pulse-slow">
                      <Shield className="w-10 h-10 text-brand-500" />
                    </div>
                  </div>
                  {[Lock, Fingerprint, Eye, Smartphone].map((Icon, i) => (
                    <div key={i}
                      className="absolute w-10 h-10 bg-surface-800 rounded-xl flex items-center justify-center border border-surface-700/50"
                      style={{ top: `${50 + 45 * Math.sin((i * Math.PI) / 2)}%`, left: `${50 + 45 * Math.cos((i * Math.PI) / 2)}%`, transform: 'translate(-50%, -50%)' }}>
                      <Icon className="w-4 h-4 text-surface-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-16 sm:py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="relative bg-gradient-to-br from-surface-900 to-surface-950 rounded-3xl p-10 sm:p-12 lg:p-20 text-center text-white overflow-hidden border border-surface-800/50">
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 50% 50%, rgba(251,191,36,0.4) 0%, transparent 60%)` }} />
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="w-16 h-16 mx-auto mb-8 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                <img src="/images/VAYU.png" alt="VAYU" className="w-10 h-10 rounded-xl" />
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4">Ready to get started?</h2>
              <p className="text-surface-400 leading-relaxed mb-10 text-base sm:text-lg">Join the VAYU ecosystem. Zero fees, instant transfers, ATM access, and a banking experience designed for you.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register" className="inline-flex items-center bg-brand-500 text-surface-900 px-8 py-4 rounded-2xl font-bold text-sm hover:bg-brand-400 transition-all shadow-xl shadow-brand-500/30 active:scale-[0.98] group">
                  Create Free Account
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link to="/login" className="inline-flex items-center text-surface-400 hover:text-surface-200 transition-colors text-sm font-medium px-4 py-4">
                  Sign in to existing account →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-surface-200/50 dark:border-surface-800/50 py-12">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
            <div className="sm:col-span-2">
              <div className="flex items-center space-x-2.5 mb-4">
                <div className="h-8 w-8 bg-surface-100 dark:bg-surface-800 rounded-lg flex items-center justify-center border border-surface-200 dark:border-surface-700/50">
                  <img src="/images/VAYU.png" alt="VAYU" className="w-5 h-5 rounded" />
                </div>
                <span className="text-base font-bold">VAYU Bank</span>
              </div>
              <p className="text-xs text-surface-400 leading-relaxed max-w-xs mb-4">
                Visionary Assets & Yield Universe. A next-generation digital banking experience with ATM access, instant transfers, and bank-grade security.
              </p>
              <p className="text-[10px] text-surface-400/60">This is a demonstration project and not an actual financial institution.</p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-surface-900 dark:text-surface-100 uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-2.5">
                {['Savings Account', 'Instant Transfers', 'ATM Services', 'Analytics Dashboard'].map(item => (
                  <li key={item}><a href="#features" className="text-sm text-surface-500 hover:text-surface-900 dark:hover:text-surface-100 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-surface-900 dark:text-surface-100 uppercase tracking-wider mb-4">Security</h4>
              <ul className="space-y-2.5">
                {['AES-256 Encryption', 'OTP Verification', 'PIN Protection', 'Account Lockout'].map(item => (
                  <li key={item}><span className="text-sm text-surface-500">{item}</span></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-surface-200/50 dark:border-surface-800/50 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-surface-400">© {new Date().getFullYear()} VAYU Bank. All rights reserved.</p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-xs text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors">Terms of Service</a>
              <a href="#" className="text-xs text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
