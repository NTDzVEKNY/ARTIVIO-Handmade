"use client";

import { axiosAuth } from "@/lib/axios";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

const useAxiosAuth = () => {
    const { data: session } = useSession();

    useEffect(() => {
        const requestIntercept = axiosAuth.interceptors.request.use(
            (config) => {
                // Nếu session tồn tại và chưa có header Authorization
                if (!config.headers["Authorization"] && session?.user?.apiAccessToken) {
                    config.headers["Authorization"] = `Bearer ${session.user.apiAccessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response Interceptor: Xử lý lỗi 401
        const responseIntercept = axiosAuth.interceptors.response.use(
            (response) => response,
            async (error) => {
                // Kiểm tra nếu lỗi là 401 (Unauthorized)
                if (error.response?.status === 401) {
                    console.log("Phiên đăng nhập hết hạn. Đang đăng xuất...");

                    // 2. Thực hiện Logout
                    await signOut({
                        callbackUrl: "/login", // Sau khi logout thì chuyển hướng về trang login
                        redirect: true,        // Bắt buộc chuyển hướng
                    });

                    // Có thể trả về Promise.reject để component biết là request đã fail
                    throw error;
                }

                throw error;
            }
        );

        return () => {
            axiosAuth.interceptors.request.eject(requestIntercept);
            axiosAuth.interceptors.response.eject(responseIntercept);
        };
    }, [session]);

    return axiosAuth;
};

export default useAxiosAuth;