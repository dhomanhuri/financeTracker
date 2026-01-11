'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Account, NewAccount, Stock, NewStock } from '@/types';
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
  SaveIcon,
  TrendingUpIcon,
  RefreshCwIcon,
  TrendingDownIcon
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import MaskedAmount from '@/components/MaskedAmount';

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
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stockPrices, setStockPrices] = useState<Record<string, number>>({});
  
  const [loading, setLoading] = useState(true);
  const [stockLoading, setStockLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'accounts' | 'stocks'>('accounts');

  const [formData, setFormData] = useState<NewAccount>({
    name: '',
    balance: 0,
    color: COLORS[0],
    icon: ICONS[0].name
  });

  const [stockFormData, setStockFormData] = useState<NewStock>({
    symbol: '',
    lots: 0,
    buy_price: 0
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.id) {
      fetchAccounts();
      fetchStocks();
    }
  }, [user?.id]);

  // Fetch stock prices whenever stocks change
  useEffect(() => {
    if (stocks.length > 0) {
      fetchStockPrices(stocks);
    }
  }, [stocks]);

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

  const fetchStocks = async () => {
    if (!user) return;
    try {
      setStockLoading(true);
      const { data, error } = await supabase
        .from('stocks')
        .select('*')
        .order('symbol', { ascending: true });

      if (error) throw error;
      if (data) setStocks(data);
    } catch (error) {
      console.error('Error fetching stocks:', error);
    } finally {
      setStockLoading(false);
    }
  };

  const fetchStockPrices = async (stocksToFetch: Stock[]) => {
    const prices: Record<string, number> = {};
    // Fetch prices in parallel
    await Promise.all(stocksToFetch.map(async (stock) => {
      try {
        const res = await fetch(`https://workflows.dhomanhuri.id/webhook/b0150610-6466-462c-a345-d901a8b905b9?emiten=${stock.symbol}`);
        const data = await res.json();
        // data is { "nilai": "3680" }
        if (data && data.nilai) {
          prices[stock.symbol] = Number(data.nilai);
        }
      } catch (e) {
        console.error(`Failed to fetch price for ${stock.symbol}`, e);
      }
    }));
    setStockPrices(prev => ({ ...prev, ...prices }));
  };

  const addAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setActionLoading(true);
      const { data, error } = await supabase
        .from('accounts')
        .insert([{ ...formData, user_id: user?.id }])
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

  const addStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockFormData.symbol.trim()) return;

    try {
      setActionLoading(true);
      const { data, error } = await supabase
        .from('stocks')
        .insert([{ 
          ...stockFormData, 
          symbol: stockFormData.symbol.toUpperCase(),
          user_id: user?.id 
        }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setStocks([...stocks, data]);
        setStockFormData({
          symbol: '',
          lots: 0,
          buy_price: 0
        });
        // Fetch price for the new stock
        fetchStockPrices([data]);
      }
    } catch (error: any) {
      console.error('Error adding stock:', error);
      alert('Failed to add stock. Symbol might already exist.');
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

  const deleteStock = async (id: string) => {
    if (!confirm('Delete this stock from your portfolio?')) return;

    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('stocks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setStocks(stocks.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Error deleting stock:', error);
      alert('Failed to delete stock.');
    } finally {
      setActionLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    const iconObj = ICONS.find(i => i.name === iconName);
    const IconComponent = iconObj ? iconObj.icon : WalletIcon;
    return <IconComponent size={20} />;
  };

  if (authLoading || (loading && stockLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/30 selection:text-accent transition-colors duration-300">
      <Navbar />
      
      <main className="py-24 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-12">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-accent transition-colors mb-6 group"
            >
              <ArrowLeftIcon size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-3">
                  Accounts & <span className="text-accent">Portfolio</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                  Manage your cash accounts and stock investments in one place.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Form Section */}
            <div className="lg:col-span-4">
              <div className="glass-card p-8 rounded-[2rem] sticky top-28">
                {/* Tabs */}
                <div className="flex p-1 bg-card-bg rounded-xl mb-8 border border-border">
                  <button
                    onClick={() => setActiveTab('accounts')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                      activeTab === 'accounts'
                        ? 'bg-accent text-accent-foreground shadow-md'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <WalletIcon size={16} />
                    Account
                  </button>
                  <button
                    onClick={() => setActiveTab('stocks')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                      activeTab === 'stocks'
                        ? 'bg-accent text-accent-foreground shadow-md'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <TrendingUpIcon size={16} />
                    Stock
                  </button>
                </div>

                {activeTab === 'accounts' ? (
                  <>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-1.5 h-6 bg-accent rounded-full"></div>
                      <h2 className="text-xl font-bold text-foreground tracking-tight">Add New Account</h2>
                    </div>

                    <form onSubmit={addAccount} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
                          Account Name
                        </label>
                        <input
                          type="text"
                          className="w-full bg-card-bg border border-border rounded-2xl px-5 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
                          placeholder="e.g. Bank Central, Main Wallet"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
                          Initial Balance
                        </label>
                        <div className="relative">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">Rp</div>
                          <input
                            type="number"
                            className="w-full bg-card-bg border border-border rounded-2xl pl-12 pr-5 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all tabular-nums"
                            placeholder="0"
                            value={formData.balance}
                            onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
                          Theme Color
                        </label>
                        <div className="flex flex-wrap gap-3 p-2">
                          {COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              className={`w-10 h-10 rounded-full border-4 transition-all duration-300 ${
                                formData.color === color 
                                  ? 'border-foreground scale-110 shadow-lg' 
                                  : 'border-transparent hover:scale-110'
                              }`}
                              style={{ backgroundColor: color, boxShadow: formData.color === color ? `0 0 20px ${color}40` : 'none' }}
                              onClick={() => setFormData({ ...formData, color })}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
                          Account Icon
                        </label>
                        <div className="grid grid-cols-5 gap-3">
                          {ICONS.map((item) => (
                            <button
                              key={item.name}
                              type="button"
                              className={`aspect-square rounded-2xl border transition-all duration-300 flex items-center justify-center ${
                                formData.icon === item.name 
                                  ? 'bg-accent border-accent text-accent-foreground shadow-lg shadow-accent/20 scale-105' 
                                  : 'bg-card-bg border-border text-muted-foreground hover:text-foreground hover:bg-accent/10'
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
                        className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-accent-foreground font-bold py-5 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-accent/20 active:scale-[0.98]"
                      >
                        {actionLoading ? (
                          <div className="w-5 h-5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <SaveIcon size={20} />
                            Create Account
                          </>
                        )}
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-1.5 h-6 bg-accent rounded-full"></div>
                      <h2 className="text-xl font-bold text-foreground tracking-tight">Add Stock</h2>
                    </div>

                    <form onSubmit={addStock} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
                          Stock Symbol (Emiten)
                        </label>
                        <input
                          type="text"
                          className="w-full bg-card-bg border border-border rounded-2xl px-5 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all uppercase"
                          placeholder="e.g. BBRI, TLKM"
                          value={stockFormData.symbol}
                          onChange={(e) => setStockFormData({ ...stockFormData, symbol: e.target.value.toUpperCase() })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
                          Lots Owned
                        </label>
                        <input
                          type="number"
                          className="w-full bg-card-bg border border-border rounded-2xl px-5 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all tabular-nums"
                          placeholder="0"
                          value={stockFormData.lots || ''}
                          onChange={(e) => setStockFormData({ ...stockFormData, lots: Number(e.target.value) })}
                        />
                        <p className="text-xs text-muted-foreground ml-2">1 Lot = 100 Shares</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
                          Average Buy Price (Per Share)
                        </label>
                        <div className="relative">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">Rp</div>
                          <input
                            type="number"
                            className="w-full bg-card-bg border border-border rounded-2xl pl-12 pr-5 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all tabular-nums"
                            placeholder="0"
                            value={stockFormData.buy_price || ''}
                            onChange={(e) => setStockFormData({ ...stockFormData, buy_price: Number(e.target.value) })}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={actionLoading || !stockFormData.symbol}
                        className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-accent-foreground font-bold py-5 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-accent/20 active:scale-[0.98]"
                      >
                        {actionLoading ? (
                          <div className="w-5 h-5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <TrendingUpIcon size={20} />
                            Add Stock
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* List Section */}
            <div className="lg:col-span-8 space-y-10">
              
              {/* Active Accounts Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                    <h2 className="text-xl font-bold text-foreground tracking-tight">Active Accounts</h2>
                  </div>
                  <span className="px-4 py-1.5 bg-card-bg border border-border rounded-full text-xs font-medium text-muted-foreground">
                    {accounts.length} {accounts.length === 1 ? 'Account' : 'Accounts'}
                  </span>
                </div>
                
                {loading ? (
                  <div className="glass-card p-12 rounded-[2.5rem] flex flex-col items-center justify-center gap-4">
                    <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : accounts.length === 0 ? (
                  <div className="glass-card p-12 rounded-[2.5rem] text-center border-dashed">
                    <p className="text-muted-foreground font-medium">No accounts yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {accounts.map((account) => (
                      <div 
                        key={account.id}
                        className="group relative glass-card p-6 rounded-[2rem] hover:bg-accent/5 transition-all duration-500 hover:-translate-y-1"
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
                            className="p-3 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                            title="Delete Account"
                          >
                            <Trash2Icon size={20} />
                          </button>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                            {account.name}
                          </h3>
                          <div className="text-3xl font-bold text-foreground tracking-tight tabular-nums">
                            <MaskedAmount amount={account.balance} />
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

              {/* Stock Portfolio Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                    <h2 className="text-xl font-bold text-foreground tracking-tight">Stock Portfolio</h2>
                  </div>
                  <button 
                    onClick={() => fetchStockPrices(stocks)}
                    className="flex items-center gap-2 px-4 py-1.5 bg-card-bg border border-border rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
                  >
                    <RefreshCwIcon size={12} />
                    Refresh Prices
                  </button>
                </div>

                {stockLoading && stocks.length === 0 ? (
                  <div className="glass-card p-12 rounded-[2.5rem] flex flex-col items-center justify-center gap-4">
                    <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : stocks.length === 0 ? (
                  <div className="glass-card p-12 rounded-[2.5rem] text-center border-dashed">
                    <div className="inline-flex p-4 bg-accent/5 rounded-full mb-4 text-muted-foreground">
                      <TrendingUpIcon size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Empty Portfolio</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                      Add stocks to track your investment performance.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {stocks.map((stock) => {
                      const currentPrice = stockPrices[stock.symbol] || 0;
                      const buyValue = stock.lots * 100 * stock.buy_price;
                      const currentValue = currentPrice ? (stock.lots * 100 * currentPrice) : 0;
                      const gainLoss = currentValue - buyValue;
                      const gainLossPercent = buyValue > 0 ? (gainLoss / buyValue) * 100 : 0;
                      const isProfit = gainLoss >= 0;

                      return (
                        <div 
                          key={stock.id}
                          className="glass-card p-6 rounded-[2rem] hover:bg-accent/5 transition-all duration-500 group relative overflow-hidden"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                            
                            {/* Left: Symbol & Lots */}
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-xl shadow-inner border border-emerald-500/20">
                                {stock.symbol.substring(0, 2)}
                              </div>
                              <div>
                                <h3 className="text-2xl font-black text-foreground tracking-tight">{stock.symbol}</h3>
                                <p className="text-muted-foreground font-medium text-sm">
                                  {stock.lots} Lot ({stock.lots * 100} Shares)
                                </p>
                              </div>
                            </div>

                            {/* Middle: Prices */}
                            <div className="flex-1 grid grid-cols-2 gap-4 md:border-l md:border-r border-border md:px-8">
                              <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Buy Price</p>
                                <p className="text-sm font-semibold text-foreground">
                                  Rp {stock.buy_price.toLocaleString('id-ID')}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Current</p>
                                <p className={`text-sm font-semibold ${currentPrice ? 'text-foreground' : 'text-muted-foreground italic'}`}>
                                  {currentPrice ? `Rp ${currentPrice.toLocaleString('id-ID')}` : 'Loading...'}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Buy Value</p>
                                <p className="text-sm font-semibold text-foreground">
                                  <MaskedAmount amount={buyValue} />
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Current Value</p>
                                <p className="text-sm font-semibold text-foreground">
                                  {currentValue ? <MaskedAmount amount={currentValue} /> : '-'}
                                </p>
                              </div>
                            </div>

                            {/* Right: Gain/Loss */}
                            <div className="flex items-center justify-between md:justify-end gap-6 md:min-w-[140px]">
                              <div className="text-right">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Gain / Loss</p>
                                <div className={`text-lg font-bold flex items-center justify-end gap-1 ${
                                  !currentPrice ? 'text-muted-foreground' :
                                  isProfit ? 'text-emerald-500' : 'text-red-500'
                                }`}>
                                  {currentPrice ? (
                                    <>
                                      {isProfit ? <TrendingUpIcon size={16} /> : <TrendingDownIcon size={16} />}
                                      <span>{gainLossPercent.toFixed(2)}%</span>
                                    </>
                                  ) : '-'}
                                </div>
                                <p className={`text-xs font-medium ${
                                  !currentPrice ? 'text-muted-foreground' :
                                  isProfit ? 'text-emerald-500' : 'text-red-500'
                                }`}>
                                  {currentPrice ? (
                                    <>
                                      {isProfit ? '+' : ''}
                                      <MaskedAmount amount={gainLoss} />
                                    </>
                                  ) : 'Fetching data...'}
                                </p>
                              </div>
                              
                              <button
                                onClick={() => deleteStock(stock.id)}
                                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                title="Remove Stock"
                              >
                                <Trash2Icon size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
