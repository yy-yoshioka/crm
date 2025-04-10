import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import { PageContainer } from '@/app/components/layout/PageContainer';
import { Navbar } from '@/app/components/layout/Navbar';
import { CustomerForm } from '@/app/components/customers/CustomerForm';
import { Button } from '@/app/components/ui/Button';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';

export const metadata: Metadata = {
  title: 'Add New Customer | CRM System',
  description: 'Create a new customer record',
};

async function NewCustomerPageContent() {
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
      title="Add New Customer"
      description="Create a new customer record in the system"
      actions={
        <Link href="/customers">
          <Button variant="outline">Cancel</Button>
        </Link>
      }
    >
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <CustomerForm />
      </div>
    </PageContainer>
  );
}

export default function NewCustomerPage() {
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
        <NewCustomerPageContent />
      </Suspense>
    </>
  );
}
