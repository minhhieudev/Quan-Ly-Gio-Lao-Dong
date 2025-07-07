import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Ngăn admin truy cập vào /work-hours
    if (path === '/work-hours' && token?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', req.url)); // Chuyển hướng admin đến /admin
    }

    // Nếu người dùng là admin và đang ở đường dẫn '/'
    if (path === '/' && token?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }

    // Nếu người dùng cố gắng truy cập /admin nhưng không phải admin hoặc khoa
    if (path.startsWith('/admin') && token?.role !== 'admin' && token?.role !== 'khoa') {
      return NextResponse.redirect(new URL('/work-hours', req.url));
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
