import { NextRequest, NextResponse } from "next/server";

const ADMIN_SESSION_COOKIE = "myalongside-admin-session";
const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

/**
 * Route guard: every page render requires a live server-side admin session.
 * The cookie holds only an opaque token; validity (expiry, revocation, live
 * ADMIN role/ban status) is decided by the backend AdminSession table.
 */
export async function proxy(req: NextRequest) {
  const sessionToken = req.cookies.get(ADMIN_SESSION_COOKIE)?.value ?? null;
  const { pathname } = req.nextUrl;

  const isLoginRoute = pathname === "/login";
  const isAuthApiRoute = pathname.startsWith("/api/auth/");
  const isStaticAsset = pathname.startsWith("/_next/") || pathname === "/favicon.ico";

  if (isAuthApiRoute || isStaticAsset) {
    return NextResponse.next();
  }

  if ((!sessionToken || sessionToken.length > 128) && !isLoginRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!sessionToken || sessionToken.length > 128) {
    // On /login without a usable cookie: let the login page render.
    return NextResponse.next();
  }

  // Resolve the opaque token server-side. This enforces revocation on every
  // navigation: a revoked/expired session bounces to /login immediately.
  const resolveResponse = await fetch(`${backendUrl}/api/auth/admin/session`, {
    method: "GET",
    headers: { "x-admin-session": sessionToken },
    cache: "no-store",
  }).catch(() => null);

  if (!resolveResponse?.ok) {
    const response = isLoginRoute
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete(ADMIN_SESSION_COOKIE);
    return response;
  }

  const payload = (await resolveResponse.json().catch(() => null)) as {
    user?: { role?: string };
  } | null;

  if (payload?.user?.role !== "ADMIN") {
    const response = isLoginRoute
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete(ADMIN_SESSION_COOKIE);
    return response;
  }

  if (isLoginRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
