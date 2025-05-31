
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get('merendaInteligenteAuth')?.value === 'true';
  const { pathname } = request.nextUrl;

  // If trying to access login page while authenticated, redirect to dashboard
  if (isAuthenticated && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If trying to access protected routes while not authenticated, redirect to login
  if (!isAuthenticated && pathname.startsWith('/app')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Special handling for root path if not an API call or internal Next.js path
  if (pathname === '/' && !isAuthenticated && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
     return NextResponse.redirect(new URL('/login', request.url));
  }
  if (pathname === '/' && isAuthenticated && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }


  return NextResponse.next();
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
    '/', // Match root path
  ],
};
