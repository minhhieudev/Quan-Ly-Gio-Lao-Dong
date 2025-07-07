import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { connectToDB } from "@mongodb";
import User from "@models/User";
import MaNgach from "@models/MaNgach";
import Khoa from "@models/Khoa";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      async authorize(credentials, req) {
        if (!credentials.email || !credentials.password) {
          throw new Error("Invalid email or password");
        }

        await connectToDB();

        const user = await User.findOne({ email: credentials.email });

        if (!user || !user?.password) {
          throw new Error("Invalid email or password");
        }

        const isMatch = await compare(credentials.password, user.password);

        if (!isMatch) {
          throw new Error("Invalid password");
        }

        return user;
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role; // Add role to token
        token._id = user._id.toString(); // Add _id to token
      }
      return token;
    },
    async session({ session, token }) {
      const mongodbUser = await User.findOne({ email: session.user.email });

      if (mongodbUser) {
        session.user._id = mongodbUser._id.toString();

        // Create a new object without the password
        const { password, ...userWithoutPassword } = mongodbUser._doc;
        session.user = { ...session.user, ...userWithoutPassword };

        // Lấy thông tin ngạch cho người dùng
        const maNgachInfo = await MaNgach.findOne({ maNgach: mongodbUser.maNgach });
        if (maNgachInfo) {
          session.user.maNgachInfo = maNgachInfo;
        }

        // Lấy tên khoa từ bảng Khoa thông qua maKhoa
        if (mongodbUser.maKhoa) {
          const khoaInfo = await Khoa.findOne({ maKhoa: mongodbUser.maKhoa });
          if (khoaInfo) {
            session.user.tenKhoa = khoaInfo.tenKhoa;
          }
        }
      }

      return session;
    },
  },
});

export { handler as GET, handler as POST };
