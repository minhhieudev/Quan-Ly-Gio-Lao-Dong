import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;


    // Nếu user cố gắng truy cập /admin nhưng không phải admin
    if (path.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/work-hours', req.url));
    }

    // Nếu user đã đăng nhập, điều hướng theo role
    if (path === '/') {
      if (token?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', req.url));
      } else if (token?.role === 'giaovu') {
        return NextResponse.redirect(new URL('/giaovu', req.url));
      } else {
        return NextResponse.redirect(new URL('/work-hours', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: "/",
    },
  }
);

export const config = { 
  matcher: [
    "/",
    "/home/:path*",
    "/work-hours/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/giaovu/:path*"  // Thêm matcher cho routes giaovu
  ]
};
