import { auth } from "~/server/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user;

  // For protected routes, require authentication
  if (!isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js authentication API routes)
     * - auth/error (authentication error page)
     * - login (login page)
     * - signup (signup page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     *
     * This means middleware will run on:
     * - / (root - dashboard, requires authentication)
     * - /api/* (except /api/auth/*)
     * - Any other custom routes you add
     */
    "/((?!api/auth|auth/error|login|signup|_next/static|_next/image|favicon.ico).*)",
  ],
};
