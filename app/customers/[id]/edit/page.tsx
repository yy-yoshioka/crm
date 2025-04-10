import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/app/lib/supabase/server';
import { PageContainer } from '@/app/components/layout/PageContainer';
import { Navbar } from '@/app/components/layout/Navbar';
import { CustomerForm } from '@/app/components/customers/CustomerForm';
import { Button } from '@/app/components/ui/Button';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';

interface EditCustomerPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: EditCustomerPageProps): Promise<Metadata> {
  const supabase = await createClient();
  const { data: customer } = await supabase
    .from('customers')
    .select('name')
    .eq('id', params.id)
    .single();

  return {
    title: customer ? `Edit ${customer.name} | CRM System` : 'Edit Customer',
    description: 'Update customer information',
  };
}

async function EditCustomerContent({ id }: { id: string }) {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Fetch customer data
  const { data: customer, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !customer) {
    return notFound();
  }
  
  return (
    <PageContainer
      title={`Edit ${customer.name}`}
      description="Update customer information"
      actions={
        <Link href={`/customers/${id}`}>
          <Button variant="outline">
            Cancel
          </Button>
        </Link>
      }
    >
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <CustomerForm customer={customer} />
      </div>
    </PageContainer>
  );
}

export default function EditCustomerPage({ params }: EditCustomerPageProps) {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <PageContainer>
          <div className="h-96 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </PageContainer>
      }>
        <EditCustomerContent id={params.id} />
      </Suspense>
    </>
  );
}