'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Transaction } from '@/types';

interface CashFlowChartProps {
  transactions: Transaction[];
}

export default function CashFlowChart({ transactions }: CashFlowChartProps) {
  const data = useMemo(() => {
    // Group transactions by date
    const groupedData = transactions.reduce((acc, curr) => {
      const date = new Date(curr.date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short'
      });
      
      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0 };
      }
      
      if (curr.type === 'income') {
        acc[date].income += curr.amount;
      } else {
        acc[date].expense += curr.amount;
      }
      
      return acc;
    }, {} as Record<string, { date: string; income: number; expense: number }>);

    // Sort by date (need original date for sorting, but key is formatted string)
    // To simplify sorting, we can rely on the fact that transactions are usually fetched sorted or sort them first.
    // Assuming transactions prop is already sorted by date desc, we might want to reverse it for the chart (oldest to newest).
    
    // Let's ensure we display the last 7 days or so with data, or just all data passed
    // For better UX, let's take the input transactions, sort by date asc
    
    const sortedDates = Object.values(groupedData).reverse(); // Assuming input is desc
    
    return sortedDates;
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground glass-card rounded-[2rem]">
        No data available for chart
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-[2rem] w-full h-[400px]">
      <h3 className="text-xl font-bold text-foreground mb-6">Income vs Expense</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="var(--muted-foreground)" 
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="var(--muted-foreground)" 
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            tickFormatter={(value) => `Rp${(value / 1000).toFixed(0)}k`}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--card-bg)', 
              border: '1px solid var(--border)', 
              borderRadius: '12px',
              color: 'var(--foreground)' 
            }}
            cursor={{ fill: 'var(--muted)' }}
            formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, '']}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar 
            dataKey="income" 
            name="Income" 
            fill="#10b981" 
            radius={[4, 4, 0, 0]} 
            barSize={20}
          />
          <Bar 
            dataKey="expense" 
            name="Expense" 
            fill="#ef4444" 
            radius={[4, 4, 0, 0]} 
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
