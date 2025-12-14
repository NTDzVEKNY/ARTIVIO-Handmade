'use client';

import React, { useState } from 'react';

interface VerificationCodeFormProps {
  email: string;
  onBack: () => void;
}

export default function VerificationCodeForm({ email, onBack }: VerificationCodeFormProps) {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Gọi API xác thực mã OTP
    alert(`TODO: Xác thực mã "${code}" cho email ${email}`);
  };

  return (
    <div className="animate-fade-in">
      <p className="text-sm text-gray-600 mb-4">
        Một mã xác thực đã được gửi đến địa chỉ email <strong className="font-medium text-gray-800">{email}</strong>. Vui lòng nhập mã vào ô bên dưới.
      </p>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="verification-code" className="text-sm block mb-1" style={{ color: '#3F2E23' }}>Mã xác thực</label>
          <input
            id="verification-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            type="text"
            placeholder="Nhập mã 6 chữ số"
            className="w-full px-4 py-3 rounded-lg border text-center tracking-[0.5em]"
            style={{ borderColor: '#E8D5B5', backgroundColor: '#FFF8F0', color: '#3F2E23' }}
          />
        </div>
        <button type="submit" className="w-full py-3 rounded-lg font-semibold" style={{ backgroundColor: '#D96C39', color: '#FFF8F0' }}>Xác nhận</button>
        <button type="button" onClick={onBack} className="w-full text-sm text-gray-600 hover:underline">Quay lại</button>
      </form>
    </div>
  );
}