import { Suspense } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import { PageContainer } from '@/app/components/layout/PageContainer';
import { Navbar } from '@/app/components/layout/Navbar';
import { Button } from '@/app/components/ui/Button';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';

export const metadata: Metadata = {
  title: 'Settings | CRM System',
  description: 'Manage your account settings',
};

async function SettingsPageContent() {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Get user data including role
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  
  const isAdmin = userData?.role === 'admin';
  
  // Sign out function
  async function handleSignOut() {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
  }
  
  return (
    <PageContainer
      title="Account Settings"
      description="Manage your account and preferences"
    >
      <div className="space-y-8">
        {/* Profile section */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Profile Information
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</h4>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.email}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</h4>
                <p className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                  {userData?.role || 'User'}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Created</h4>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(userData?.created_at || user.created_at || '').toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* User management section (admin only) */}
        {isAdmin && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                User Management
              </h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                As an administrator, you can manage other users in the system.
              </p>
              <Button
                variant="outline"
                onClick={() => {/* Future implementation */}}
              >
                Manage Users
              </Button>
            </div>
          </div>
        )}
        
        {/* Dark mode section */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Theme Preferences
            </h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Your theme preference is currently set to match your system settings.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  document.documentElement.classList.remove('dark');
                  localStorage.theme = 'light';
                }}
              >
                Light Mode
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  document.documentElement.classList.add('dark');
                  localStorage.theme = 'dark';
                }}
              >
                Dark Mode
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.removeItem('theme');
                  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                }}
              >
                System Default
              </Button>
            </div>
          </div>
        </div>
        
        {/* Sign out section */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Account Actions
            </h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Sign out of your account or update your password.
            </p>
            <div className="flex space-x-4">
              <form action={handleSignOut}>
                <Button
                  variant="destructive"
                  type="submit"
                >
                  Sign Out
                </Button>
              </form>
              
              <Button
                variant="outline"
                onClick={() => {/* Future implementation */}}
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default function SettingsPage() {
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
        <SettingsPageContent />
      </Suspense>
    </>
  );
}