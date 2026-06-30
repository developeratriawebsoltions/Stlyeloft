import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/forgot-password", "/verify-otp", "/reset-password", "/logo"];

const ROLE_PATHS: Record<string, string[]> = {
  "/super-admin": ["super-admin"],
  "/admin": ["admin"],
  "/client": ["client"],
};

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "stlyeloft_secret");

async function getPayload(token: string) {
  const { payload } = await jwtVerify(token, SECRET);
  return payload as { id: string; email: string; role: string };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("stlyeloft_token")?.value;

  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"));

  if (isPublic && token) {
    try {
      const payload = await getPayload(token);
      return NextResponse.redirect(new URL(`/${payload.role}/dashboard`, request.url));
    } catch {
      // invalid token — let through to login
    }
  }

  if (isPublic) return NextResponse.next();

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const payload = await getPayload(token);

    for (const [prefix, allowedRoles] of Object.entries(ROLE_PATHS)) {
      if (pathname.startsWith(prefix)) {
        if (!allowedRoles.includes(payload.role)) {
          return NextResponse.redirect(new URL(`/${payload.role}/dashboard`, request.url));
        }
        break;
      }
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|api).*)",
};
