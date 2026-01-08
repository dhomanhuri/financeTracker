'use client';

import { useState, useEffect } from 'react';
import { NewTransaction, Category, Account } from '@/types';
import { PlusIcon, ChevronDownIcon, CreditCardIcon, CalendarIcon, TagsIcon, DollarSignIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
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
    category_id: '',
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
      if (firstCat) setFormData(prev => ({ ...prev, category_id: firstCat.id }));
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
      setFormData(prev => ({ ...prev, category_id: firstCat.id }));
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
      category_id: categories.find(c => c.type === 'expense')?.id || '',
      date: new Date().toISOString().split('T')[0],
      account_id: accounts[0]?.id || '',
    });
  };

  return (
    <div className="glass-card p-6 lg:p-8 rounded-[2rem] sticky top-24 border border-border/50 shadow-xl shadow-black/5">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-6 bg-accent rounded-full shadow-[0_0_10px_rgba(var(--accent),0.5)]"></div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">New Transaction</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type Selector (Segmented Control) */}
        <div className="grid grid-cols-2 bg-card-bg/50 p-1.5 rounded-2xl border border-border">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'expense' })}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              formData.type === 'expense'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20 scale-[1.02]'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'
            }`}
          >
            <TrendingDownIcon size={18} />
            <span>Expense</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'income' })}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              formData.type === 'income'
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/20 scale-[1.02]'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'
            }`}
          >
            <TrendingUpIcon size={18} />
            <span>Income</span>
          </button>
        </div>

        {/* Amount Input (Prominent) */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Amount</label>
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors">
              <span className="text-lg font-bold">Rp</span>
            </div>
            <input
              type="number"
              required
              min="0"
              className="w-full bg-card-bg border border-border rounded-2xl pl-14 pr-5 py-5 text-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all tabular-nums placeholder:text-muted-foreground/30"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              placeholder="0"
            />
          </div>
        </div>

        {/* Title Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Title</label>
          <input
            type="text"
            required
            className="w-full bg-card-bg border border-border rounded-2xl px-5 py-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="What is this for?"
          />
        </div>

        {/* Date and Account Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Date</label>
            <div className="relative">
              <input
                type="date"
                required
                className="w-full bg-card-bg border border-border rounded-2xl px-4 py-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all dark:[color-scheme:dark]"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Account</label>
            <div className="relative">
              <select
                required
                className="w-full bg-card-bg border border-border rounded-2xl pl-4 pr-10 py-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all appearance-none cursor-pointer"
                value={formData.account_id}
                onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
              >
                <option value="" disabled className="bg-card-bg text-muted-foreground">Select</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id} className="bg-card-bg text-foreground">
                    {acc.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* Category Select */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Category</label>
          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <TagsIcon size={18} />
            </div>
            <select
              className="w-full bg-card-bg border border-border rounded-2xl pl-12 pr-10 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all appearance-none cursor-pointer"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            >
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-card-bg text-foreground">
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-5 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-8 shadow-xl shadow-accent/20 hover:shadow-accent/30 hover:-translate-y-1 active:scale-[0.98] group"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-accent-foreground/30 border-t-accent-foreground"></div>
          ) : (
            <>
              <div className="bg-accent-foreground/10 p-1 rounded-lg group-hover:bg-accent-foreground/20 transition-colors">
                <PlusIcon size={20} />
              </div>
              <span className="text-lg">Add Transaction</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
