'use client';

import { ReactNode } from 'react';
import { ToastProvider } from '@/app/components/ui/Toast';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return <ToastProvider>{children}</ToastProvider>;
}
