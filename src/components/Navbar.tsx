'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  WalletIcon, 
  LayoutDashboardIcon, 
  ArrowRightLeftIcon, 
  CreditCardIcon, 
  CalendarIcon, 
  BarChart3Icon, 
  Code2Icon, 
  SettingsIcon,
  EyeOffIcon,
  EyeIcon,
  SunIcon,
  MoonIcon,
  TagsIcon,
  LogOutIcon,
  UserIcon,
  CalculatorIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePrivacy } from '@/context/PrivacyContext';
import { useTheme } from '@/context/ThemeContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { isMasked, toggleMask } = usePrivacy();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboardIcon, href: '/' },
    { name: 'Categories', icon: TagsIcon, href: '/categories' },
    { name: 'Accounts', icon: CreditCardIcon, href: '/accounts' },
    { name: 'Freedom', icon: CalculatorIcon, href: '/financial-freedom' },
    { name: 'API', icon: Code2Icon, href: '/settings' },
  ];

  const displayedNavItems = user ? navItems : navItems.filter(item => item.href === '/financial-freedom');

  return (
    <nav className="sticky top-0 z-50 px-6 py-3 glass border-b border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group transition-all">
          <div className="p-2 bg-accent/10 rounded-xl group-hover:bg-accent/20 transition-all logo-glow">
            <WalletIcon className="text-accent" size={22} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-foreground font-bold text-lg tracking-tight group-hover:text-accent transition-colors">
              Illyas Finance
            </h1>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Premium Tracker</span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
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

          <div className="flex items-center gap-3">
            <button 
              onClick={toggleMask}
              className={`p-2 rounded-lg transition-all ${
                isMasked 
                  ? 'text-muted-foreground hover:text-foreground hover:bg-accent/10' 
                  : 'bg-accent/10 text-accent hover:bg-accent/20'
              }`}
              title={isMasked ? "Show all amounts" : "Hide all amounts"}
            >
              {isMasked ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>

            <button 
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-lg transition-all"
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === 'dark' ? <SunIcon size={20} /> : <MoonIcon size={20} />}
            </button>
            
            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-border">
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-xs text-foreground font-semibold truncate max-w-[120px]">{user.email?.split('@')[0]}</span>
                </div>
                <button 
                  onClick={() => signOut()}
                  className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"
                  title="Logout"
                >
                  <LogOutIcon size={18} />
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="ml-2 px-4 py-2 bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground rounded-xl text-sm font-bold transition-all border border-accent/20"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
