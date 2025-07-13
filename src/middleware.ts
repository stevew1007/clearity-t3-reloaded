export { auth as middleware } from "~/server/auth";

export const config = {
  matcher: [
    "/((?!api/auth|login|signup|_next/static|_next/image|favicon.ico).*)",
    "/api/eve/:path*",
  ],
};
