'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Account, NewAccount } from '@/types';
import Navbar from '@/components/Navbar';
import { 
  PlusIcon, 
  Trash2Icon, 
  ArrowLeftIcon, 
  WalletIcon, 
  Building2Icon, 
  SmartphoneIcon,
  CreditCardIcon,
  BanknoteIcon,
  SaveIcon
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const ICONS = [
  { name: 'Wallet', icon: WalletIcon },
  { name: 'Building2', icon: Building2Icon },
  { name: 'Smartphone', icon: SmartphoneIcon },
  { name: 'CreditCard', icon: CreditCardIcon },
  { name: 'Banknote', icon: BanknoteIcon },
];

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#64748b', // slate
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<NewAccount>({
    name: '',
    balance: 0,
    color: COLORS[0],
    icon: ICONS[0].name
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchAccounts();
    }
  }, [user]);

  const fetchAccounts = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      if (data) setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setActionLoading(true);
      const { data, error } = await supabase
        .from('accounts')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setAccounts([...accounts, data]);
        setFormData({
          name: '',
          balance: 0,
          color: COLORS[0],
          icon: ICONS[0].name
        });
      }
    } catch (error: any) {
      console.error('Error adding account:', error);
      alert(error.code === '23505' ? 'Account already exists!' : 'Failed to add account.');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteAccount = async (id: string) => {
    if (!confirm('Delete this account? All connected transactions will lose their account reference.')) return;

    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAccounts(accounts.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account.');
    } finally {
      setActionLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    const iconObj = ICONS.find(i => i.name === iconName);
    const IconComponent = iconObj ? iconObj.icon : WalletIcon;
    return <IconComponent size={20} />;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-300 selection:bg-accent/30 selection:text-accent">
      <Navbar />
      
      <main className="py-24 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-12">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-accent transition-colors mb-6 group"
            >
              <ArrowLeftIcon size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
                  Accounts <span className="text-accent">Management</span>
                </h1>
                <p className="text-gray-500 text-lg max-w-2xl">
                  Organize your financial sources and track balances across all your accounts in one place.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Form Section */}
            <div className="lg:col-span-4">
              <div className="glass-card p-8 rounded-[2rem] sticky top-28">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1.5 h-6 bg-accent rounded-full"></div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Add New Account</h2>
                </div>

                <form onSubmit={addAccount} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">
                      Account Name
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
                      placeholder="e.g. Bank Central, Main Wallet"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">
                      Initial Balance
                    </label>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</div>
                      <input
                        type="number"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all tabular-nums"
                        placeholder="0"
                        value={formData.balance}
                        onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">
                      Theme Color
                    </label>
                    <div className="flex flex-wrap gap-3 p-2">
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-10 h-10 rounded-full border-4 transition-all duration-300 ${
                            formData.color === color 
                              ? 'border-white scale-110 shadow-lg' 
                              : 'border-transparent hover:scale-110'
                          }`}
                          style={{ backgroundColor: color, boxShadow: formData.color === color ? `0 0 20px ${color}40` : 'none' }}
                          onClick={() => setFormData({ ...formData, color })}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">
                      Account Icon
                    </label>
                    <div className="grid grid-cols-5 gap-3">
                      {ICONS.map((item) => (
                        <button
                          key={item.name}
                          type="button"
                          className={`aspect-square rounded-2xl border transition-all duration-300 flex items-center justify-center ${
                            formData.icon === item.name 
                              ? 'bg-accent border-accent text-slate-950 shadow-lg shadow-accent/20 scale-105' 
                              : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:bg-white/10'
                          }`}
                          onClick={() => setFormData({ ...formData, icon: item.name })}
                        >
                          <item.icon size={20} strokeWidth={2.5} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading || !formData.name}
                    className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold py-5 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-accent/20 active:scale-[0.98]"
                  >
                    {actionLoading ? (
                      <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <SaveIcon size={20} />
                        Create Account
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* List Section */}
            <div className="lg:col-span-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-accent/50 rounded-full"></div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Active Accounts</h2>
                  </div>
                  <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-gray-400">
                    {accounts.length} {accounts.length === 1 ? 'Account' : 'Accounts'}
                  </span>
                </div>
                
                {loading ? (
                  <div className="glass-card p-20 rounded-[2.5rem] flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium">Loading your accounts...</p>
                  </div>
                ) : accounts.length === 0 ? (
                  <div className="glass-card p-20 rounded-[2.5rem] text-center border-dashed">
                    <div className="inline-flex p-6 bg-white/5 rounded-full mb-6 text-gray-600">
                      <WalletIcon size={48} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">No Accounts Yet</h3>
                    <p className="text-gray-500 max-w-sm mx-auto text-lg">
                      Start by adding your first account like a bank account, digital wallet, or physical cash.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {accounts.map((account) => (
                      <div 
                        key={account.id}
                        className="group relative glass-card p-6 rounded-[2rem] hover:bg-white/10 transition-all duration-500 hover:-translate-y-1"
                      >
                        <div className="flex items-start justify-between mb-6">
                          <div 
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-transform duration-500 group-hover:scale-110"
                            style={{ 
                              backgroundColor: account.color,
                              boxShadow: `0 10px 25px -5px ${account.color}60`
                            }}
                          >
                            <div className="scale-110">
                              {getIcon(account.icon)}
                            </div>
                          </div>
                          <button
                            onClick={() => deleteAccount(account.id)}
                            className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                            title="Delete Account"
                          >
                            <Trash2Icon size={20} />
                          </button>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
                            {account.name}
                          </h3>
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-medium text-gray-500">Rp</span>
                            <span className="text-3xl font-bold text-white tracking-tight tabular-nums">
                              {account.balance.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>

                        {/* Decorative background element */}
                        <div 
                          className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"
                          style={{ backgroundColor: account.color }}
                        ></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
