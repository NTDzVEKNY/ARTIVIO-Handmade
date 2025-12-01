'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import VerificationCodeForm from '@/components/auth/VerificationCodeForm';

type AuthView = 'login' | 'signup' | 'verify' | 'forgotPassword' | 'resetPassword';

function AuthFlow() {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get('mode');
  const router = useRouter();

  // State để quản lý màn hình hiển thị: login, signup, hoặc verify
  const [view, setView] = useState<AuthView>(modeParam === 'signup' ? 'signup' : 'login');
  // State để lưu email cho bước xác thực
  const [emailForVerification, setEmailForVerification] = useState<string>('');

  useEffect(() => {
    // Đồng bộ state 'view' với URL param khi người dùng điều hướng (ví dụ: nhấn nút back/forward của trình duyệt)
    setView(modeParam === 'signup' ? 'signup' : 'login');
  }, [modeParam]);

  const isLogin = view === 'login';
  const isSignup = view === 'signup';
  const isVerify = view === 'verify';
  const isForgotPassword = view === 'forgotPassword';
  const isResetPassword = view === 'resetPassword';

  const authProps = {
    title: 'Đăng nhập',
    subtitle: 'Vui lòng đăng nhập vào tài khoản của bạn',
    imageOnLeft: isLogin,
    bottomNote: isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?',
    bottomLinkText: isLogin ? 'Đăng ký' : 'Đăng nhập',
    bottomLinkHref: isLogin ? '/auth?mode=signup' : '/auth?mode=login',
  };

  const handleLoginSuccess = () => {
    // Sau khi đăng nhập thành công, chuyển hướng về trang chủ
    router.push('/');
  };

  const handleRegisterSuccess = (email: string) => {
    setEmailForVerification(email);
    setView('verify');
  };

  const handleVerifySuccess = () => {
    alert('Xác thực tài khoản thành công! Vui lòng đăng nhập.');
    router.push('/auth?mode=login');
    setView('login');
  };

  const handleForgotPasswordSuccess = (email: string) => {
    setEmailForVerification(email);
    setView('resetPassword');
  };

  const handleResetPasswordSuccess = () => {
    alert('Mật khẩu đã được đặt lại thành công! Vui lòng đăng nhập với mật khẩu mới.');
    router.push('/auth?mode=login');
    setView('login');
  };

  const handleResendCode = async () => {
    // Gọi lại API forgot-password để gửi lại mã OTP
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailForVerification }),
      });
    } catch (error) {
      console.error("Failed to resend code:", error);
    }
  };

  // Cập nhật lại tiêu đề cho màn hình xác thực
  if (isSignup) {
    authProps.title = 'Tạo tài khoản';
    authProps.subtitle = 'Vui lòng nhập các thông tin dưới đây để đăng ký tài khoản mới';
  } else if (isVerify) {
    authProps.title = 'Xác thực tài khoản';
    authProps.subtitle = `Nhập mã xác thực đã được gửi đến ${emailForVerification}`;
    // Sửa lỗi: Hiển thị lại đúng ghi chú và link cho màn hình xác thực
    authProps.bottomNote = 'Đã có tài khoản?';
    authProps.bottomLinkText = 'Đăng nhập';
  } else if (isForgotPassword) {
    authProps.title = 'Quên mật khẩu';
    authProps.subtitle = 'Nhập email của bạn để nhận mã đặt lại mật khẩu';
    authProps.bottomNote = 'Nhớ mật khẩu?';
    authProps.bottomLinkText = 'Đăng nhập';
    authProps.bottomLinkHref = '/auth?mode=login'; // Giữ nguyên link để AuthLayout xử lý
  } else if (isResetPassword) {
    authProps.title = 'Đặt lại mật khẩu';
    authProps.subtitle = 'Tạo mật khẩu mới cho tài khoản của bạn';
    authProps.bottomNote = '';
    authProps.bottomLinkText = ''; // Thêm dòng này để ẩn link
    authProps.bottomLinkHref = '';  // Thêm dòng này để đảm bảo an toàn
  }

  return (
    <AuthLayout
      {...authProps}
      // Ghi đè hành vi của link ở chân form
      // Nếu là màn hình quên mật khẩu, chúng ta sẽ dùng onClick thay vì href
      onBottomLinkClick={isForgotPassword ? () => setView('login') : (isVerify ? () => setView('login') : undefined)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          // Hiệu ứng trượt ngang đơn giản
          initial={{
            opacity: 0,
            x: authProps.imageOnLeft ? 30 : -30, // Trượt từ phía ngược lại của ảnh
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {isLogin && (
            <LoginForm
              onLoginSuccess={handleLoginSuccess}
              onForgotPasswordClick={() => setView('forgotPassword')}
            />
          )}
          {isSignup && <SignupForm onRegisterSuccess={handleRegisterSuccess} />}
          {isVerify && (
            <VerificationCodeForm
              email={emailForVerification}
              onBack={() => setView('signup')}
              onVerifySuccess={handleVerifySuccess}
            />
          )}
          {isForgotPassword && <ForgotPasswordForm onSuccess={handleForgotPasswordSuccess} />}
          {isResetPassword && (
            <ResetPasswordForm
              email={emailForVerification}
              onSuccess={handleResetPasswordSuccess}
              onResendCode={handleResendCode}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </AuthLayout>
  );
}


export default function AuthPage() {
  return (
    <div
      className="min-h-screen font-sans"
      style={{ backgroundColor: '#F7F1E8', color: '#3F2E23' }}
    >
      <Header />
      <Suspense
        fallback={
          <div
            className="min-h-screen flex items-center justify-center"
            style={{ backgroundColor: '#F7F1E8' }}
          >
            Đang tải...
          </div>
        }
      >
        <AuthFlow />
      </Suspense>
      <Footer />
    </div>
  );
}