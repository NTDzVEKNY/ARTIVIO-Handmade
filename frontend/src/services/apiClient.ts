import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =================================================================
// Request Interceptor: Tự động đính kèm token vào mỗi request
// (Sẽ hữu ích cho các module cần xác thực sau này)
// =================================================================
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =================================================================
// Response Interceptor: Xử lý lỗi toàn cục (ví dụ: token hết hạn)
// =================================================================
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized! Redirecting to login...');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jwtToken');
        // Chuyển hướng về trang đăng nhập
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;