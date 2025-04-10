import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/app/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/app/components/layout/PageContainer';
import { Navbar } from '@/app/components/layout/Navbar';
import { Button } from '@/app/components/ui/Button';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';

export const metadata: Metadata = {
  title: 'Dashboard | Customer Management CRM',
  description: 'View your dashboard with key metrics and recent customers',
};

async function DashboardContent() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user data
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  // Fetch summary stats
  const { data: customerStats } = await supabase
    .from('customers')
    .select('status', { count: 'exact' })
    .match({ status: 'active' });

  const { data: pendingCustomers } = await supabase
    .from('customers')
    .select('status', { count: 'exact' })
    .match({ status: 'pending' });

  const { data: inactiveCustomers } = await supabase
    .from('customers')
    .select('status', { count: 'exact' })
    .match({ status: 'inactive' });

  // Fetch latest customers
  const { data: recentCustomers } = await supabase
    .from('customers')
    .select('id, name, email, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  const activeCount = customerStats?.length || 0;
  const pendingCount = pendingCustomers?.length || 0;
  const inactiveCount = inactiveCustomers?.length || 0;
  const totalCount = activeCount + pendingCount + inactiveCount;

  return (
    <div className="space-y-8">
      {/* Welcome message */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome{userData?.role ? `, ${userData.role}` : ''}
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Here&apos;s an overview of your customer management system
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Customers
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {totalCount}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/customers"
                className="font-medium text-blue-700 hover:text-blue-900 dark:text-blue-500 dark:hover:text-blue-300"
              >
                View all
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Active Customers
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {activeCount}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600 dark:text-green-400">
                      {totalCount > 0 && (
                        <span className="text-xs">
                          {Math.round((activeCount / totalCount) * 100)}%
                        </span>
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/customers?status=active"
                className="font-medium text-blue-700 hover:text-blue-900 dark:text-blue-500 dark:hover:text-blue-300"
              >
                View active
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Pending Customers
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {pendingCount}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                      {totalCount > 0 && (
                        <span className="text-xs">
                          {Math.round((pendingCount / totalCount) * 100)}%
                        </span>
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/customers?status=pending"
                className="font-medium text-blue-700 hover:text-blue-900 dark:text-blue-500 dark:hover:text-blue-300"
              >
                View pending
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gray-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Inactive Customers
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {inactiveCount}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-gray-600 dark:text-gray-400">
                      {totalCount > 0 && (
                        <span className="text-xs">
                          {Math.round((inactiveCount / totalCount) * 100)}%
                        </span>
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/customers?status=inactive"
                className="font-medium text-blue-700 hover:text-blue-900 dark:text-blue-500 dark:hover:text-blue-300"
              >
                View inactive
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent customers */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Recent Customers
          </h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentCustomers && recentCustomers.length > 0 ? (
            recentCustomers.map(customer => (
              <div key={customer.id} className="px-6 py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/customers/${customer.id}`}
                      className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-400"
                    >
                      {customer.name}
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {customer.email || 'No email'}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${customer.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}
                      ${customer.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : ''}
                      ${customer.status === 'inactive' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : ''}
                    `}
                    >
                      {customer.status.charAt(0).toUpperCase() +
                        customer.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex-shrink-0">
                    <Link href={`/customers/${customer.id}`}>
                      <Button variant="ghost" size="sm">
                        <span className="sr-only">View</span>
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
              No customers yet.{' '}
              <Link
                href="/customers/new"
                className="text-blue-600 dark:text-blue-500 hover:underline"
              >
                Add a customer
              </Link>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="text-sm">
            <Link
              href="/customers"
              className="font-medium text-blue-700 hover:text-blue-900 dark:text-blue-500 dark:hover:text-blue-300"
            >
              View all customers
            </Link>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
        <Link href="/customers/new">
          <Button className="w-full sm:w-auto">
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
            Add New Customer
          </Button>
        </Link>
        <Link href="/customers">
          <Button variant="outline" className="w-full sm:w-auto">
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
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            View All Customers
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <PageContainer>
        <Suspense
          fallback={<LoadingSpinner size="lg" className="mx-auto my-12" />}
        >
          <DashboardContent />
        </Suspense>
      </PageContainer>
    </>
  );
}
