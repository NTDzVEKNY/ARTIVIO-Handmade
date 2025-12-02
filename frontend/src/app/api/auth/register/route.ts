import { NextResponse } from 'next/server';
import { db } from '@/app/api/_lib/mockData';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { VerificationEmail } from '@/components/emails/VerificationEmail';
import { storeOtp } from '@/app/api/_lib/otpStore';

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { username, email, password, confirmPassword } = body;

		// --- Logic mô phỏng y hệt RegisterService.java ---

		// 1. Kiểm tra các trường bắt buộc
		if (!username || !email || !password || !confirmPassword) {
			return NextResponse.json({ message: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 });
		}

		// 2. Kiểm tra mật khẩu có khớp không
		if (password !== confirmPassword) {
			return NextResponse.json({ message: 'Password và Confirm Password phải giống nhau' }, { status: 400 });
		}

		// 3. Kiểm tra email đã tồn tại chưa
		if (db.users.some((user) => user.email === email)) {
			return NextResponse.json({ message: 'Email đã tồn tại!' }, { status: 409 }); // 409 Conflict
		}

		// 3.5. Kiểm tra username đã tồn tại chưa (Thêm mới)
		if (db.users.some((user) => user.name.toLowerCase() === username.toLowerCase())) {
			return NextResponse.json({ message: 'Tên người dùng đã tồn tại!' }, { status: 409 });
		}

		// 4. Tạo mã OTP và lưu trữ tạm thời
		// LƯU Ý QUAN TRỌNG: Bây giờ chúng ta lưu cả thông tin người dùng cùng với mã OTP
		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const pendingUserData = {
			name: username,
			email: email,
			password: password,
		};
		storeOtp(email, otp, pendingUserData);

		// 5. Gửi email xác thực
		const apiKey = process.env.RESEND_API_KEY;

		// Kiểm tra xem API key có được nạp thành công từ file .env.local không
		if (!apiKey) {
			console.error('Lỗi nghiêm trọng: RESEND_API_KEY không được thiết lập trong file .env.local hoặc next.config.mjs');
			return NextResponse.json({ message: 'Lỗi cấu hình server, không thể gửi email.' }, { status: 500 });
		}
		const resend = new Resend(apiKey);

		try {
			const emailHtml = await render(VerificationEmail({ username, otp }));

			await resend.emails.send({
				from: 'Artivio <onboarding@resend.dev>', // Email mặc định của Resend
				to: [email],
				subject: 'Mã xác thực tài khoản Artivio của bạn',
				html: emailHtml,
			});
		} catch (emailError) {
			console.error('Email sending error:', emailError);
			// Trả về lỗi cụ thể hơn cho frontend
			return NextResponse.json({ message: 'Không thể gửi email xác thực. Vui lòng kiểm tra lại địa chỉ email hoặc thử lại sau.' }, { status: 500 });
		}

		return NextResponse.json({ message: 'Mã xác thực đã được gửi đến email của bạn.' }, { status: 200 });

	} catch (error) {
		console.error('Register API error:', error);
		return NextResponse.json({ message: 'Lỗi không xác định từ server' }, { status: 500 });
	}
}