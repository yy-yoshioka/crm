import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import { PageContainer } from '@/app/components/layout/PageContainer';
import { Navbar } from '@/app/components/layout/Navbar';
import { Button } from '@/app/components/ui/Button';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { CustomerStatus } from '@/app/lib/database.types';

interface CustomerDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: CustomerDetailPageProps): Promise<Metadata> {
  const supabase = await createClient();
  const { data: customer } = await supabase
    .from('customers')
    .select('name')
    .eq('id', params.id)
    .single();

  return {
    title: customer
      ? `${customer.name} | Customer Details`
      : 'Customer Details',
    description: 'View customer information and activity',
  };
}

async function CustomerDetailContent({ id }: { id: string }) {
  const supabase = await createClient();

  // Fetch customer data
  const { data: customer, error } = await supabase
    .from('customers')
    .select(
      `
      *,
      created_by_user:users!customers_created_by_fkey(id, email, role)
    `
    )
    .eq('id', id)
    .single();

  if (error || !customer) {
    return notFound();
  }

  // Format date for display
  const formattedCreatedAt = new Date(customer.created_at).toLocaleDateString();
  const formattedUpdatedAt = new Date(customer.updated_at).toLocaleDateString();

  // Status badge styles
  const statusStyles: Record<CustomerStatus, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    pending:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  };

  return (
    <PageContainer
      title={customer.name}
      description="Customer Details"
      actions={
        <div className="flex space-x-4">
          <Link href={`/customers/${id}/edit`}>
            <Button>
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              Edit
            </Button>
          </Link>
          <Link href="/customers">
            <Button variant="outline">Back to Customers</Button>
          </Link>
        </div>
      }
    >
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Customer Information
            </h2>
            <span
              className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-sm font-medium ${statusStyles[customer.status]}`}
            >
              {customer.status.charAt(0).toUpperCase() +
                customer.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Contact Information
            </h3>
            <div className="mt-3 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Name
                </p>
                <p className="mt-1 text-base text-gray-900 dark:text-white">
                  {customer.name}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email
                </p>
                <p className="mt-1 text-base text-gray-900 dark:text-white">
                  {customer.email ? (
                    <a
                      href={`mailto:${customer.email}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {customer.email}
                    </a>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">
                      Not provided
                    </span>
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Phone
                </p>
                <p className="mt-1 text-base text-gray-900 dark:text-white">
                  {customer.phone ? (
                    <a
                      href={`tel:${customer.phone}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {customer.phone}
                    </a>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">
                      Not provided
                    </span>
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Address
                </p>
                <p className="mt-1 text-base text-gray-900 dark:text-white">
                  {customer.address || (
                    <span className="text-gray-500 dark:text-gray-400">
                      Not provided
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Additional Information
            </h3>
            <div className="mt-3 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Created By
                </p>
                <p className="mt-1 text-base text-gray-900 dark:text-white">
                  {customer.created_by_user?.email || (
                    <span className="text-gray-500 dark:text-gray-400">
                      Unknown
                    </span>
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Created Date
                </p>
                <p className="mt-1 text-base text-gray-900 dark:text-white">
                  {formattedCreatedAt}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Last Updated
                </p>
                <p className="mt-1 text-base text-gray-900 dark:text-white">
                  {formattedUpdatedAt}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
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
        <CustomerDetailContent id={params.id} />
      </Suspense>
    </>
  );
}
