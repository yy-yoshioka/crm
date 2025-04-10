'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/app/components/ui/Button';
import { PageContainer } from '@/app/components/layout/PageContainer';
import { Navbar } from '@/app/components/layout/Navbar';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function NewCustomerError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('New customer page error:', error);
  }, [error]);

  return (
    <>
      <Navbar />
      <PageContainer
        title="Error"
        description="There was a problem loading the new customer form"
      >
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We encountered an error while trying to load the new customer
              form.
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={reset}>Try again</Button>
              <Link href="/customers">
                <Button variant="outline">Back to customers</Button>
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
