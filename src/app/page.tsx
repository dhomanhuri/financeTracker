'use client';

import { useEffect, useState } from 'react';
// supabase removed
import { formatRupiah, toNumber } from '@/lib/format';
import { NewTransaction, Transaction, Stock } from '@/types';
import DashboardSummary from '@/components/DashboardSummary';
import CashFlowChart from '@/components/charts/CashFlowChart';
import ExpenseCategoryChart from '@/components/charts/ExpenseCategoryChart';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { CalendarIcon, FilterIcon, XIcon } from 'lucide-react';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [totalAccountBalance, setTotalAccountBalance] = useState(0);
  const [totalStockValue, setTotalStockValue] = useState(0);
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  const [periodSummary, setPeriodSummary] = useState<{
    total_income: number;
    total_expense: number;
    net_change: number;
  } | null>(null);

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.id) {
      fetchTransactions();
      fetchTotalStockValue();
    }
  }, [user?.id, dateRange]);

  const fetchTotalStockValue = async () => {
    if (!user) return;
    try {
      const stocks = await fetch('/api/v1/stocks').then(r => r.json());
      
      if (stocks && stocks.length > 0) {
         const stockPromises = stocks.map(async (stock: { symbol: string; lots: number }) => {
             try {
                 const res = await fetch(`https://workflows.dhomanhuri.id/webhook/1f45a32f-3113-4821-a2eb-551db0a6e804?emiten=${stock.symbol}`);
                 const data = await res.json();
                 if (data && data.nilai) {
                     const price = Number(data.nilai);
                     return stock.lots * 100 * price;
                 }
             } catch (e) {
                 console.error(`Failed to fetch price for ${stock.symbol}`, e);
             }
             return 0;
         });

         const values = await Promise.all(stockPromises);
         const totalValue = values.reduce((acc, curr) => acc + curr, 0);
         setTotalStockValue(totalValue);
      }
    } catch (error) {
      console.error('Error fetching stock values:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      setLoading(true);

      // Fetch total account balance
      const accountsData = await fetch('/api/v1/accounts').then(r => r.json());
      if (Array.isArray(accountsData)) {
        const total = accountsData.reduce((sum: number, acc: {balance: unknown}) => sum + Number(acc.balance), 0);
        setTotalAccountBalance(total);
      }

      // Fetch transactions
      const params: Record<string, string> = {};
      if (dateRange.from) params.from = dateRange.from;
      if (dateRange.to)   params.to   = dateRange.to;
      const qs = Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : '';
      const txResult = await fetch(`/api/v1/transactions${qs}`).then(r => r.json());

      let data: Transaction[] = [];
      if (dateRange.from || dateRange.to) {
        data = txResult.transactions || [];
        if (txResult.summary) setPeriodSummary(txResult.summary);
      } else {
        data = Array.isArray(txResult) ? txResult : [];
        setPeriodSummary(null);
      }
      setTransactions(data);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      if (error?.code === 'PGRST116' || error?.message?.includes('relation "transactions" does not exist')) {
        alert('Table "transactions" does not exist in Supabase. Please run the SQL scripts.');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setDateRange({ from: '', to: '' });
  };

  const addTransaction = async (newTransaction: NewTransaction) => {
    try {
      setActionLoading(true);
      const data = await fetch('/api/v1/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction),
      }).then(r => r.json());
      if (data.error) throw new Error(data.error);
      setTransactions([data, ...transactions]);
      // Refresh balance
      fetchTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Gagal menambahkan transaksi.');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!confirm('Yakin hapus transaksi ini?')) return;
    try {
      setActionLoading(true);
      await fetch(`/api/v1/transactions/${id}`, { method: 'DELETE' });
      setTransactions(transactions.filter(t => t.id !== id));
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Gagal menghapus transaksi.');
    } finally {
      setActionLoading(false);
    }
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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />
      
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
          ) : (
            <>
              <DashboardSummary 
                transactions={transactions} 
                totalAccountBalance={totalAccountBalance} 
                totalStockValue={totalStockValue}
              />

              {/* Charts Section */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                <CashFlowChart transactions={transactions} />
                <ExpenseCategoryChart transactions={transactions} />
              </div>

              <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4">
                  <TransactionForm onAdd={addTransaction} isLoading={actionLoading} />
                </div>
                <div className="lg:col-span-8 space-y-6">
                  {/* Period Filter UI */}
                  <div className="glass-card p-6 rounded-[2rem] animate-fade-in border-accent/10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/10 rounded-xl text-accent">
                          <FilterIcon size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Filter Period</h3>
                          <p className="text-[10px] text-muted-foreground font-medium">Show transactions within range</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                          <input
                            type="date"
                            className="bg-card-bg border border-border rounded-xl px-4 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent transition-all dark:[color-scheme:dark]"
                            value={dateRange.from}
                            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                          />
                        </div>
                        <span className="text-muted-foreground text-xs font-bold">TO</span>
                        <div className="relative">
                          <input
                            type="date"
                            className="bg-card-bg border border-border rounded-xl px-4 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent transition-all dark:[color-scheme:dark]"
                            value={dateRange.to}
                            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                          />
                        </div>
                        {(dateRange.from || dateRange.to) && (
                          <button
                            onClick={clearFilters}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-xl transition-all"
                            title="Clear Filters"
                          >
                            <XIcon size={18} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Period Summary Details */}
                    {periodSummary && (
                      <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-4 animate-fade-in">
                        <div className="text-center md:text-left">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">In Period</p>
                          <p className="text-sm font-bold text-green-500">
                            + {formatRupiah(periodSummary.total_income)}
                          </p>
                        </div>
                        <div className="text-center md:text-left">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Out Period</p>
                          <p className="text-sm font-bold text-red-500">
                            - {formatRupiah(periodSummary.total_expense)}
                          </p>
                        </div>
                        <div className="text-center md:text-left">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Net Change</p>
                          <p className={`text-sm font-bold ${periodSummary.net_change >= 0 ? 'text-accent' : 'text-orange-500'}`}>
                            {periodSummary.net_change >= 0 ? '+' : ''} {formatRupiah(Math.abs(periodSummary.net_change))}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <TransactionList
                    transactions={transactions}
                    onDelete={deleteTransaction}
                    isLoading={actionLoading}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
