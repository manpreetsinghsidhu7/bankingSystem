import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Send, User, LogOut, Wallet, Menu, X, Sun, Moon,
  Headset, Landmark, ShieldCheck, CreditCard, ArrowLeftRight,
  Building, Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Settings from '../../pages/Settings';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // Lock body scroll when sidebar open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const navigation = isAdmin
    ? [
        { name: 'Accounts', href: '/admin/accounts', icon: CreditCard },
        { name: 'Requests', href: '/admin/requests', icon: Clock },
        { name: 'Transactions', href: '/admin/transactions', icon: ArrowLeftRight },
        { name: 'Bank', href: '/admin/bank', icon: Building },
      ]
    : [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Open Account', href: '/create-account', icon: Wallet },
        { name: 'Payments', href: '/payments', icon: Send },
        { name: 'ATM', href: '/atm', icon: Landmark },
        { name: 'Contact', href: '/contact', icon: Headset },
      ];

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col font-sans transition-colors duration-300">

      {/* ─── Top Navigation Bar ─── */}
      <header className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200/50 dark:border-surface-800/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Left: Logo & Brand */}
            <a href={isAdmin ? '/admin/accounts' : '/dashboard'} className="flex items-center space-x-2.5 shrink-0">
              <div className="h-9 w-9 bg-surface-100 dark:bg-surface-800 rounded-xl flex items-center justify-center border border-surface-200 dark:border-surface-700/50">
                <img src="/images/VAYU.png" alt="VAYU Logo" className="w-6 h-6 rounded-full" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-surface-900 dark:text-surface-100 tracking-tight">VAYU BANK</span>
                {isAdmin && (
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                    Admin
                  </span>
                )}
              </div>
            </a>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex flex-1 justify-center space-x-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                return (
                  <Link key={item.name} to={item.href}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                        : 'text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100'
                    }`}>
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Desktop actions */}
            <div className="hidden md:flex items-center space-x-3 shrink-0">
              <button onClick={toggleTheme}
                className="p-2 rounded-xl text-surface-400 dark:text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-700 dark:hover:text-surface-300 transition-all"
                title="Toggle theme">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <div className="flex items-center space-x-2.5 pl-3 cursor-pointer group" onClick={() => setProfileModalOpen(true)}>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-surface-900 dark:text-surface-100 leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {user?.first_name}
                  </span>
                </div>
                <div className="h-8 w-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-bold border border-brand-500/20 group-hover:border-brand-500/40 transition-all">
                  {initials}
                </div>
              </div>
              <button onClick={logout}
                className="text-surface-400 dark:text-surface-500 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-500/10"
                title="Sign out">
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile: theme toggle + hamburger */}
            <div className="flex md:hidden items-center space-x-1 shrink-0">
              <button onClick={toggleTheme}
                className="p-2 rounded-xl text-surface-400 dark:text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl text-surface-400 dark:text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
                aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Mobile Sidebar Overlay + Drawer ─── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div className={`fixed top-0 right-0 bottom-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-surface-900 shadow-2xl border-l border-surface-200/50 dark:border-surface-800/50 flex flex-col md:hidden transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100 dark:border-surface-800">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-surface-100 dark:bg-surface-800 rounded-xl flex items-center justify-center border border-surface-200 dark:border-surface-700/50">
              <img src="/images/VAYU.png" alt="VAYU" className="w-5 h-5 rounded-full" />
            </div>
            <div>
              <p className="text-sm font-bold text-surface-900 dark:text-surface-100">VAYU BANK</p>
              {isAdmin && <p className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">Admin</p>}
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-xl text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-700 dark:hover:text-surface-300 transition-all"
            aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User info strip */}
        <div
          className="flex items-center gap-3 px-5 py-4 border-b border-surface-100 dark:border-surface-800 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
          onClick={() => { setSidebarOpen(false); setProfileModalOpen(true); }}>
          <div className="h-10 w-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm font-bold border border-brand-500/20 shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">{user?.first_name} {user?.last_name}</p>
            <p className="text-[11px] text-brand-500 font-medium">Edit Profile →</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-surface-400 px-3 mb-3">Navigation</p>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            return (
              <Link key={item.name} to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${isActive
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/15'
                    : 'text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100'
                }`}>
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-500' : 'text-surface-400'}`} />
                {item.name}
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />}
              </Link>
            );
          })}
        </nav>

        {/* Drawer Footer */}
        <div className="px-4 py-4 border-t border-surface-100 dark:border-surface-800 space-y-1">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-medium text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all">
            {theme === 'dark' ? <Sun className="w-4 h-4 text-surface-400" /> : <Moon className="w-4 h-4 text-surface-400" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={() => { setSidebarOpen(false); logout(); }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-all">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 w-full h-full">
        <div className="page-enter">
          {children}
        </div>
      </main>

      {/* ─── Profile Modal ─── */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setProfileModalOpen(false)} />
          <div className="relative bg-white dark:bg-surface-900 rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] overflow-y-auto animate-scale-in border border-surface-200/50 dark:border-surface-800/50 flex flex-col">
            <div className="sticky top-0 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200/50 dark:border-surface-800/50 p-5 flex justify-between items-center z-10">
              <h2 className="text-lg font-bold tracking-tight text-surface-900 dark:text-surface-100">Profile Settings</h2>
              <button onClick={() => setProfileModalOpen(false)} className="bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 p-2 rounded-xl transition-colors">
                <X className="w-5 h-5 text-surface-500" />
              </button>
            </div>
            <div className="p-6">
              <Settings />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
