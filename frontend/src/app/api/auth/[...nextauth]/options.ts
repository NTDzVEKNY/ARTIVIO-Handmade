import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/app/api/_lib/mockData";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const authOptions: NextAuthOptions = {
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
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return null;
                }

                try {
                    const res = await fetch(`${API_URL}/login`, {
                        method: "POST",
                        body: JSON.stringify(credentials),
                        headers: { "Content-Type": "application/json" },
                    });

                    const loginResponse = await res.json();



                    if (!res.ok) {
                        throw new Error(loginResponse.error || "Đăng nhập thất bại");
                    }

                    // Trả về object user
                    return {
                        id: loginResponse.id.toString(),
                        name: loginResponse.name,
                        email: loginResponse.email,
                        role: loginResponse.role,
                        apiAccessToken: loginResponse.token,
                    };
                } catch (error) {
                    console.error("Login error:", error);

                    if (error instanceof Error) {
                        throw new Error(error.message ||"Đăng nhập thất bại");
                    }

                    throw new Error( "Đã xảy ra lỗi không xác định");
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (!user.email) return false;

            if (account?.provider === "credentials") {
                return true;
            }

            // Logic mock DB cho social login
            const userExists = db.users.some((dbUser) => dbUser.email === user.email);

            if (!userExists) {
                console.log(`User ${user.email} does not exist. Creating new user.`);
                const newUser = {
                    id: Date.now(),
                    name: user.name || "New User",
                    email: user.email,
                    password: "",
                    role: "USER" as const,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                db.users.push(newUser);
            }

            return true;
        },
        async jwt({ token, user, account }) {
            if (user && account) {
                // Lưu role vào token
                token.role = (user as any).role;

                // Lưu apiAccessToken nếu là credentials login
                if (account.provider === "credentials") {
                    token.apiAccessToken = (user as any).apiAccessToken;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).apiAccessToken = token.apiAccessToken;
            }
            return session;
        },
    },
    // Thêm secret để mã hóa token (quan trọng cho production)
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login", // Đường dẫn trang login của bạn
    },
};