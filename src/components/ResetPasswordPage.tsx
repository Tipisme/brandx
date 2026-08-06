import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';

interface ResetPasswordPageProps {
  email: string;
  token: string;
  language: 'vi' | 'en';
  onBackToLogin: () => void;
}

export default function ResetPasswordPage({ email, token, language, onBackToLogin }: ResetPasswordPageProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccess(false);

    if (newPassword.length < 6) {
      setErrorMsg(
        language === 'vi'
          ? 'Mật khẩu phải có ít nhất 6 ký tự.'
          : 'Password must be at least 6 characters long.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg(
        language === 'vi'
          ? 'Mật khẩu xác nhận không trùng khớp.'
          : 'Passwords do not match.'
      );
      return;
    }

    setLoading(true);
    try {
      let response;
      let data;
      let isOk = false;

      // Try calling the preferred /vi/api/reset-password endpoint first
      try {
        response = await fetch(`https://admin.hdslaw.vn/vi/api/reset-password/${encodeURIComponent(email)}/${token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            new_password: newPassword,
            new_password_confirmation: confirmPassword,
          }),
        });
        data = await response.json().catch(() => null);
        if (response.ok) {
          isOk = true;
        }
      } catch (err) {
        console.error('Error with preferred reset endpoint:', err);
      }

      // Fallback to /api/reset-password if the first request fails
      if (!isOk) {
        try {
          response = await fetch(`https://admin.hdslaw.vn/api/reset-password/${encodeURIComponent(email)}/${token}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
          },
          body: JSON.stringify({
            new_password: newPassword,
            new_password_confirmation: confirmPassword,
          }),
        });
        data = await response.json().catch(() => null);
        if (response && response.ok) {
          isOk = true;
        }
        } catch (fallbackErr) {
          console.error('Fallback reset endpoint also failed:', fallbackErr);
        }
      }

      if (isOk && response) {
        setSuccess(true);
        // Start countdown to redirect
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              onBackToLogin();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        const errorDetail = data?.message || data?.error || '';
        setErrorMsg(
          language === 'vi'
            ? `Cập nhật mật khẩu thất bại: ${errorDetail || 'Mã xác thực không hợp lệ hoặc đã hết hạn.'}`
            : `Failed to reset password: ${errorDetail || 'Invalid or expired reset token.'}`
        );
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      setErrorMsg(
        language === 'vi'
          ? 'Có lỗi xảy ra trong quá trình gửi yêu cầu. Vui lòng thử lại sau.'
          : 'An error occurred. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-slate-50/50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/40 via-transparent to-transparent pointer-events-none" />
      
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-100/40 relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

        {success ? (
          <div className="text-center py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
              <ShieldCheck className="w-8 h-8 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {language === 'vi' ? 'Đặt lại mật khẩu thành công' : 'Password Reset Successful'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {language === 'vi'
                  ? 'Mật khẩu mới của bạn đã được cập nhật thành công. Bây giờ bạn có thể đăng nhập bằng thông tin mới.'
                  : 'Your new password has been set successfully. You can now log in with your new credentials.'}
              </p>
              <p className="text-xs text-orange-500 font-semibold animate-pulse pt-2">
                {language === 'vi'
                  ? `Hệ thống sẽ tự động chuyển về trang chủ và mở Đăng nhập sau ${countdown} giây...`
                  : `Automatically returning to homepage and opening login in ${countdown} seconds...`}
              </p>
            </div>

            <button
              onClick={onBackToLogin}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase py-3.5 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {language === 'vi' ? 'Quay lại Đăng nhập' : 'Back to Login'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3" />
                {language === 'vi' ? 'Bảo mật tài khoản' : 'Account Security'}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {language === 'vi' ? 'Đặt lại mật khẩu mới' : 'Reset New Password'}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'vi'
                  ? 'Nhập mật khẩu mới an toàn cho tài khoản của bạn bên dưới'
                  : 'Enter a strong, secure new password for your account below'}
              </p>
            </div>

            {/* Read-only verification info */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-500">
                <span>{language === 'vi' ? 'Tài khoản:' : 'Account:'}</span>
                <strong className="text-slate-800 break-all">{email}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>{language === 'vi' ? 'Mã xác thực:' : 'Token:'}</span>
                <span className="text-slate-400 font-mono truncate max-w-[180px]" title={token}>
                  {token}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-xl text-xs font-medium flex items-start gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Password Input */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {language === 'vi' ? 'Mật khẩu mới' : 'New Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={language === 'vi' ? 'Ít nhất 6 ký tự' : 'Min 6 characters'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {language === 'vi' ? 'Nhập lại mật khẩu mới' : 'Confirm New Password'}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={language === 'vi' ? 'Trùng khớp mật khẩu trên' : 'Repeat new password'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs uppercase py-3.5 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                {language === 'vi' ? 'Cập nhật mật khẩu' : 'Update Password'}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                onClick={onBackToLogin}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer transition-colors flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {language === 'vi' ? 'Quay lại Đăng nhập' : 'Back to Login'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
