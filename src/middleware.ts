
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get('merendaInteligenteAuth')?.value === 'true';
  const { pathname } = request.nextUrl;

  // Define protected paths (actual URL paths, not filesystem paths using route groups)
  const protectedPaths = ['/dashboard', '/stock', '/deliveries', '/consumption', '/forecasting', '/reports'];
  const isProtectedRoute = protectedPaths.some(p => pathname.startsWith(p));

  const isAuthRoute = pathname.startsWith('/login');
  const isRootRoute = pathname === '/';

  if (isAuthenticated) {
    // User is authenticated
    if (isAuthRoute) {
      // Authenticated user trying to access login page, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (isRootRoute) {
      // Authenticated user trying to access root, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // For other authenticated scenarios (e.g., accessing a protected path like /dashboard, /stock), allow access
    return NextResponse.next();
  } else {
    // User is NOT authenticated
    if (isProtectedRoute || isRootRoute) {
      // Unauthenticated user trying to access a protected route or root, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // For other routes (like /login itself, or other public pages if any were defined), allow access
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images folder)
     * - . (files with extensions, e.g. manifest.json, robots.txt in public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.).*)',
  ],
};
