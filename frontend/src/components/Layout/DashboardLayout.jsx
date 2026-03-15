import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Send, User, LogOut, Wallet, X, Sun, Moon,
  Headset, Landmark, CreditCard, ArrowLeftRight,
  Building, Clock, ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Settings from '../../pages/Settings';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Profile dropdown (small popover under avatar)
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // Profile settings full modal
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const dropdownRef = useRef(null);
  const isAdmin = user?.role === 'ADMIN';

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close everything on route change
  useEffect(() => {
    setDropdownOpen(false);
    setProfileModalOpen(false);
  }, [location.pathname]);

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

  const mobileNavItems = isAdmin
    ? navigation
    : [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Payments', href: '/payments', icon: Send },
        { name: 'ATM', href: '/atm', icon: Landmark },
        { name: 'Account', href: '/create-account', icon: Wallet },
        { name: 'Contact', href: '/contact', icon: Headset },
      ];

  const openProfile = () => {
    setDropdownOpen(false);
    setProfileModalOpen(true);
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col font-sans transition-colors duration-300">

      {/* ─── Top Navigation Bar ─── */}
      <header className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200/50 dark:border-surface-800/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">

            {/* Left: Logo & Brand */}
            <a href={isAdmin ? '/admin/accounts' : '/dashboard'} className="flex items-center space-x-2.5 shrink-0">
              <div className="h-8 w-8 bg-surface-100 dark:bg-surface-800 rounded-xl flex items-center justify-center border border-surface-200 dark:border-surface-700/50">
                <img src="/images/VAYU.png" alt="VAYU Logo" className="w-5 h-5 rounded-full" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-surface-900 dark:text-surface-100 tracking-tight">VAYU BANK</span>
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
            <div className="hidden md:flex items-center space-x-2 shrink-0">
              {/* Theme toggle */}
              <button onClick={toggleTheme}
                className="p-2 rounded-xl text-surface-400 dark:text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-700 dark:hover:text-surface-300 transition-all"
                title="Toggle theme">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Profile dropdown trigger */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-all group"
                >
                  <div className="h-7 w-7 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-bold border border-brand-500/20 group-hover:border-brand-500/40 transition-all">
                    {initials}
                  </div>
                  <span className="text-sm font-semibold text-surface-800 dark:text-surface-200 leading-none">
                    {user?.first_name}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-surface-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown popover */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-surface-200/70 dark:border-surface-700/50 overflow-hidden z-50 animate-scale-in origin-top-right">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-800">
                      <p className="text-xs font-bold text-surface-900 dark:text-surface-100 truncate">{user?.first_name} {user?.last_name}</p>
                      <p className="text-[10px] text-surface-400 truncate mt-0.5">{user?.email}</p>
                    </div>
                    {/* Options */}
                    <div className="p-1.5 space-y-0.5">
                      <button
                        onClick={openProfile}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-left"
                      >
                        <User className="w-4 h-4 text-surface-400" />
                        Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Top Right: theme + profile dropdown */}
            <div className="flex md:hidden items-center space-x-1 shrink-0">
              <button onClick={toggleTheme}
                className="p-2 rounded-xl text-surface-400 dark:text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Mobile profile dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="h-8 w-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-bold border border-brand-500/20 hover:border-brand-500/40 transition-all"
                  aria-label="Profile"
                >
                  {initials}
                </button>

                {/* Mobile dropdown popover */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-surface-200/70 dark:border-surface-700/50 overflow-hidden z-50 animate-scale-in origin-top-right">
                    <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-800">
                      <p className="text-xs font-bold text-surface-900 dark:text-surface-100 truncate">{user?.first_name} {user?.last_name}</p>
                      <p className="text-[10px] text-surface-400 truncate mt-0.5">{user?.email}</p>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      <button
                        onClick={openProfile}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-left"
                      >
                        <User className="w-4 h-4 text-surface-400" />
                        Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 w-full h-full pb-24 md:pb-8">
        <div className="page-enter">
          {children}
        </div>
      </main>

      {/* ─── Mobile Bottom Navigation ─── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <div className="bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl border-t border-surface-200/60 dark:border-surface-800/60 shadow-2xl">
          <div className="flex items-center justify-around px-2 py-1 safe-area-inset-bottom">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex flex-col items-center justify-center flex-1 py-2 px-1 group min-w-0 relative"
                >
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-brand-500" />
                  )}
                  <div className={`flex items-center justify-center w-10 h-8 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400'
                      : 'text-surface-400 dark:text-surface-500 group-hover:bg-surface-100 dark:group-hover:bg-surface-800 group-hover:text-surface-700 dark:group-hover:text-surface-300'
                  }`}>
                    <Icon className="w-5 h-5 transition-all duration-200" />
                  </div>
                  <span className={`text-[10px] font-semibold mt-0.5 truncate max-w-full transition-colors duration-200 ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'text-surface-400 dark:text-surface-500'
                  }`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ─── Profile Settings Full Modal — screen centered ─── */}
      {profileModalOpen && (
        <div
          className="fixed inset-0 z-[100] animate-fade-in"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', top: 0, left: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setProfileModalOpen(false)} />
          <div
            className="relative bg-white dark:bg-surface-900 rounded-3xl shadow-2xl w-full max-w-5xl animate-scale-in border border-surface-200/50 dark:border-surface-800/50 flex flex-col mx-4"
            style={{ maxHeight: '90dvh', overflowY: 'auto' }}
          >
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
