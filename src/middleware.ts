import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/home/:path*',
    '/listings/:path*',
    '/profile/:path*',
    '/settings/:path*',
  ],
};
