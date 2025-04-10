import { createClient } from '@/app/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { handleAuthStateChange } from '@/app/lib/auth';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const cookieStore = cookies();
    const supabase = createClient();
    
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.user) {
      // Create or update user in our database with role information
      await handleAuthStateChange(data.user);
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin);
}