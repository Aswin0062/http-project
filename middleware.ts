import { NextRequestWithAuth, withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/','/login','/api/users/register'];

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req: NextRequestWithAuth) {
    const { nextUrl } = req;
    const isAuthenticated = !!req.nextauth.token;
    if (isAuthenticated && nextUrl.pathname === '/')
      return Response.redirect(new URL('/search', req.url));
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { nextUrl } = req;
        const isAuthenticated = !!token;
        const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname);
        return isPublicRoute || isAuthenticated;
      }
    },
  },
)

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};