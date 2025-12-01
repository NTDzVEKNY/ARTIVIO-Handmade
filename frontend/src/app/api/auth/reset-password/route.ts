import { NextResponse } from 'next/server';
import { db } from '@/app/api/_lib/mockData';
import { verifyOtp, clearOtp } from '@/app/api/_lib/otpStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, newPassword, confirmPassword } = body;

    // 1. Kiểm tra các trường
    if (!email || !code || !newPassword || !confirmPassword) {
      return NextResponse.json({ message: 'Vui lòng điền đầy đủ thông tin.' }, { status: 400 });
    }

    // 2. Kiểm tra mật khẩu mới có khớp không
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ message: 'Mật khẩu mới không khớp.' }, { status: 400 });
    }

    // 3. Xác thực OTP
    if (!verifyOtp(email, code)) {
      return NextResponse.json({ message: 'Mã xác thực không hợp lệ hoặc đã hết hạn.' }, { status: 400 });
    }

    // 4. Tìm và cập nhật mật khẩu cho user
    const userIndex = db.users.findIndex((user) => user.email === email);
    if (userIndex === -1) {
      // Trường hợp này hiếm khi xảy ra nếu đã check ở bước forgot-password
      return NextResponse.json({ message: 'Email không tồn tại.' }, { status: 404 });
    }

    db.users.updatePassword(userIndex, newPassword); // Cập nhật mật khẩu (trong thực tế cần hash)
    clearOtp(email); // Xóa OTP đã sử dụng

    return NextResponse.json({ message: 'Mật khẩu đã được đặt lại thành công.' }, { status: 200 });

  } catch (error) {
    console.error('Reset Password API error:', error);
    return NextResponse.json({ message: 'Lỗi không xác định từ server' }, { status: 500 });
  }
}