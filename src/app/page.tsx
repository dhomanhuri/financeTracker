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

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
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
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      setLoading(true);
      
      // Check if credentials are placeholders
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || 
          !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        console.warn('Supabase credentials not configured');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*, accounts(name, color)')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase Error Details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      if (data) setTransactions(data);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      // If table doesn't exist, show a more helpful message
      if (error?.code === 'PGRST116' || error?.message?.includes('relation "transactions" does not exist')) {
        alert('Table "transactions" does not exist in Supabase. Please run the SQL in schema.sql via SQL Editor in Supabase Dashboard.');
      }
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (newTransaction: NewTransaction) => {
    try {
      setActionLoading(true);
      
      // 1. Insert transaction
      const { data, error } = await supabase
        .from('transactions')
        .insert([newTransaction])
        .select()
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
              <DashboardSummary transactions={transactions} />

              <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4">
                  <TransactionForm onAdd={addTransaction} isLoading={actionLoading} />
                </div>
                <div className="lg:col-span-8">
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
