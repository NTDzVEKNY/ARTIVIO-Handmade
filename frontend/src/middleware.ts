import { NextResponse } from 'next/server';
import { withAuth, type NextRequestWithAuth } from 'next-auth/middleware';

export default withAuth(
  // `withAuth` augments the `Request` with the user's token.
  function middleware(request: NextRequestWithAuth) {
    const { pathname } = request.nextUrl;
    // The token is now available from NextAuth
    const token = request.nextauth.token;

    const isAuth = !!token;
    const isAdmin = isAuth && token?.role === 'ADMIN';

    // Helper function to create a redirect response
    const redirect = (url: string) => NextResponse.redirect(new URL(url, request.url));

    // Rule 1: Bảo vệ các trang của Admin. Đây là ưu tiên cao nhất.
    if (pathname.startsWith('/admin')) {
      if (!isAdmin) {
        // Nếu không phải admin, luôn chuyển hướng về trang đăng nhập.
        return redirect('/login');
      }
      // Nếu là admin, cho phép truy cập và kết thúc xử lý tại đây.
      return NextResponse.next();
    }

    // Rule 2: Xử lý các trường hợp cho người dùng đã đăng nhập ở các trang công khai.
    if (isAuth) {
      // Nếu người dùng đã đăng nhập truy cập trang login, chuyển hướng họ đi.
      if (pathname.startsWith('/login')) {
        return redirect(isAdmin ? '/admin' : '/');
      }
      // Nếu admin truy cập trang chủ, chuyển hướng đến trang admin.
      if (isAdmin && pathname === '/') {
        return redirect('/admin');
      }
    }

    // Rule 3: Nếu không rơi vào các quy tắc trên (VD: khách hoặc user truy cập trang công khai), cho phép đi tiếp.
    return NextResponse.next();
  },
  {
    callbacks: {
      // Return `true` to always run the middleware function.
      // The logic inside the middleware function will handle authorization.
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: [
    // Chạy middleware trên tất cả các đường dẫn ngoại trừ các file tĩnh và API
    '/((?!api|_next/static|_next/image|favicon.ico|artivio-logo.png).*)',
  ],
};