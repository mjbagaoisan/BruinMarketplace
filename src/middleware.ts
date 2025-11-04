import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Require authentication for all routes under /dashboard
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token;
        }
        return true;
      },
    },
  }
);

// Configure which routes to protect
export const config = {
  matcher: [
    // Protect all dashboard routes
    '/dashboard/:path*',
    // Add other protected routes here
  ],
};
