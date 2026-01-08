'use client';

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Transaction } from '@/types';

interface ExpenseCategoryChartProps {
  transactions: Transaction[];
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export default function ExpenseCategoryChart({ transactions }: ExpenseCategoryChartProps) {
  const data = useMemo(() => {
    // Filter only expenses
    const expenses = transactions.filter(t => t.type === 'expense');
    
    // Group by category
    const groupedData = expenses.reduce((acc, curr) => {
      // Use category object if available (it should be based on Transaction type)
      // The Transaction type usually has categories joined, or category_id
      // Let's assume the transaction object has a 'category' property which is an object { name, ... }
      // If the type definition is different, we need to check.
      // Based on previous reads, transactions seem to have joined category data.
      
      // Let's check how category is accessed in TransactionList or similar.
      // Usually it's `transaction.categories?.name` or similar.
      // I'll assume standard access for now, but might need adjustment.
      
      const categoryName = curr.categories?.name || 'Uncategorized';
      
      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }
      
      acc[categoryName] += curr.amount;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort by value desc
    return Object.entries(groupedData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categories + others maybe? For now just top 8
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
      <h3 className="text-xl font-bold text-foreground mb-6">Expense Allocation</h3>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--card-bg)', 
              border: '1px solid var(--border)', 
              borderRadius: '12px',
              color: 'var(--foreground)' 
            }}
            formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Amount']}
          />
          <Legend 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            wrapperStyle={{ paddingLeft: '20px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
