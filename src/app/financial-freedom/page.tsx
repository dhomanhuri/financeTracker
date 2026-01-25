'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  CalculatorIcon, 
  TrendingUpIcon, 
  DollarSignIcon, 
  SaveIcon, 
  AlertCircleIcon,
  CheckCircle2Icon,
  UsersIcon,
  PiggyBankIcon
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import MaskedAmount from '@/components/MaskedAmount';

export default function FinancialFreedomPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Inputs
  const [inputs, setInputs] = useState({
    initialSavings: 0,
    monthlySavings: 1000000,
    returnRate: 10, // % per year
    monthlyExpenses: 5000000,
    monthlyIncome: 0,
    dependents: 0
  });

  // Load from localStorage on mount (for guest persistence)
  useEffect(() => {
    const saved = localStorage.getItem('ff_calculator_inputs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setInputs(prev => ({
          ...prev,
          ...parsed,
          initialSavings: parsed.initialSavings || 0
        }));
      } catch (e) {
        console.error('Failed to parse saved inputs', e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('ff_calculator_inputs', JSON.stringify(inputs));
  }, [inputs]);

  // Load from DB if user logs in
  useEffect(() => {
    if (user?.id) {
      fetchLatestEntry();
    }
  }, [user?.id]);

  const fetchLatestEntry = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_freedom_entries')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setInputs({
          initialSavings: Number(data.initial_savings || 0),
          monthlySavings: Number(data.monthly_savings),
          returnRate: Number(data.return_rate),
          monthlyExpenses: Number(data.monthly_expenses),
          monthlyIncome: Number(data.monthly_income || 0),
          dependents: Number(data.dependents || 0)
        });
      }
    } catch (error) {
      // No entry found is fine
    }
  };

  const handleSaveToDb = async () => {
    if (!user) return;
    setSaveStatus('saving');
    try {
      const { error } = await supabase
        .from('financial_freedom_entries')
        .insert([{
          user_id: user.id,
          initial_savings: inputs.initialSavings,
          monthly_savings: inputs.monthlySavings,
          annual_savings: inputs.monthlySavings * 12,
          return_rate: inputs.returnRate,
          monthly_expenses: inputs.monthlyExpenses,
          annual_expenses: inputs.monthlyExpenses * 12,
          monthly_income: inputs.monthlyIncome,
          dependents: inputs.dependents,
          target_amount: (inputs.monthlyExpenses * 12) / 0.03 // 3% rule
        }]);

      if (error) throw error;
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving:', error);
      setSaveStatus('error');
    }
  };

  // Calculations
  const calculations = useMemo(() => {
    const annualSavings = inputs.monthlySavings * 12;
    const annualExpenses = inputs.monthlyExpenses * 12;
    
    // 3% withdrawal rule + 3% inflation buffer implies we need a portfolio that can sustain this.
    // Usually, the "4% rule" is standard (25x expenses).
    // If the user wants to withdraw 3% safely, they need 100/3 = 33.3x expenses.
    // We will use 3% as the Safe Withdrawal Rate (SWR).
    const targetAmount = annualExpenses / 0.03; 

    const projection = [];
    let currentBalance = inputs.initialSavings;
    let year = 0;
    const maxYears = 50; // Cap at 50 years to avoid infinite loops

    while (currentBalance < targetAmount && year < maxYears) {
      year++;
      const startBalance = currentBalance;
      const investmentReturn = startBalance * (inputs.returnRate / 100);
      const contribution = annualSavings;
      const endBalance = startBalance + investmentReturn + contribution;
      
      projection.push({
        year,
        startBalance,
        investmentReturn,
        contribution,
        endBalance,
        returnRate: inputs.returnRate
      });

      currentBalance = endBalance;
    }

    return {
      annualSavings,
      annualExpenses,
      targetAmount,
      yearsToFreedom: year >= maxYears && currentBalance < targetAmount ? '> 50' : year,
      projection
    };
  }, [inputs]);

  // Recommendations
  const recommendations = useMemo(() => {
    if (!inputs.monthlyIncome) return null;

    const needs = inputs.monthlyIncome * 0.5;
    const wants = inputs.monthlyIncome * 0.3;
    const savings = inputs.monthlyIncome * 0.2;

    let advice = [];
    
    if (inputs.dependents > 0) {
      advice.push("Consider increasing your Emergency Fund to 6-12 months of expenses due to dependents.");
      advice.push("Life Insurance is highly recommended to protect your dependents.");
    } else {
      advice.push("A 3-6 month Emergency Fund is likely sufficient.");
    }

    if (inputs.monthlySavings < savings) {
      advice.push(`Try to increase your savings to at least Rp ${savings.toLocaleString('id-ID')} (20%) to speed up financial freedom.`);
    } else {
      advice.push("Great job! You are saving more than the recommended 20%.");
    }

    return {
      allocations: { needs, wants, savings },
      advice
    };
  }, [inputs.monthlyIncome, inputs.dependents, inputs.monthlySavings]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/30 selection:text-accent transition-colors duration-300">
      <Navbar />
      
      <main className="py-24 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-3">
              Financial <span className="text-accent">Freedom</span> Calculator
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Plan your journey to financial independence. Calculate how much you need to retire early with a safe 3% withdrawal rate.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Inputs Section */}
            <div className="lg:col-span-4 space-y-8">
              <div className="glass-card p-8 rounded-[2rem] sticky top-28">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-accent rounded-full"></div>
                  <h2 className="text-xl font-bold text-foreground tracking-tight">Your Numbers</h2>
                </div>

                <div className="space-y-6">
                  {/* Initial Savings (Optional) */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
                      Initial Savings (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">Rp</div>
                      <input
                        type="number"
                        className="w-full bg-card-bg border border-border rounded-2xl pl-12 pr-5 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all tabular-nums"
                        value={inputs.initialSavings}
                        onChange={(e) => setInputs({ ...inputs, initialSavings: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  {/* Monthly Savings */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
                      Monthly Savings
                    </label>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">Rp</div>
                      <input
                        type="number"
                        className="w-full bg-card-bg border border-border rounded-2xl pl-12 pr-5 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all tabular-nums"
                        value={inputs.monthlySavings}
                        onChange={(e) => setInputs({ ...inputs, monthlySavings: Number(e.target.value) })}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground ml-2">
                      Annual: Rp {(inputs.monthlySavings * 12).toLocaleString('id-ID')}
                    </p>
                  </div>

                  {/* Return Rate */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
                      Return Investment (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full bg-card-bg border border-border rounded-2xl px-5 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all tabular-nums"
                        value={inputs.returnRate}
                        onChange={(e) => setInputs({ ...inputs, returnRate: Number(e.target.value) })}
                      />
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">%</div>
                    </div>
                  </div>

                  {/* Monthly Expenses */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
                      Monthly Expenses
                    </label>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">Rp</div>
                      <input
                        type="number"
                        className="w-full bg-card-bg border border-border rounded-2xl pl-12 pr-5 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all tabular-nums"
                        value={inputs.monthlyExpenses}
                        onChange={(e) => setInputs({ ...inputs, monthlyExpenses: Number(e.target.value) })}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground ml-2">
                      Annual: Rp {(inputs.monthlyExpenses * 12).toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <button
                      onClick={() => document.getElementById('optional-inputs')?.classList.toggle('hidden')}
                      className="text-sm text-accent font-bold hover:underline flex items-center gap-2"
                    >
                      <UsersIcon size={16} />
                      Optional: Income & Dependents
                    </button>
                    
                    <div id="optional-inputs" className="hidden space-y-6 mt-6 animate-fade-in">
                      {/* Monthly Income */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
                          Monthly Income (Optional)
                        </label>
                        <div className="relative">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">Rp</div>
                          <input
                            type="number"
                            className="w-full bg-card-bg border border-border rounded-2xl pl-12 pr-5 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all tabular-nums"
                            value={inputs.monthlyIncome}
                            onChange={(e) => setInputs({ ...inputs, monthlyIncome: Number(e.target.value) })}
                          />
                        </div>
                      </div>

                      {/* Dependents */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
                          Number of Dependents
                        </label>
                        <input
                          type="number"
                          className="w-full bg-card-bg border border-border rounded-2xl px-5 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all tabular-nums"
                          value={inputs.dependents}
                          onChange={(e) => setInputs({ ...inputs, dependents: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>

                  {user ? (
                    <button
                      onClick={handleSaveToDb}
                      disabled={saveStatus === 'saving' || saveStatus === 'saved'}
                      className={`w-full font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl ${
                        saveStatus === 'saved' 
                          ? 'bg-green-500 text-white shadow-green-500/20' 
                          : 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-accent/20'
                      }`}
                    >
                      {saveStatus === 'saving' ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : saveStatus === 'saved' ? (
                        <>
                          <CheckCircle2Icon size={20} />
                          Saved!
                        </>
                      ) : (
                        <>
                          <SaveIcon size={20} />
                          Save Calculation
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="p-4 bg-accent/10 rounded-2xl border border-accent/20 text-center">
                      <p className="text-xs text-muted-foreground mb-2">Login to save your calculation permanently.</p>
                      <a href="/login" className="text-sm font-bold text-accent hover:underline">Log in now</a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-8 space-y-10">
              
              {/* Top Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-8 rounded-[2.5rem] bg-gradient-to-br from-card-bg to-accent/5 border-accent/20">
                  <div className="flex items-center gap-3 mb-4 text-accent">
                    <PiggyBankIcon size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Financial Freedom Number</span>
                  </div>
                  <h3 className="text-4xl font-black text-foreground tabular-nums mb-2">
                    <MaskedAmount amount={calculations.targetAmount} forceVisible={!user} />
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Target portfolio needed to withdraw 3% annually for expenses + 3% for inflation.
                  </p>
                </div>

                <div className="glass-card p-8 rounded-[2.5rem]">
                  <div className="flex items-center gap-3 mb-4 text-blue-500">
                    <TrendingUpIcon size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Time to Freedom</span>
                  </div>
                  <h3 className="text-4xl font-black text-foreground tabular-nums mb-2">
                    {calculations.yearsToFreedom} <span className="text-xl text-muted-foreground font-medium">Years</span>
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Based on your current savings rate and {inputs.returnRate}% annual return.
                  </p>
                </div>
              </div>

              {/* Chart */}
              <div className="glass-card p-6 rounded-[2rem] h-[400px]">
                <h3 className="text-xl font-bold text-foreground mb-6 pl-2">Growth Projection</h3>
                <ResponsiveContainer width="100%" height="85%">
                  <AreaChart
                    data={calculations.projection}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis 
                      dataKey="year" 
                      stroke="var(--muted-foreground)"
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      label={{ value: 'Years', position: 'insideBottomRight', offset: -5, fill: 'var(--muted-foreground)', fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="var(--muted-foreground)"
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                      tickFormatter={(value) => `Rp${(value / 1000000).toFixed(0)}M`}
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
                      formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`, 'Portfolio Value']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="endBalance" 
                      stroke="#10b981" 
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Recommendation AI Section */}
              {recommendations && (
                <div className="glass-card p-8 rounded-[2.5rem] border border-accent/20">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-accent/10 rounded-xl">
                      <CalculatorIcon size={24} className="text-accent" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground tracking-tight">AI Allocation Recommendation</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-5 rounded-2xl bg-card-bg border border-border">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Needs (50%)</p>
                      <p className="text-xl font-bold text-foreground tabular-nums">
                        Rp {recommendations.allocations.needs.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-card-bg border border-border">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Wants (30%)</p>
                      <p className="text-xl font-bold text-foreground tabular-nums">
                        Rp {recommendations.allocations.wants.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-card-bg border border-border">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Savings (20%)</p>
                      <p className="text-xl font-bold text-foreground tabular-nums">
                        Rp {recommendations.allocations.savings.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {recommendations.advice.map((tip, idx) => (
                      <div key={idx} className="flex gap-3 text-sm text-muted-foreground">
                        <CheckCircle2Icon size={18} className="text-accent shrink-0 mt-0.5" />
                        <p>{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Table */}
              <div className="glass-card rounded-[2.5rem] overflow-hidden">
                <div className="p-8 border-b border-border">
                  <h3 className="text-xl font-bold text-foreground">Yearly Projection</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-card-bg/50 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Year</th>
                        <th className="px-6 py-4">Start Balance</th>
                        <th className="px-6 py-4">Return (%)</th>
                        <th className="px-6 py-4">Return (Rp)</th>
                        <th className="px-6 py-4">Contribution</th>
                        <th className="px-6 py-4 text-right">End Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 text-sm font-medium text-foreground">
                      {calculations.projection.map((row) => (
                        <tr key={row.year} className="hover:bg-accent/5 transition-colors">
                          <td className="px-6 py-4">{row.year}</td>
                          <td className="px-6 py-4 tabular-nums">
                            <MaskedAmount amount={row.startBalance} prefix="" />
                          </td>
                          <td className="px-6 py-4 tabular-nums text-green-500">{row.returnRate}%</td>
                          <td className="px-6 py-4 tabular-nums text-green-500">
                            + <MaskedAmount amount={row.investmentReturn} prefix="" />
                          </td>
                          <td className="px-6 py-4 tabular-nums">
                            + <MaskedAmount amount={row.contribution} prefix="" />
                          </td>
                          <td className="px-6 py-4 text-right tabular-nums font-bold">
                            <MaskedAmount amount={row.endBalance} prefix="" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
