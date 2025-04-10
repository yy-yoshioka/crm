import { Suspense } from 'react';
import { Metadata } from 'next';
import { createClient } from '@/app/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CustomerList } from '@/app/components/customers/CustomerList';
import { PageContainer } from '@/app/components/layout/PageContainer';
import { Navbar } from '@/app/components/layout/Navbar';
import { Button } from '@/app/components/ui/Button';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Customers | CRM System',
  description: 'View and manage your customers',
};

// This component handles authentication check
async function CustomersPageContent() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <PageContainer
      title="Customers"
      description="View and manage your customer list"
      actions={
        <Link href="/customers/new">
          <Button>
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Customer
          </Button>
        </Link>
      }
    >
      {/* We use client-side component for data fetching and interaction */}
      <CustomerList />
    </PageContainer>
  );
}

export default function CustomersPage() {
  // We're not using search params directly since the CustomerList component
  // will extract them internally via useSearchParams hook

  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <PageContainer>
            <div className="h-96 flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          </PageContainer>
        }
      >
        <CustomersPageContent />
      </Suspense>
    </>
  );
}
