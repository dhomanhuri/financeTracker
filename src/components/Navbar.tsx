'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  WalletIcon, 
  Code2Icon, 
  EyeOffIcon,
  EyeIcon,
  SunIcon,
  MoonIcon,
  TagsIcon,
  LogOutIcon,
  CalculatorIcon,
  MessageCircleIcon,
  PiggyBankIcon,
  LayoutDashboardIcon,
  CreditCardIcon,
  MenuIcon,
  XIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePrivacy } from '@/context/PrivacyContext';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { isMasked, toggleMask } = usePrivacy();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard',  icon: LayoutDashboardIcon, href: '/' },
    { name: 'Budget',     icon: PiggyBankIcon,        href: '/budget' },
    { name: 'Categories', icon: TagsIcon,              href: '/categories' },
    { name: 'Accounts',   icon: CreditCardIcon,        href: '/accounts' },
    { name: 'Freedom',    icon: CalculatorIcon,        href: '/financial-freedom' },
    { name: 'API',        icon: Code2Icon,             href: '/settings' },
  ];

  return (
    <>
      {/* ─── Top Navbar ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 px-4 sm:px-6 py-3 glass border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group transition-all">
            <div className="p-2 bg-accent/10 rounded-xl group-hover:bg-accent/20 transition-all logo-glow">
              <WalletIcon className="text-accent" size={22} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-foreground font-bold text-lg tracking-tight group-hover:text-accent transition-colors">
                Illyas Finance
              </h1>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest hidden sm:block">
                Premium Tracker
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 bg-card-bg p-1 rounded-xl border border-border">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                  }`}
                >
                  <item.icon size={16} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button onClick={toggleMask} className={`p-2 rounded-lg transition-all ${isMasked ? 'text-muted-foreground hover:text-foreground hover:bg-accent/10' : 'bg-accent/10 text-accent hover:bg-accent/20'}`}>
              {isMasked ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
            <button onClick={toggleTheme} className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-lg transition-all">
              {theme === 'dark' ? <SunIcon size={20} /> : <MoonIcon size={20} />}
            </button>
            <a href="https://www.instagram.com/dhomanhuri/" target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex p-2 text-pink-500 hover:text-pink-400 hover:bg-pink-500/10 rounded-lg transition-all">
              <MessageCircleIcon size={20} />
            </a>

            {user ? (
              <>
                <button onClick={() => signOut()}
                  className="hidden sm:flex p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/20">
                  <LogOutIcon size={18} />
                </button>
                {/* Hamburger — mobile only */}
                <button onClick={() => setMobileMenuOpen(o => !o)}
                  className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-lg transition-all">
                  {mobileMenuOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
                </button>
              </>
            ) : (
              <Link href="/login" className="px-4 py-2 bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground rounded-xl text-sm font-bold transition-all border border-accent/20">
                Login
              </Link>
            )}
          </div>
        </div>

        {/* ─── Mobile dropdown menu ─────────────────────────────────── */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pb-2 border-t border-border pt-3">
            <div className="grid grid-cols-3 gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20'
                        : 'bg-card-bg text-muted-foreground hover:text-foreground hover:bg-accent/10 border border-border'
                    }`}
                  >
                    <item.icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile logout & actions */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">{user?.email?.split('@')[0]}</span>
              <div className="flex gap-2">
                <a href="https://www.instagram.com/dhomanhuri/" target="_blank" rel="noopener noreferrer"
                  className="p-2 text-pink-500 hover:bg-pink-500/10 rounded-lg transition-all">
                  <MessageCircleIcon size={18} />
                </a>
                <button onClick={() => signOut()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all text-xs font-bold border border-red-500/20">
                  <LogOutIcon size={14} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ─── Mobile Bottom Navigation Bar ───────────────────────────── */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border px-2 py-2 safe-bottom">
          <div className="flex items-center justify-around max-w-lg mx-auto">
            {navItems.slice(0, 5).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'text-accent'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className={`text-[9px] font-semibold uppercase tracking-wide ${isActive ? 'text-accent' : ''}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}
