import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/app/api/_lib/mockData";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json"},
        });

        const loginResponse = await res.json();

        if (!res.ok) {
            throw new Error(loginResponse.error)
        }

        // Nếu thành công, trả về đối tượng user bao gồm cả role
        return {
            id: loginResponse.id.toString(),
            name: loginResponse.name,
            email: loginResponse.email,
            role: loginResponse.role,
            apiAccessToken: loginResponse.token,
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) {
        // Không cho phép đăng nhập nếu nhà cung cấp không trả về email
        return false;
      }

      if (account?.provider === "credentials") {
            return true;
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
    async jwt({ token, user, account })
    {
        // Lần đầu đăng nhập (Sign In), tham số `user` và `account` sẽ có dữ liệu
        if (user && account) {
            if (account.provider === "credentials") {
                // Lấy role và accessToken từ object mà hàm authorize() trả về
                token.role = (user as any).role;

                const apiAccessToken = (user as any).apiAccessToken;
                token.apiAccessToken = apiAccessToken;

            } else {
                token.role = (user as any).role;
            }
        }
        return token;
    },
    async session({ session, token, user }) {
      // Thêm thông tin từ token vào đối tượng session để client có thể sử dụng
        console.log("tk: ");
        console.log(token);
      if (session.user) {
        // Gán role từ token vào session.user
        (session.user as any).role = token.role;
      }
      console.log("ss: ");
      console.log(session);
      return session;
    },
  },
});

export { handler as GET, handler as POST };