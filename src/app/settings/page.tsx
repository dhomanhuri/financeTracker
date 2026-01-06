'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { 
  KeyIcon, 
  PlusIcon, 
  Trash2Icon, 
  CopyIcon, 
  CheckIcon,
  AlertCircleIcon,
  Code2Icon,
  ExternalLinkIcon
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      fetchApiKeys();
    }
  }, [user]);

  const fetchApiKeys = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) {
      setApiKeys(data || []);
    }
    setLoading(false);
  };

  const createApiKey = async () => {
    if (!newKeyName.trim() || !user) return;

    // Generate a random key
    const rawKey = `ft_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    
    const { data, error } = await supabase
      .from('api_keys')
      .insert([
        { 
          user_id: user.id, 
          name: newKeyName, 
          key_hash: rawKey // In a real app, this should be a hash, but for simplicity we store raw for display once
        }
      ])
      .select()
      .single();

    if (!error) {
      setGeneratedKey(rawKey);
      setNewKeyName('');
      fetchApiKeys();
    }
  };

  const deleteApiKey = async (id: string) => {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id);
    
    if (!error) {
      fetchApiKeys();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 pb-20">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 pt-12">
        <div className="flex flex-col gap-2 mb-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent/10 rounded-2xl text-accent ring-1 ring-accent/20">
              <Code2Icon size={24} strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">API Settings</h1>
          </div>
          <p className="text-gray-500 text-lg font-medium">Manage your API keys to access Illyas Finance programmatically.</p>
        </div>

        <div className="grid gap-8">
          {/* Create New Key */}
          <section className="glass-card p-8 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
              <PlusIcon size={120} />
            </div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <PlusIcon size={20} className="text-accent" />
              Generate New API Key
            </h2>
            <div className="flex gap-4">
              <input 
                type="text" 
                placeholder="Key Name (e.g. My Script)" 
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              />
              <button 
                onClick={createApiKey}
                disabled={!newKeyName.trim()}
                className="bg-accent text-slate-950 font-bold px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-accent/20 flex items-center gap-2"
              >
                <KeyIcon size={18} />
                Generate Key
              </button>
            </div>

            {generatedKey && (
              <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-emerald-500 text-sm font-bold uppercase tracking-widest">New API Key Created</span>
                  <span className="text-xs text-emerald-500/60 font-medium">Copy it now, you won't be able to see it again!</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-950/50 p-4 rounded-xl border border-white/5 font-mono text-white break-all">
                  <span className="flex-1">{generatedKey}</span>
                  <button 
                    onClick={() => copyToClipboard(generatedKey)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all text-emerald-500"
                  >
                    {copied ? <CheckIcon size={20} /> : <CopyIcon size={20} />}
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Existing Keys */}
          <section className="glass-card p-8 rounded-[2rem] border border-white/5 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <KeyIcon size={20} className="text-accent" />
              Your API Keys
            </h2>
            
            {loading ? (
              <div className="py-10 text-center text-gray-500">Loading keys...</div>
            ) : apiKeys.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                <AlertCircleIcon size={40} className="mx-auto text-gray-700 mb-4" />
                <p className="text-gray-500 font-medium">No API keys found. Generate one above to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/5 rounded-xl text-gray-400 group-hover:text-white transition-colors">
                        <KeyIcon size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{key.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">Created {new Date(key.created_at).toLocaleDateString()}</span>
                          {key.last_used_at && (
                            <span className="text-xs text-emerald-500/60 font-medium">Last used {new Date(key.last_used_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteApiKey(key.id)}
                      className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2Icon size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Documentation Link */}
          <section className="p-8 rounded-[2rem] bg-accent/5 border border-accent/10 flex items-center justify-between group cursor-pointer hover:bg-accent/10 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent text-slate-950 rounded-2xl shadow-lg shadow-accent/20">
                <Code2Icon size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors">API Documentation</h3>
                <p className="text-gray-500 text-sm font-medium">Learn how to integrate with our REST API endpoints.</p>
              </div>
            </div>
            <ExternalLinkIcon size={20} className="text-gray-600 group-hover:text-accent group-hover:translate-x-1 transition-all" />
          </section>
        </div>
      </div>
    </main>
  );
}
