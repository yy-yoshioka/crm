import { createClient } from '../lib/supabase/server';
import AuthProvider from '../components/providers/AuthProvider';
import { UserRole } from '../lib/database.types';

/**
 * Server component that fetches the initial user and role data
 * and passes it to the client-side AuthProvider
 */
export default async function AuthContext({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Get the user from the server-side session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get the user's role from the database
  let role: UserRole | null = null;

  if (user) {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      role = data.role as UserRole;
    }
  }

  return (
    <AuthProvider initialUser={user} initialRole={role}>
      {children}
    </AuthProvider>
  );
}
