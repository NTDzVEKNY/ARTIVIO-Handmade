const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * Hàm fetch API chung, có khả năng xử lý nhiều phương thức và kiểu dữ liệu trả về.
 * @param endpoint - Đường dẫn API (ví dụ: '/auth/login')
 * @param options - Các tùy chọn cho hàm fetch (method, headers, body, ...)
 * @returns Promise chứa dữ liệu JSON trả về
 */
export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const response = await fetch(url, {
        ...options,
        headers: defaultHeaders,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Lỗi API: ${response.status}`);
    }

    // Nếu response không có body (ví dụ: status 204), trả về null
    return response.status === 204 ? (null as T) : (response.json() as Promise<T>);
}

