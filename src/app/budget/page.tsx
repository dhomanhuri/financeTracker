'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { PlusIcon, Trash2Icon, ChevronLeftIcon, ChevronRightIcon, WalletIcon } from 'lucide-react';
import MaskedAmount from '@/components/MaskedAmount';

interface BudgetRow {
  id: string;
  category_id: string;
  category_name: string;
  budget_amount: number;
  spent: number;
  month: number;
  year: number;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

export default function BudgetPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());

  const [budgets,    setBudgets]    = useState<BudgetRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [selCat,     setSelCat]     = useState('');
  const [amount,     setAmount]     = useState('');
  const [saving,     setSaving]     = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchAll();
    }
  }, [user, month, year]);

  const fetchAll = async () => {
    setLoading(true);
    const [bRes, cRes] = await Promise.all([
      fetch(`/api/v1/budgets?month=${month}&year=${year}`).then(r => r.json()),
      fetch('/api/v1/categories').then(r => r.json()),
    ]);
    setBudgets(Array.isArray(bRes) ? bRes : []);
    const expCats = Array.isArray(cRes) ? cRes.filter((c: Category) => c.type === 'expense') : [];
    setCategories(expCats);
    if (!selCat && expCats.length > 0) setSelCat(expCats[0].id);
    setLoading(false);
  };

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const addBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selCat || !amount) return;
    setSaving(true);
    await fetch('/api/v1/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category_id: selCat, amount: parseFloat(amount), month, year }),
    });
    setAmount('');
    await fetchAll();
    setSaving(false);
  };

  const deleteBudget = async (id: string) => {
    if (!confirm('Hapus budget ini?')) return;
    await fetch(`/api/v1/budgets/${id}`, { method: 'DELETE' });
    setBudgets(budgets.filter(b => b.id !== id));
  };

  // Hitung total
  const totalBudget = budgets.reduce((s, b) => s + Number(b.budget_amount), 0);
  const totalSpent  = budgets.reduce((s, b) => s + Number(b.spent), 0);
  const totalPct    = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  // Kategori yang belum punya budget bulan ini
  const usedCatIds = new Set(budgets.map(b => b.category_id));
  const availCats  = categories.filter(c => !usedCatIds.has(c.id));

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">

          {/* Header + navigasi bulan */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Budget</h1>
              <p className="text-muted-foreground text-sm mt-1">Kelola pengeluaran per kategori</p>
            </div>
            <div className="flex items-center gap-3 bg-card-bg border border-border rounded-2xl px-4 py-2">
              <button onClick={prevMonth} className="p-1 hover:text-accent transition-colors">
                <ChevronLeftIcon size={18} />
              </button>
              <span className="font-semibold text-sm w-24 text-center">
                {MONTH_NAMES[month - 1]} {year}
              </span>
              <button onClick={nextMonth} className="p-1 hover:text-accent transition-colors">
                <ChevronRightIcon size={18} />
              </button>
            </div>
          </div>

          {/* Summary card */}
          {budgets.length > 0 && (
            <div className="glass-card p-6 rounded-[2rem] mb-6 border border-border">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Total Budget</p>
                  <p className="text-2xl font-bold"><MaskedAmount amount={totalBudget} /></p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Terpakai</p>
                  <p className={`text-2xl font-bold ${totalSpent > totalBudget ? 'text-red-400' : 'text-green-400'}`}>
                    <MaskedAmount amount={totalSpent} />
                  </p>
                </div>
              </div>
              <div className="w-full bg-white/5 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${
                    totalPct >= 100 ? 'bg-red-500' : totalPct >= 80 ? 'bg-orange-400' : 'bg-accent'
                  }`}
                  style={{ width: `${totalPct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-right">{totalPct.toFixed(1)}% terpakai</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Form tambah budget */}
            <div className="lg:col-span-2">
              <div className="glass-card p-6 rounded-[2rem] border border-border sticky top-24">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1.5 h-5 bg-accent rounded-full" />
                  <h2 className="font-bold">Set Budget</h2>
                </div>
                <form onSubmit={addBudget} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">
                      Kategori
                    </label>
                    <select
                      className="w-full bg-card-bg border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 appearance-none"
                      value={selCat}
                      onChange={e => setSelCat(e.target.value)}
                    >
                      {availCats.length === 0
                        ? <option value="">Semua kategori sudah ada budget</option>
                        : availCats.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))
                      }
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">
                      Limit (Rp)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                      <input
                        type="number"
                        min="0"
                        required
                        placeholder="0"
                        className="w-full bg-card-bg border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={saving || availCats.length === 0 || !amount}
                    className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground font-bold py-3 rounded-xl hover:bg-accent/90 transition disabled:opacity-40"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                    ) : (
                      <><PlusIcon size={16} /> Simpan Budget</>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Daftar budget */}
            <div className="lg:col-span-3 space-y-3">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : budgets.length === 0 ? (
                <div className="glass-card p-12 rounded-[2rem] text-center border border-dashed border-border">
                  <WalletIcon size={36} className="mx-auto mb-3 text-muted-foreground/40" />
                  <p className="text-muted-foreground text-sm">Belum ada budget untuk {MONTH_NAMES[month-1]} {year}</p>
                </div>
              ) : (
                budgets.map(b => {
                  const pct     = b.budget_amount > 0 ? Math.min((Number(b.spent) / Number(b.budget_amount)) * 100, 100) : 0;
                  const over    = Number(b.spent) > Number(b.budget_amount);
                  const warning = pct >= 80;
                  return (
                    <div key={b.id} className="glass-card p-5 rounded-2xl border border-border group hover:border-accent/30 transition">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-sm">{b.category_name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">
                              <MaskedAmount amount={Number(b.spent)} /> / <MaskedAmount amount={Number(b.budget_amount)} />
                            </span>
                            {over && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">OVER</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold tabular-nums ${
                            over ? 'text-red-400' : warning ? 'text-orange-400' : 'text-green-400'
                          }`}>
                            {pct.toFixed(0)}%
                          </span>
                          <button
                            onClick={() => deleteBudget(b.id)}
                            className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                          >
                            <Trash2Icon size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-700 ${
                            over ? 'bg-red-500' : warning ? 'bg-orange-400' : 'bg-accent'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
