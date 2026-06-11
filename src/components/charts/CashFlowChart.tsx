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
import { formatRupiah, formatRupiahShort, toNumber } from '@/lib/format';

interface CashFlowChartProps {
  transactions: Transaction[];
}

export default function CashFlowChart({ transactions }: CashFlowChartProps) {
  const data = useMemo(() => {
    // Simpan raw date untuk sorting yang akurat
    const groupedData: Record<string, { rawDate: string; date: string; income: number; expense: number }> = {};

    transactions.forEach((curr) => {
      const raw  = curr.date.slice(0, 10); // YYYY-MM-DD
      const label = new Date(raw + 'T00:00:00').toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
      });

      if (!groupedData[raw]) {
        groupedData[raw] = { rawDate: raw, date: label, income: 0, expense: 0 };
      }

      if (curr.type === 'income') {
        groupedData[raw].income += toNumber(curr.amount);
      } else {
        groupedData[raw].expense += toNumber(curr.amount);
      }
    });

    // Sort ascending by actual date
    return Object.values(groupedData)
      .sort((a, b) => a.rawDate.localeCompare(b.rawDate))
      .slice(-30); // Tampilkan max 30 hari terakhir
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
            tickFormatter={(value) => formatRupiahShort(value)}
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
            formatter={(value: number | undefined) => [formatRupiah(value ?? 0), '']}
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
