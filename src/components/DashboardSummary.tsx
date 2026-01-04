'use client';

import { Transaction } from '@/types';
import { TrendingDownIcon, WalletIcon, TrendingUpIcon } from 'lucide-react';

interface DashboardSummaryProps {
  transactions: Transaction[];
}

export default function DashboardSummary({ transactions }: DashboardSummaryProps) {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Calculate stats
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIncome - totalExpense;

  // Monthly stats
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const monthlyIncome = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type === 'income';
    })
    .reduce((acc, curr) => acc + curr.amount, 0);

  const monthlyExpense = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type === 'expense';
    })
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 p-10 md:p-16">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 blur-[100px] -mr-48 -mt-48 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 blur-[100px] -ml-48 -mb-48 rounded-full"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-400 mb-6 uppercase tracking-[0.2em]">
            Current Net Worth
          </span>
          <h2 className="text-white text-5xl md:text-7xl font-bold tracking-tight mb-4 tabular-nums">
            Rp {balance.toLocaleString('id-ID')}
          </h2>
          <p className="text-gray-500 font-medium mb-12">{formattedDate}</p>
          
          <div className="grid grid-cols-2 gap-8 md:gap-24">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <TrendingUpIcon size={18} />
                <span className="text-sm font-bold uppercase tracking-wider">Income</span>
              </div>
              <p className="text-2xl font-bold text-white tabular-nums">
                Rp {monthlyIncome.toLocaleString('id-ID')}
              </p>
              <span className="text-[10px] text-gray-500 mt-1 uppercase">This Month</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <TrendingDownIcon size={18} />
                <span className="text-sm font-bold uppercase tracking-wider">Expense</span>
              </div>
              <p className="text-2xl font-bold text-white tabular-nums">
                Rp {monthlyExpense.toLocaleString('id-ID')}
              </p>
              <span className="text-[10px] text-gray-500 mt-1 uppercase">This Month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl hover:bg-white/5 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-accent/10 rounded-2xl text-accent group-hover:scale-110 transition-transform">
              <WalletIcon size={24} />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Savings</span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Total Savings</p>
          <p className="text-2xl font-bold text-white tabular-nums">Rp {balance.toLocaleString('id-ID')}</p>
        </div>

        <div className="glass-card p-6 rounded-3xl hover:bg-white/5 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/10 rounded-2xl text-green-500 group-hover:scale-110 transition-transform">
              <TrendingUpIcon size={24} />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Growth</span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-white tabular-nums">Rp {totalIncome.toLocaleString('id-ID')}</p>
        </div>

        <div className="glass-card p-6 rounded-3xl hover:bg-white/5 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-500/10 rounded-2xl text-red-500 group-hover:scale-110 transition-transform">
              <TrendingDownIcon size={24} />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Spending</span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-white tabular-nums">Rp {totalExpense.toLocaleString('id-ID')}</p>
        </div>
      </div>
    </div>
  );
}
