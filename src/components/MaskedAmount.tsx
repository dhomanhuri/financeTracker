'use client';

import { useState, useEffect } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { usePrivacy } from '@/context/PrivacyContext';

interface MaskedAmountProps {
  amount: number;
  className?: string;
  prefix?: string;
}

export default function MaskedAmount({ amount, className = "", prefix = "Rp " }: MaskedAmountProps) {
  const { isMasked: globalIsMasked, verifyAndExecute } = usePrivacy();
  const [isLocallyUnmasked, setIsLocallyUnmasked] = useState(false);

  // If global mask is re-enabled, reset local unmask
  useEffect(() => {
    if (globalIsMasked) {
      setIsLocallyUnmasked(false);
    }
  }, [globalIsMasked]);

  const isVisible = !globalIsMasked || isLocallyUnmasked;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent clicks (like row selection)
    
    if (isVisible) {
      // If currently visible, just mask it locally (if global is masked)
      // If global is unmasked, this button effectively does nothing or re-masks just this?
      // Requirement: "bisa di buka satu persatu"
      // If global is unmasked, everything is visible.
      // If global is masked, we can unmask locally.
      setIsLocallyUnmasked(false);
    } else {
      // Trying to unmask -> require password
      verifyAndExecute(() => setIsLocallyUnmasked(true));
    }
  };

  // Logic:
  // If global is unmasked -> Show Value (user can't mask individually if global is open? Or maybe they can? Let's assume global overrides)
  // Actually, if global is unmasked, everything is open.
  // If global is masked, everything is masked by default, but can be locally unmasked.

  const displayValue = isVisible 
    ? `${prefix}${amount.toLocaleString('id-ID')}`
    : '••••••••••';

  return (
    <span className={`inline-flex items-center gap-2 group cursor-pointer ${className}`} onClick={handleToggle}>
      <span className={isVisible ? '' : 'tracking-widest font-mono'}>
        {displayValue}
      </span>
    </span>
  );
}
