import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const isAuthenticated = !!req.auth;
  const { pathname } = req.nextUrl;

  if (isAuthenticated && pathname === "/") {
    return NextResponse.redirect(new URL("/chat", req.url));
  }

  const isProtected =
    pathname.startsWith("/chat") || pathname.startsWith("/settings");

  if (isProtected && !isAuthenticated) {
    const signInUrl = new URL("/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/", "/chat/:path*", "/settings/:path*"],
};
