import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    console.log("Current role:", token?.role); // Thêm log để debug

    // Nếu user cố gắng truy cập /admin nhưng không phải admin
    if (path.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/home', req.url));
    }

    // Nếu user đã đăng nhập và ở trang gốc '/' hoặc '/work-hours', điều hướng theo role
    if (path === '/' || path === '/work-hours') {
      if (token?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', req.url));
      } else {
        return NextResponse.redirect(new URL('/home', req.url));
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
  ]
};
