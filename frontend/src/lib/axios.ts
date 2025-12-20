import axios from "axios";

// Sử dụng biến môi trường đã được định nghĩa trong file .env.local
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// Instance này dành cho các request cần xác thực, sẽ được hook useAxiosAuth gắn interceptor vào
export const axiosAuth = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});