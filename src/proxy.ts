import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const isAuthenticated = !!req.auth;
  if (isAuthenticated && req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/chat", req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/"],
};
