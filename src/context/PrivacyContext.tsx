'use client';

import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import PasswordModal from '@/components/PasswordModal';

interface PrivacyContextType {
  isMasked: boolean;
  toggleMask: () => void;
  verifyAndExecute: (action: () => void) => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isMasked, setIsMasked] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);
  const prevUserIdRef = useRef<string | undefined>(undefined);

  // If user is not logged in, force unmasked. Only mask on fresh login.
  React.useEffect(() => {
    if (!user) {
      setIsMasked(false);
      prevUserIdRef.current = undefined;
    } else if (user.id !== prevUserIdRef.current) {
      setIsMasked(true); 
      prevUserIdRef.current = user.id;
    }
  }, [user]);

  const verifyPassword = async (password: string) => {
    if (!user?.email) throw new Error('User not found');

    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: password,
    });

    if (error) throw error;
  };

  const handlePasswordSubmit = async (password: string) => {
    try {
      await verifyPassword(password);
      setIsModalOpen(false);
      
      // Execute the pending action immediately after successful verification
      if (pendingActionRef.current) {
        pendingActionRef.current();
        pendingActionRef.current = null;
      }
    } catch (error) {
      throw error; // Re-throw to be caught by PasswordModal
    }
  };

  const verifyAndExecute = (action: () => void) => {
    pendingActionRef.current = action;
    setIsModalOpen(true);
  };

  const toggleMask = () => {
    if (isMasked) {
      // Trying to unmask -> require password
      verifyAndExecute(() => setIsMasked(false));
    } else {
      // Trying to mask -> instant
      setIsMasked(true);
    }
  };

  return (
    <PrivacyContext.Provider value={{ isMasked, toggleMask, verifyAndExecute }}>
      {children}
      <PasswordModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          pendingActionRef.current = null;
        }}
        onSubmit={handlePasswordSubmit}
      />
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
}
