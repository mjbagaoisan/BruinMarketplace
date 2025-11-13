import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Middleware logic runs after authorization check
    console.log('Middleware running for:', req.nextUrl.pathname);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Must return true to allow access, false to redirect to signIn page
        const isAuthenticated = !!token;
        console.log('Auth check:', req.nextUrl.pathname, 'Authenticated:', isAuthenticated);
        return isAuthenticated;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/home/:path*',
    '/listings/:path*',
    '/profile/:path*',
    '/settings/:path*',
  ],
};
