'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';
import { CartProvider } from '@/contexts/CartContext';
import { ToastProvider } from '@/components/ui/toast';

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <ToastProvider>{children}</ToastProvider>
      </CartProvider>
    </SessionProvider>
  );
}
