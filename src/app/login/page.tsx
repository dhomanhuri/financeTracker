'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { WalletIcon, MailIcon, LockIcon, ArrowRightIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Cek email Anda untuk konfirmasi pendaftaran!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat autentikasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 selection:bg-accent/30 selection:text-accent relative overflow-hidden transition-colors duration-300">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md animate-fade-in relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex p-4 bg-accent/10 rounded-[2rem] mb-6 logo-glow ring-1 ring-accent/20">
            <WalletIcon className="text-accent" size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-500 text-lg">
            {isRegister 
              ? 'Join Illyas Finance to manage your wealth' 
              : 'Sign in to your Illyas Finance account'}
          </p>
        </div>

        <div className="glass-card p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <form onSubmit={handleAuth} className="space-y-7">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm flex items-center gap-3 animate-shake">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-accent transition-colors">
                    <MailIcon size={20} strokeWidth={2} />
                  </div>
                  <input
                    type="email"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-accent transition-colors">
                    <LockIcon size={20} strokeWidth={2} />
                  </div>
                  <input
                    type="password"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/90 text-slate-950 font-bold py-5 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-accent/20 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="text-lg">{isRegister ? 'Register Now' : 'Sign In'}</span>
                  <ArrowRightIcon size={22} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-gray-500 hover:text-accent transition-colors text-sm font-semibold tracking-wide"
            >
              {isRegister 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Create one now"}
            </button>
          </div>
        </div>
        
        <p className="text-center mt-10 text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em]">
          Powered by Supabase & Next.js
        </p>
      </div>
    </main>
  );
}
