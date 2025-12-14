import { NextResponse } from 'next/server';
import { db } from '@/app/api/_lib/mockData';
import { verifyOtp, getVerifiedUserData, clearOtp } from '@/app/api/_lib/otpStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json({ message: 'Vui lòng cung cấp email và mã xác thực.' }, { status: 400 });
    }

    // 1. Xác thực mã OTP
    if (!verifyOtp(email, code)) {
      return NextResponse.json({ message: 'Mã xác thực không hợp lệ hoặc đã hết hạn.' }, { status: 400 });
    }

    // 2. Lấy thông tin người dùng đang chờ
    const userData = getVerifiedUserData(email);
    if (!userData) {
      // Trường hợp hiếm gặp: OTP đúng nhưng không có dữ liệu người dùng
      return NextResponse.json({ message: 'Không tìm thấy thông tin đăng ký. Vui lòng thử lại.' }, { status: 404 });
    }

    // 3. TẠO TÀI KHOẢN MỚI
    const newUser = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      password: userData.password, // Trong thực tế, mật khẩu phải được mã hóa
      role: 'USER' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.users.push(newUser);

    // 4. Xóa OTP đã sử dụng
    clearOtp(email);

    return NextResponse.json({ message: 'Xác thực thành công! Tài khoản của bạn đã được tạo.' }, { status: 201 });
  } catch (error) {
    console.error('Verify OTP API error:', error);
    return NextResponse.json({ message: 'Lỗi không xác định từ server.' }, { status: 500 });
  }
}