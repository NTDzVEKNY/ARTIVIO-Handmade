import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/app/api/_lib/mockData";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        // Tìm user trong "cơ sở dữ liệu" mock
        const user = db.users.find(u => u.email === credentials.email);

        // Nếu không tìm thấy user hoặc sai mật khẩu
        if (!user || user.password !== credentials.password) {
          // Trả về null sẽ gây ra lỗi, chúng ta sẽ throw Error để có thông báo rõ ràng
          throw new Error('Tài khoản hoặc mật khẩu không chính xác');
        }

        // Nếu thành công, trả về đối tượng user bao gồm cả role
        return { id: user.id.toString(), name: user.name, email: user.email, role: user.role };
      }
    })
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        // Không cho phép đăng nhập nếu nhà cung cấp không trả về email
        return false;
      }

      // Kiểm tra xem user đã tồn tại trong "cơ sở dữ liệu" mock của chúng ta chưa
      const userExists = db.users.some(dbUser => dbUser.email === user.email);

      if (!userExists) {
        // Nếu user chưa tồn tại, tạo một user mới
        console.log(`User ${user.email} does not exist. Creating new user.`);
        const newUser = {
          id: Date.now(),
          name: user.name || 'New User',
          email: user.email,
          // Người dùng social login không có mật khẩu
          password: '', 
          role: 'USER' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        db.users.push(newUser);
      }

      return true; // Cho phép đăng nhập
    },
    async jwt({ token, user }) {
      // Khi user đăng nhập (lần đầu tiên callback này được gọi), đối tượng `user` sẽ có sẵn.
      // Thêm role vào token.
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      // Thêm thông tin từ token vào đối tượng session để client có thể sử dụng
      if (session.user) {
        // Gán role từ token vào session.user
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };