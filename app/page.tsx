import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  // Redirect to dashboard if authenticated, otherwise to login page
  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
  
  // This component won't render as we always redirect
  return null;
}