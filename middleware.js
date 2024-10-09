import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

export default withAuth({
  pages: {
    signIn: "/",
  },
  callbacks: {
    async authorized({ req, token }) {
      if (!token) return false; 

      if (req.nextUrl.pathname.startsWith('/admin')) {
        return token.role === 'admin';
      }
      
      return true;
    },
  },
});

export const config = { 
  matcher: [
    "/work-hours/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ]
};
