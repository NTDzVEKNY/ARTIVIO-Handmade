import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8080/api";

export const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// Tạo instance riêng cho Auth để attach interceptors
export const axiosAuth = axios.create({
    baseURL: BASE_URL,
    // headers: { "Content-Type": "application/json" },
});