import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/*
AI-Assisted Code

Prompt: What are the best practices for Next.js middleware route matching patterns 
for protected routes?

Additional Notes: I used AI to understand the Next.js middleware docs and figure 
out which routes need protection. It helped me set up the matcher config to make 
sure all user pages require auth.
*/
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
