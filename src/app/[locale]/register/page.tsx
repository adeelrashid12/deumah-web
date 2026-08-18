'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { DeumahHeader } from '@/components/deumah/deumah-header';
import { Footer } from '@/components/layout/Footer';
import { Link, useRouter } from '@/i18n/navigation';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();

  // Form Fields State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [governorate, setGovernorate] = useState('sanaa_city');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Status/Validation States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Field Validations
    if (!fullName.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      setErrorMsg(isAr ? 'يرجى ملء جميع الحقول المطلوبة!' : 'Please fill in all required fields!');
      return;
    }

    if (password.length < 6) {
      setErrorMsg(isAr ? 'يجب أن تكون كلمة المرور ٦ أحرف على الأقل!' : 'Password must be at least 6 characters!');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(isAr ? 'كلمتا المرور غير متطابقتين!' : 'Passwords do not match!');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg(isAr ? 'يجب الموافقة على شروط الاستخدام وقواعد النشر!' : 'You must agree to the Terms of Use and listing rules!');
      return;
    }

    setLoading(true);

    try {
      // Supabase Signup
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            governorate: governorate
          }
        }
      });

      if (error) {
        throw error;
      }

      setLoading(false);
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        router.push('/login');
      }, 2500);

    } catch (err: any) {
      setLoading(false);
      let finalErr = isAr ? 'حدث خطأ أثناء إنشاء الحساب.' : 'An error occurred during registration.';
      if (err?.message && typeof err.message === 'string' && err.message !== '{}') {
        if (isAr && err.message.toLowerCase().includes('already registered')) {
          finalErr = 'يوجد حساب مسجل بهذا البريد الإلكتروني';
        } else {
          finalErr = err.message;
        }
      } else if (typeof err === 'string' && err !== '{}') {
        finalErr = err;
      } else if (err?.msg && typeof err.msg === 'string') {
        finalErr = err.msg;
      }
      setErrorMsg(finalErr);
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
              {isAr ? 'إنشاء حساب جديد' : 'Create Account'}
            </h1>
            <p className="text-xs text-deumah-gray-500 font-medium">
              {isAr ? 'انضم إلى مجتمع دومه للمشاركة والتأجير والبيع' : 'Join Deumah community to share, rent, and sell'}
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-deumah-sm flex items-center gap-2">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                {isAr ? 'الاسم الكامل' : 'Full Name'} *
              </label>
              <input
                type="text"
                placeholder={isAr ? 'مثال: محمد علي' : 'e.g. John Doe'}
                value={fullName}
                onChange={e => {
                  setFullName(e.target.value);
                  (e.target as HTMLInputElement).setCustomValidity('');
                }}
                onInvalid={isAr ? (e) => (e.target as HTMLInputElement).setCustomValidity('يرجى ملء هذا الحقل.') : undefined}
                disabled={loading}
                className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-4 py-2.5 outline-none focus:border-deumah-green-600 bg-white"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                {isAr ? 'رقم الهاتف' : 'Phone Number'} *
              </label>
              <input
                type="tel"
                placeholder={isAr ? '77xxxxxxx (للتواصل في الإعلانات)' : '77xxxxxxx (For listing contact)'}
                value={phone}
                onChange={e => {
                  setPhone(e.target.value);
                  (e.target as HTMLInputElement).setCustomValidity('');
                }}
                onInvalid={isAr ? (e) => (e.target as HTMLInputElement).setCustomValidity('يرجى ملء هذا الحقل.') : undefined}
                disabled={loading}
                className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-4 py-2.5 outline-none focus:border-deumah-green-600 bg-white"
                required
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                {isAr ? 'البريد الإلكتروني' : 'Email Address'} *
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

            {/* Governorate */}
            <div>
              <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                {isAr ? 'المحافظة' : 'Governorate'} *
              </label>
              <select
                value={governorate}
                onChange={e => setGovernorate(e.target.value)}
                disabled={loading}
                className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2.5 outline-none focus:border-deumah-green-600 bg-white transition cursor-pointer font-semibold text-deumah-gray-700"
              >
                <option value="sanaa_city">{isAr ? 'أمانة العاصمة / مدينة صنعاء' : "Sana'a City (Amanat Al Asimah)"}</option>
                <option value="sanaa">{isAr ? 'محافظة صنعاء' : 'Sana\'a Governorate'}</option>
                <option value="aden">{isAr ? 'عدن' : 'Aden'}</option>
                <option value="taiz">{isAr ? 'تعز' : 'Taiz'}</option>
                <option value="ibb">{isAr ? 'إب' : 'Ibb'}</option>
                <option value="hadhramaut">{isAr ? 'حضرموت' : 'Hadhramaut'}</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                {isAr ? 'كلمة المرور' : 'Password'} *
              </label>
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

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                {isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'} *
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => {
                  setConfirmPassword(e.target.value);
                  (e.target as HTMLInputElement).setCustomValidity('');
                }}
                onInvalid={isAr ? (e) => (e.target as HTMLInputElement).setCustomValidity('يرجى ملء هذا الحقل.') : undefined}
                disabled={loading}
                className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-4 py-2.5 outline-none focus:border-deumah-green-600 bg-white"
                required
              />
            </div>

            {/* Terms and Privacy Checkbox */}
            <div className="bg-deumah-gray-50 p-3.5 rounded border border-deumah-gray-200/50">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs font-semibold text-deumah-gray-700">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                  disabled={loading}
                  className="mt-0.5 rounded border-deumah-gray-200 accent-deumah-green-700 size-4 cursor-pointer"
                />
                <span>
                  {isAr 
                    ? 'أوافق على اتفاقية شروط الاستخدام وقواعد النشر الخاصة بمنصة دومه.' 
                    : 'I agree to the Terms of Use and listing rules of the Deumah platform.'}
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-deumah-green-700 hover:bg-deumah-green-600 text-white font-bold py-3 rounded-deumah font-heading tracking-wide transition shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>{isAr ? 'جاري إنشاء الحساب...' : 'Creating Account...'}</span>
                </>
              ) : (
                <span>{isAr ? 'إنشاء حساب جديد' : 'Register'}</span>
              )}
            </button>

          </form>

          {/*
          <div className="space-y-4">
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-deumah-gray-200"></div>
              <span className="flex-shrink mx-4 text-[10px] font-bold text-deumah-gray-400 uppercase tracking-wider">
                {isAr ? 'أو سجل عبر' : 'Or Register with'}
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
          */}

          {/* Signin Redirect Link */}
          <div className="text-center text-xs font-medium text-deumah-gray-500">
            {isAr ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
            <Link href="/login" className="font-bold text-deumah-green-700 hover:underline">
              {isAr ? 'تسجيل الدخول' : 'Login'}
            </Link>
          </div>

        </div>

      </main>

      {/* Success Notification Toast Popup */}
      {showSuccessToast && (
        <div className="fixed bottom-6 left-6 rtl:left-auto rtl:right-6 z-50 bg-deumah-navy-950 border border-white/10 text-white px-5 py-3 rounded-deumah shadow-deumah-search flex items-center gap-3 animate-slide-in font-medium">
          <span className="size-5 rounded-full bg-deumah-green-700 text-white flex items-center justify-center font-bold text-xs">✓</span>
          <span className="text-xs font-semibold">
            {isAr ? 'تم تسجيل الحساب بنجاح! جاري تحويلك لتسجيل الدخول...' : 'Account created successfully! Redirecting to login...'}
          </span>
        </div>
      )}

      <Footer />
    </div>
  );
}
