'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { DeumahHeader } from '@/components/deumah/deumah-header';
import { Footer } from '@/components/layout/Footer';
import { Link, useRouter } from '@/i18n/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Status/Validation States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Basic Validation
    if (!email.trim() || !password.trim()) {
      setErrorMsg(isAr ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور!' : 'Please enter your email and password!');
      return;
    }

    if (password.length < 6) {
      setErrorMsg(isAr ? 'يجب أن تكون كلمة المرور ٦ أحرف على الأقل!' : 'Password must be at least 6 characters!');
      return;
    }

    setLoading(true);

    try {
      let credentials: any = { password, email: email.trim().toLowerCase() };

      const { data, error } = await supabase.auth.signInWithPassword(credentials);

      if (error) {
        throw error;
      }

      // Check if user is banned or suspended in profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_status')
        .eq('id', data.user.id)
        .single();

      if (profile && (profile.account_status === 'banned' || profile.account_status === 'suspended')) {
        await supabase.auth.signOut();
        throw new Error(isAr 
          ? 'تم تعليق أو حظر هذا الحساب من قبل الإدارة. يرجى التواصل مع الدعم الفني.' 
          : 'This account has been suspended or banned by administration. Please contact support.');
      }

      setLoading(false);
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        router.push('/dashboard');
      }, 2000);

    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || (isAr ? 'خطأ في البريد الإلكتروني/رقم الهاتف أو كلمة المرور!' : 'Invalid email/phone or password!'));
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'OAuth authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-deumah-gray-50 text-deumah-navy-950 flex flex-col justify-between">
      <DeumahHeader />

      <main className="flex-1 w-full max-w-md mx-auto px-4 py-12 flex flex-col justify-center">
        
        {/* Form Container */}
        <div className="bg-white rounded-deumah border border-deumah-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-extrabold tracking-tight font-heading">
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </h1>
            <p className="text-xs text-deumah-gray-500 font-medium">
              {isAr ? 'مرحباً بك مجدداً في منصة دومه' : 'Welcome back to Deumah Platform'}
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-deumah-sm flex items-center gap-2">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Identifier Field */}
            <div>
              <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                {isAr ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  (e.target as HTMLInputElement).setCustomValidity('');
                }}
                onInvalid={isAr ? (e) => (e.target as HTMLInputElement).setCustomValidity('يرجى تضمين "@" في عنوان البريد الإلكتروني أو إدخال بريد صحيح.') : undefined}
                disabled={loading}
                className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-4 py-2.5 outline-none focus:border-deumah-green-600 bg-white"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider">
                  {isAr ? 'كلمة المرور' : 'Password'}
                </label>
                <Link href="/forgot-password" className="text-[10px] font-bold text-deumah-green-700 hover:text-deumah-green-600">
                  {isAr ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    (e.target as HTMLInputElement).setCustomValidity('');
                  }}
                  onInvalid={isAr ? (e) => (e.target as HTMLInputElement).setCustomValidity('يرجى ملء هذا الحقل.') : undefined}
                  disabled={loading}
                  className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-4 py-2.5 outline-none focus:border-deumah-green-600 bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 rtl:right-auto rtl:left-3 flex items-center text-xs font-bold text-deumah-gray-400 hover:text-deumah-gray-600"
                >
                  {showPassword ? (isAr ? 'إخفاء' : 'Hide') : (isAr ? 'إظهار' : 'Show')}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-deumah-gray-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="rounded border-deumah-gray-200 accent-deumah-green-700 size-4 cursor-pointer"
                />
                <span>{isAr ? 'تذكرني على هذا الجهاز' : 'Remember me on this device'}</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-deumah-green-700 hover:bg-deumah-green-600 text-white font-bold py-3 rounded-deumah font-heading tracking-wide transition shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>{isAr ? 'جاري التحقق...' : 'Verifying...'}</span>
                </>
              ) : (
                <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
              )}
            </button>
          </form>

          {/* Social Logins */}
          <div className="space-y-4">
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-deumah-gray-200"></div>
              <span className="flex-shrink mx-4 text-[10px] font-bold text-deumah-gray-400 uppercase tracking-wider">
                {isAr ? 'أو سجل الدخول عبر' : 'Or Sign In with'}
              </span>
              <div className="flex-grow border-t border-deumah-gray-200"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                className="flex items-center justify-center gap-2 py-2.5 border border-deumah-gray-200 rounded-deumah-sm text-xs font-bold text-deumah-gray-700 hover:bg-deumah-gray-50 transition cursor-pointer"
              >
                <span>🌐</span>
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleOAuth('apple')}
                className="flex items-center justify-center gap-2 py-2.5 border border-deumah-gray-200 rounded-deumah-sm text-xs font-bold text-deumah-gray-700 hover:bg-deumah-gray-50 transition cursor-pointer"
              >
                <span>🍎</span>
                <span>Apple</span>
              </button>
            </div>
          </div>

          {/* Signup Redirect link */}
          <div className="text-center text-xs font-medium text-deumah-gray-500">
            {isAr ? 'ليس لديك حساب؟ ' : 'Don\'t have an account? '}
            <Link href="/register" className="font-bold text-deumah-green-700 hover:underline">
              {isAr ? 'إنشاء حساب جديد' : 'Register Now'}
            </Link>
          </div>

        </div>

      </main>

      {/* Success Notification Toast Popup */}
      {showSuccessToast && (
        <div className="fixed bottom-6 left-6 rtl:left-auto rtl:right-6 z-50 bg-deumah-navy-950 border border-white/10 text-white px-5 py-3 rounded-deumah shadow-deumah-search flex items-center gap-3 animate-slide-in font-medium">
          <span className="size-5 rounded-full bg-deumah-green-700 text-white flex items-center justify-center font-bold text-xs">✓</span>
          <span className="text-xs font-semibold">
            {isAr ? 'تم تسجيل الدخول بنجاح! جاري تحويلك...' : 'Successfully signed in! Redirecting...'}
          </span>
        </div>
      )}

      <Footer />
    </div>
  );
}
