'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types';
import Navbar from '@/components/Navbar';
import { PlusIcon, Trash2Icon, ArrowLeftIcon, ChevronDownIcon, Edit2Icon, CheckIcon, XIcon } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.id) {
      fetchCategories();
    }
  }, [user?.id]);

  const fetchCategories = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('type', { ascending: false })
        .order('name', { ascending: true });

      if (error) throw error;
      if (data) setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setActionLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: newName, type: newType }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setCategories([...categories, data]);
        setNewName('');
      }
    } catch (error: any) {
      console.error('Error adding category:', error);
      alert(error.code === '23505' ? 'Kategori sudah ada!' : 'Gagal menambah kategori.');
    } finally {
      setActionLoading(false);
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  const updateCategory = async (id: string) => {
    if (!editingName.trim()) return;

    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('categories')
        .update({ name: editingName })
        .eq('id', id);

      if (error) throw error;

      setCategories(categories.map(c => c.id === id ? { ...c, name: editingName } : c));
      setEditingId(null);
      setEditingName('');
    } catch (error: any) {
      console.error('Error updating category:', error);
      alert('Gagal memperbarui kategori.');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Hapus kategori ini?')) return;

    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCategories(categories.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Gagal menghapus kategori. Mungkin kategori ini sedang digunakan di transaksi.');
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground transition-colors duration-300">
      <Navbar />
      
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-6">
              <Link href="/" className="p-3 glass rounded-2xl text-muted-foreground hover:text-foreground hover:bg-card-bg transition-all">
                <ArrowLeftIcon size={22} />
              </Link>
              <div className="flex flex-col">
                <h1 className="text-4xl font-bold text-foreground tracking-tight">Categories</h1>
                <p className="text-muted-foreground text-sm">Organize your financial flow</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in">
            {/* Form Tambah */}
            <div className="lg:col-span-4">
              <div className="glass-card p-8 rounded-[2rem] sticky top-28">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1.5 h-6 bg-accent rounded-full"></div>
                  <h2 className="text-xl font-bold text-foreground tracking-tight">Add Category</h2>
                </div>

                <form onSubmit={addCategory} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Category Name</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-card-bg border border-border rounded-2xl px-5 py-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Transportation"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Type</label>
                    <div className="relative">
                      <select
                        className="w-full bg-card-bg border border-border rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all appearance-none cursor-pointer"
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as 'income' | 'expense')}
                      >
                        <option value="expense" className="bg-card-bg text-foreground">Expense</option>
                        <option value="income" className="bg-card-bg text-foreground">Income</option>
                      </select>
                      <ChevronDownIcon className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-accent/20 active:scale-[0.98]"
                  >
                    <PlusIcon size={20} />
                    <span>Create Category</span>
                  </button>
                </form>
              </div>
            </div>

            {/* List Kategori */}
            <div className="lg:col-span-8">
              <div className="glass-card rounded-[2.5rem] overflow-hidden">
                <div className="p-8 border-b border-border bg-accent/5 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-accent rounded-full"></div>
                    <h2 className="text-xl font-bold text-foreground tracking-tight">Available Categories</h2>
                  </div>
                  <span className="text-[10px] font-bold text-accent bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20 uppercase tracking-widest">
                    {categories.length} Total
                  </span>
                </div>

                {loading ? (
                  <div className="p-20 flex justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
                  </div>
                ) : (
                  <div className="divide-y divide-border max-h-[600px] overflow-y-auto custom-scrollbar">
                    {categories.map((category) => (
                      <div key={category.id} className="p-6 flex items-center justify-between group hover:bg-accent/5 transition-all">
                        <div className="flex-1 flex items-center gap-5">
                          <div className={`p-3 rounded-xl ${category.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            <div className="w-2.5 h-2.5 rounded-full bg-current shadow-[0_0_10px_currentColor]"></div>
                          </div>
                          
                          {editingId === category.id ? (
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="text"
                                className="flex-1 bg-card-bg border border-accent/30 rounded-xl px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') updateCategory(category.id);
                                  if (e.key === 'Escape') cancelEditing();
                                }}
                              />
                              <button
                                onClick={() => updateCategory(category.id)}
                                className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                                title="Save"
                              >
                                <CheckIcon size={18} />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="p-2 text-muted-foreground hover:bg-card-bg rounded-lg transition-all"
                                title="Cancel"
                              >
                                <XIcon size={18} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              <span className="text-foreground font-bold text-lg tracking-tight">{category.name}</span>
                              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                {category.type}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {editingId !== category.id && (
                            <button
                              onClick={() => startEditing(category)}
                              className="text-muted-foreground hover:text-accent p-3 rounded-xl hover:bg-accent/10 opacity-0 group-hover:opacity-100 transition-all"
                              title="Edit"
                            >
                              <Edit2Icon size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteCategory(category.id)}
                            disabled={actionLoading}
                            className="text-muted-foreground hover:text-red-500 p-3 rounded-xl hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                            title="Delete"
                          >
                            <Trash2Icon size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {categories.length === 0 && (
                      <div className="p-20 text-center">
                        <p className="text-muted-foreground font-medium">No categories found.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
