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
  SunIcon,
  TagsIcon,
  LogOutIcon,
  UserIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboardIcon, href: '/' },
    { name: 'Categories', icon: TagsIcon, href: '/categories' },
    { name: 'Accounts', icon: CreditCardIcon, href: '/accounts' },
    { name: 'API', icon: Code2Icon, href: '/settings' },
  ];

  return (
    <nav className="sticky top-0 z-50 px-6 py-3 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group transition-all">
          <div className="p-2 bg-accent/10 rounded-xl group-hover:bg-accent/20 transition-all logo-glow">
            <WalletIcon className="text-accent" size={22} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-white font-bold text-lg tracking-tight group-hover:text-accent transition-colors">
              Illyas Finance
            </h1>
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Premium Tracker</span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon size={16} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
              <SunIcon size={20} />
            </button>
            
            {user && (
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-xs text-white font-semibold truncate max-w-[120px]">{user.email?.split('@')[0]}</span>
                  <span className="text-[10px] text-accent font-medium">Pro Plan</span>
                </div>
                <button 
                  onClick={() => signOut()}
                  className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"
                  title="Logout"
                >
                  <LogOutIcon size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
