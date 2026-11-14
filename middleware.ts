import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const role = token?.role;

  const toSignIn = (path: string) => {
    const url = new URL(path, req.url);
    url.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(url);
  };

  if (pathname.startsWith("/api/admin")) {
    if (role !== "admin") {
      return NextResponse.json(
        { error: token ? "Admin access required" : "Sign in required" },
        { status: token ? 403 : 401 }
      );
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/signin") {
      return role === "admin" ? NextResponse.redirect(new URL("/admin", req.url)) : NextResponse.next();
    }
    return role === "admin" ? NextResponse.next() : toSignIn("/admin/signin");
  }

  if (pathname.startsWith("/student")) {
    if (role === "admin") return NextResponse.redirect(new URL("/admin", req.url));
    return role === "student" ? NextResponse.next() : toSignIn("/auth/signin");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/student/:path*"],
};
