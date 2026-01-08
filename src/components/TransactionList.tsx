'use client';

import { Transaction } from '@/types';
import { Trash2Icon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
import MaskedAmount from './MaskedAmount';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => Promise<void>;
  isLoading: boolean;
}

export default function TransactionList({ transactions, onDelete, isLoading }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="glass-card p-20 rounded-[2.5rem] text-center">
        <div className="inline-flex p-6 bg-accent/5 rounded-full mb-6">
          <TrendingUpIcon size={40} className="text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">No Transactions Yet</h3>
        <p className="text-muted-foreground max-w-xs mx-auto">Start tracking your finances by adding your first transaction.</p>
      </div>
    );
  }

  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col h-[750px] animate-fade-in">
      <div className="p-8 border-b border-border flex justify-between items-center bg-card-bg/50">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-accent rounded-full"></div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Activity History</h2>
        </div>
        <span className="text-[10px] font-bold text-accent bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20 uppercase tracking-widest">
          {transactions.length} Records
        </span>
      </div>
      
      <div className="divide-y divide-border overflow-y-auto flex-1 custom-scrollbar">
        {sortedTransactions.map((transaction) => (
          <div key={transaction.id} className="p-6 hover:bg-accent/5 transition-all flex items-center justify-between group">
            <div className="flex items-center gap-5">
              <div
                className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${
                  transaction.type === 'income' 
                    ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}
              >
                {transaction.type === 'income' ? <TrendingUpIcon size={22} /> : <TrendingDownIcon size={22} />}
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-foreground text-base tracking-tight leading-none">
                  {transaction.title}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {transaction.categories?.name || 'Uncategorized'}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-border"></div>
                  {transaction.accounts && (
                    <span 
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: transaction.accounts.color }}
                    >
                      {transaction.accounts.name}
                    </span>
                  )}
                  <div className="w-1 h-1 rounded-full bg-border"></div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {new Date(transaction.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p
                  className={`font-bold text-lg tabular-nums tracking-tight ${
                    transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  <MaskedAmount 
                    amount={transaction.amount} 
                    prefix={transaction.type === 'income' ? '+ Rp ' : '- Rp '} 
                  />
                </p>
              </div>
              
              <button
                onClick={() => onDelete(transaction.id)}
                disabled={isLoading}
                className="text-muted-foreground hover:text-red-500 transition-all p-3 rounded-xl hover:bg-red-500/10 disabled:opacity-0 group-hover:opacity-100 md:opacity-0"
                title="Delete Transaction"
              >
                <Trash2Icon size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
