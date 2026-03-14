import React from 'react';
import { ShieldCheck, Banknote, Coins, ArrowUpRight, Zap, CreditCard, Landmark } from 'lucide-react';

/**
 * AuthVisuals
 * - Mobile (< lg): compact horizontal banner on TOP of the auth form
 * - Desktop (lg+): full left-pane taking 50% width
 */
export const AuthVisuals = () => {
  return (
    <>
      {/* ── MOBILE TOP BANNER (hidden on lg+) ── */}
      <div className="lg:hidden w-full bg-surface-950 relative overflow-hidden text-white">
        {/* Background orbs */}
        <div className="absolute top-[-60%] right-[-10%] w-[300px] h-[300px] bg-brand-500/25 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-60%] left-[-5%] w-[200px] h-[200px] bg-brand-600/20 rounded-full blur-[80px] pointer-events-none" />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

        <div className="relative z-10 px-6 py-8 flex flex-col items-center text-center">
          {/* Logo + name */}
          <div className="flex items-center space-x-3 mb-5">
            <div className="h-11 w-11 bg-surface-800 rounded-2xl flex items-center justify-center border border-surface-700/50 shadow-lg shrink-0">
              <img src="/images/VAYU.png" alt="VAYU Logo" className="w-7 h-7 rounded-full" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold tracking-tight text-white">VAYU Bank</h1>
              <p className="text-[10px] text-surface-500 uppercase tracking-widest">Visionary Assets & Yield Universe</p>
            </div>
          </div>

          {/* Mini card visual */}
          <div className="relative w-full max-w-[260px] mx-auto mb-5">
            <div className="bg-gradient-to-br from-surface-800 to-surface-900 rounded-2xl px-6 py-5 border border-surface-700/30 shadow-xl relative overflow-hidden animate-float">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-500/5 to-transparent" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-9 h-6 bg-gradient-to-br from-brand-400 to-brand-600 rounded-md" />
                  <Zap className="w-5 h-5 text-brand-500/50" />
                </div>
                <p className="text-surface-400 font-mono text-[11px] tracking-[0.25em] mb-4">•••• •••• •••• 4829</p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[8px] text-surface-600 uppercase tracking-widest mb-0.5">Cardholder</p>
                    <p className="text-xs font-semibold text-surface-200">VAYU MEMBER</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] text-surface-600 uppercase tracking-widest mb-0.5">Expires</p>
                    <p className="text-xs font-semibold text-surface-200 font-mono">12/31</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating accent */}
            <div className="absolute -top-3 -right-3 w-10 h-10 bg-brand-500 rounded-xl shadow-lg shadow-brand-500/30 transform rotate-12 flex items-center justify-center animate-float-delayed">
              <Coins className="text-surface-900 w-5 h-5" />
            </div>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { icon: ShieldCheck, label: 'Bank-Grade Security' },
              { icon: Zap, label: 'Instant Transfers' },
              { icon: Landmark, label: 'ATM Access' },
              { icon: CreditCard, label: 'Virtual Card' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 bg-surface-800/80 border border-surface-700/50 rounded-full px-3 py-1.5 text-[11px] font-medium text-surface-300">
                <Icon className="w-3 h-3 text-brand-400" />
                {label}
              </div>
            ))}
          </div>

          <p className="text-[11px] text-surface-500 mt-5 leading-relaxed max-w-xs">
            Where <span className="text-brand-400 font-semibold">security</span> meets <span className="text-brand-400 font-semibold">elegance</span>. Your digital vault, reimagined.
          </p>
        </div>
      </div>

      {/* ── DESKTOP LEFT PANE (hidden below lg) ── */}
      <div className="hidden lg:flex w-1/2 bg-surface-950 relative flex-col justify-between p-12 overflow-hidden text-white shrink-0">
        {/* Gradient orbs */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-brand-600/15 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
        <div className="absolute top-[40%] left-[30%] w-[200px] h-[200px] bg-brand-400/10 rounded-full blur-[80px] pointer-events-none" />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="h-12 w-12 bg-surface-800 rounded-2xl flex items-center justify-center border border-surface-700/50 shadow-lg">
            <img src="/images/VAYU.png" alt="VAYU Logo" className="w-8 h-8 rounded-full" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">VAYU Bank</h1>
            <p className="text-surface-500 mt-0.5 font-medium tracking-wide text-[10px] uppercase">
              Visionary Assets & Yield Universe
            </p>
          </div>
        </div>

        {/* Center 3D Visuals */}
        <div className="relative z-10 flex-1 flex items-center justify-center my-10">
          <div className="relative w-full max-w-xs">
            {/* Main floating card */}
            <div className="relative bg-gradient-to-br from-surface-800 to-surface-900 rounded-3xl p-8 shadow-2xl border border-surface-700/30 animate-float">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-500/5 to-transparent" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-12">
                  <div className="w-12 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-md" />
                  <Zap className="w-6 h-6 text-brand-500/60" />
                </div>
                <p className="text-surface-400 font-mono text-xs tracking-[0.3em] mb-6">•••• •••• •••• 4829</p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] text-surface-600 uppercase tracking-widest mb-1">Cardholder</p>
                    <p className="text-sm font-semibold text-surface-200 tracking-wide">VAYU MEMBER</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-surface-600 uppercase tracking-widest mb-1">Expires</p>
                    <p className="text-sm font-semibold text-surface-200 font-mono">12/31</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating accent elements */}
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-brand-500 rounded-2xl shadow-xl shadow-brand-500/30 transform rotate-12 animate-float-delayed flex items-center justify-center">
              <Coins className="text-surface-900 w-7 h-7" />
            </div>
            <div className="absolute -bottom-4 -left-8 bg-surface-800 rounded-2xl shadow-lg border border-surface-700/50 p-3 animate-float-fast">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-[9px] text-surface-500 uppercase tracking-wider">Return</p>
                  <p className="text-sm font-bold text-green-400">+12.4%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Quote */}
        <div className="relative z-10">
          <p className="text-xl font-light leading-relaxed text-surface-300">
            Where <span className="text-brand-400 font-semibold">security</span> meets{' '}
            <span className="text-brand-400 font-semibold">elegance</span>.
            <br />Your digital vault, reimagined.
          </p>
          <div className="mt-6 flex items-center space-x-3">
            <div className="flex -space-x-2">
              {['S', 'A', 'R'].map(l => (
                <div key={l} className="w-7 h-7 rounded-full bg-surface-700 ring-2 ring-surface-950 flex items-center justify-center text-[10px] font-bold text-surface-300">{l}</div>
              ))}
            </div>
            <span className="text-xs font-medium text-surface-500">1,200+ active users</span>
          </div>
        </div>
      </div>
    </>
  );
};
