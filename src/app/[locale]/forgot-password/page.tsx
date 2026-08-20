'use client';

import { useState } from 'react';
import { getLocalizedAuthError } from '@/utils/auth-errors';
import { useLocale } from 'next-intl';
import { DeumahHeader } from '@/components/deumah/deumah-header';
import { Footer } from '@/components/layout/Footer';
import { Link } from '@/i18n/navigation';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;
      setSuccessMsg(isAr ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.' : 'Password reset link sent to your email.');
    } catch (err: any) {
      setErrorMsg(getLocalizedAuthError(err.message || '', isAr));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-deumah-gray-50 text-deumah-navy-950 flex flex-col justify-between">
      <DeumahHeader />

      <main className="flex-1 w-full max-w-md mx-auto px-4 py-12 flex flex-col justify-center">
        <div className="bg-white rounded-deumah border border-deumah-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-extrabold tracking-tight font-heading">
              {isAr ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
            </h1>
            <p className="text-xs text-deumah-gray-500 font-medium">
              {isAr ? 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.' : 'Enter your email and we will send you a link to reset your password.'}
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-deumah-sm flex items-center gap-2">
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-deumah-green-50 border border-deumah-green-200 text-deumah-green-700 text-xs font-bold p-3 rounded-deumah-sm flex items-center gap-2">
              ✓ {successMsg}
            </div>
          )}

          {!successMsg && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                  {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-4 py-2.5 outline-none focus:border-deumah-green-600 bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-deumah-green-700 hover:bg-deumah-green-600 text-white font-bold py-3 rounded-deumah font-heading tracking-wide transition shadow-sm cursor-pointer disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading ? (isAr ? 'جاري الإرسال...' : 'Sending...') : (isAr ? 'إرسال رابط الاستعادة' : 'Send Reset Link')}
              </button>
            </form>
          )}

          <div className="text-center mt-4">
            <Link href="/login" className="text-xs font-bold text-deumah-gray-500 hover:text-deumah-green-700 transition">
              {isAr ? 'العودة لتسجيل الدخول' : 'Back to Login'}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
