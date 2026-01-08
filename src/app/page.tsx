'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { NewTransaction, Transaction } from '@/types';
import DashboardSummary from '@/components/DashboardSummary';
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
    if (user) {
      fetchTransactions();
    }
  }, [user, dateRange]);

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      setLoading(true);
      
      // Fetch total account balance
      const { data: accountsData } = await supabase
        .from('accounts')
        .select('balance')
        .eq('user_id', user.id);
      
      if (accountsData) {
        const total = accountsData.reduce((sum, acc) => sum + acc.balance, 0);
        setTotalAccountBalance(total);
      }

      // Check if credentials are placeholders
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || 
          !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        console.warn('Supabase credentials not configured');
        setLoading(false);
        return;
      }

      let query = supabase
        .from('transactions')
        .select('*, accounts(name, color), categories(name)')
        .eq('user_id', user.id);

      if (dateRange.from) query = query.gte('date', dateRange.from);
      if (dateRange.to) query = query.lte('date', dateRange.to);

      const { data, error } = await query
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setTransactions(data);
        
        // Calculate period summary if filters are active
        if (dateRange.from || dateRange.to) {
          const summary = data.reduce((acc, tx) => {
            if (tx.type === 'income') acc.total_income += tx.amount;
            else acc.total_expense += tx.amount;
            return acc;
          }, { total_income: 0, total_expense: 0 });
          
          setPeriodSummary({
            ...summary,
            net_change: summary.total_income - summary.total_expense
          });
        } else {
          setPeriodSummary(null);
        }
      }
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
      
      // 1. Insert transaction
      const { data, error } = await supabase
        .from('transactions')
        .insert([newTransaction])
        .select('*, accounts(name, color), categories(name)')
        .single();

      if (error) throw error;

      // 2. Update account balance if account_id is provided
      if (newTransaction.account_id) {
        const adjustment = newTransaction.type === 'income' ? newTransaction.amount : -newTransaction.amount;
        
        // Fetch current balance
        const { data: account } = await supabase
          .from('accounts')
          .select('balance')
          .eq('id', newTransaction.account_id)
          .single();

        if (account) {
          await supabase
            .from('accounts')
            .update({ balance: account.balance + adjustment })
            .eq('id', newTransaction.account_id);
        }
      }

      if (data) {
        setTransactions([data, ...transactions]);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction. Please ensure Supabase connection is correct.');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    const transactionToDelete = transactions.find(t => t.id === id);
    if (!transactionToDelete || !confirm('Are you sure you want to delete this transaction?')) return;

    try {
      setActionLoading(true);

      // 1. Delete transaction
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 2. Revert account balance if account_id was provided
      if (transactionToDelete.account_id) {
        const adjustment = transactionToDelete.type === 'income' ? -transactionToDelete.amount : transactionToDelete.amount;
        
        // Fetch current balance
        const { data: account } = await supabase
          .from('accounts')
          .select('balance')
          .eq('id', transactionToDelete.account_id)
          .single();

        if (account) {
          await supabase
            .from('accounts')
            .update({ balance: account.balance + adjustment })
            .eq('id', transactionToDelete.account_id);
        }
      }

      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction.');
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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
          ) : (
            <>
              <DashboardSummary transactions={transactions} totalAccountBalance={totalAccountBalance} />

              <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
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
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Filter Period</h3>
                          <p className="text-[10px] text-gray-500 font-medium">Show transactions within range</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                          <input
                            type="date"
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-accent transition-all [color-scheme:dark]"
                            value={dateRange.from}
                            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                          />
                        </div>
                        <span className="text-gray-600 text-xs font-bold">TO</span>
                        <div className="relative">
                          <input
                            type="date"
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-accent transition-all [color-scheme:dark]"
                            value={dateRange.to}
                            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                          />
                        </div>
                        {(dateRange.from || dateRange.to) && (
                          <button
                            onClick={clearFilters}
                            className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                            title="Clear Filters"
                          >
                            <XIcon size={18} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Period Summary Details */}
                    {periodSummary && (
                      <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-3 gap-4 animate-fade-in">
                        <div className="text-center md:text-left">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">In Period</p>
                          <p className="text-sm font-bold text-green-400">
                            + Rp {periodSummary.total_income.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div className="text-center md:text-left">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Out Period</p>
                          <p className="text-sm font-bold text-red-400">
                            - Rp {periodSummary.total_expense.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div className="text-center md:text-left">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Net Change</p>
                          <p className={`text-sm font-bold ${periodSummary.net_change >= 0 ? 'text-accent' : 'text-orange-400'}`}>
                            {periodSummary.net_change >= 0 ? '+' : ''} Rp {periodSummary.net_change.toLocaleString('id-ID')}
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
