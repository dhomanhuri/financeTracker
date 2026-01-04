'use client';

import { useState, useEffect } from 'react';
import { NewTransaction, Category, Account } from '@/types';
import { PlusIcon, ChevronDownIcon, CreditCardIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface TransactionFormProps {
  onAdd: (transaction: NewTransaction) => Promise<void>;
  isLoading: boolean;
}

export default function TransactionForm({ onAdd, isLoading }: TransactionFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [formData, setFormData] = useState<NewTransaction>({
    title: '',
    amount: 0,
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    account_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [catRes, accRes] = await Promise.all([
      supabase.from('categories').select('*').order('name', { ascending: true }),
      supabase.from('accounts').select('*').order('name', { ascending: true })
    ]);

    if (catRes.data) {
      setCategories(catRes.data);
      const firstCat = catRes.data.find(c => c.type === formData.type);
      if (firstCat) setFormData(prev => ({ ...prev, category: firstCat.name }));
    }

    if (accRes.data) {
      setAccounts(accRes.data);
      if (accRes.data.length > 0) {
        setFormData(prev => ({ ...prev, account_id: accRes.data[0].id }));
      }
    }
  };

  // Reset category when type changes
  useEffect(() => {
    const firstCat = categories.find(c => c.type === formData.type);
    if (firstCat) {
      setFormData(prev => ({ ...prev, category: firstCat.name }));
    }
  }, [formData.type, categories]);

  const filteredCategories = categories.filter(c => c.type === formData.type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd(formData);
    setFormData({
      title: '',
      amount: 0,
      type: 'expense',
      category: categories.find(c => c.type === 'expense')?.name || '',
      date: new Date().toISOString().split('T')[0],
      account_id: accounts[0]?.id || '',
    });
  };

  return (
    <div className="glass-card p-8 rounded-[2rem] sticky top-24">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-6 bg-accent rounded-full"></div>
        <h2 className="text-xl font-bold text-white tracking-tight">New Transaction</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Transaction Title</label>
          <input
            type="text"
            required
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="What did you spend on?"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Amount (Rp)</label>
            <input
              type="number"
              required
              min="0"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all tabular-nums"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Date</label>
            <input
              type="date"
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all [color-scheme:dark]"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Type</label>
            <div className="relative">
              <select
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all appearance-none cursor-pointer"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
              >
                <option value="expense" className="bg-slate-900">Expense</option>
                <option value="income" className="bg-slate-900">Income</option>
              </select>
              <ChevronDownIcon className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Account</label>
            <div className="relative">
              <select
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all appearance-none cursor-pointer"
                value={formData.account_id}
                onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
              >
                <option value="" disabled className="bg-slate-900">Select</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id} className="bg-slate-900">
                    {acc.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Category</label>
          <div className="relative">
            <select
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all appearance-none cursor-pointer"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.name} className="bg-slate-900">
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-xl shadow-accent/20 active:scale-[0.98]"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-accent-foreground/30 border-t-accent-foreground"></div>
          ) : (
            <>
              <PlusIcon size={20} />
              <span>Create Transaction</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
