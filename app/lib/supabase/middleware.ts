import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { UserRole } from "../database.types";

// Define route access patterns
const PUBLIC_ROUTES = ['/login', '/signup', '/auth', '/reset-password', '/'];
const ADMIN_ROUTES = ['/admin'];
const MANAGER_ROUTES = ['/settings/users'];

/**
 * Check if the given pathname matches any of the route patterns
 */
function matchesRoutePattern(pathname: string, patterns: string[]): boolean {
  return patterns.some(pattern => pathname.startsWith(pattern));
}

/**
 * Check if the current user role has access to the requested route
 */
async function checkRoleAccess(
  supabase: ReturnType<typeof createServerClient>, 
  user: any, 
  pathname: string
): Promise<boolean> {
  // Public routes are accessible to everyone
  if (matchesRoutePattern(pathname, PUBLIC_ROUTES)) {
    return true;
  }

  // Admin routes require admin role
  if (matchesRoutePattern(pathname, ADMIN_ROUTES)) {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (error || !data) return false;
    return data.role === 'admin';
  }

  // Manager routes require admin or manager role
  if (matchesRoutePattern(pathname, MANAGER_ROUTES)) {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (error || !data) return false;
    return ['admin', 'manager'].includes(data.role as UserRole);
  }

  // All other authenticated routes are accessible to any authenticated user
  return true;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  
  // Handle unauthenticated users
  if (!user) {
    // Allow access to public routes
    if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
      return supabaseResponse;
    }
    
    // Redirect to login for non-public routes
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  
  // For authenticated users, check role-based access
  const hasAccess = await checkRoleAccess(supabase, user, pathname);
  
  // Redirect to unauthorized page if access is denied
  if (!hasAccess) {
    const url = request.nextUrl.clone();
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
