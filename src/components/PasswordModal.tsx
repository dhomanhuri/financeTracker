'use client';

import { useState } from 'react';
import { XIcon, LockIcon, Loader2Icon } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => Promise<void>;
  title?: string;
  description?: string;
}

export default function PasswordModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title = "Security Verification", 
  description = "Please enter your password to view sensitive information."
}: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError('');

    try {
      await onSubmit(password);
      setPassword(''); // Clear password on success (or let parent handle close)
    } catch (err: any) {
      console.error(err);
      setError('Invalid password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-card-bg border border-border rounded-2xl shadow-2xl p-6 relative animate-scale-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <XIcon size={20} />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-accent/10 rounded-full text-accent mb-4">
            <LockIcon size={24} />
          </div>
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          <p className="text-muted-foreground text-sm text-center mt-2">
            {description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-card-bg border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              autoFocus
            />
            {error && (
              <p className="text-red-400 text-xs mt-2 pl-1">{error}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-medium transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-bold transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
              disabled={loading || !password}
            >
              {loading ? (
                <>
                  <Loader2Icon size={18} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                'Confirm'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
