'use client';

import { useState } from 'react';
import { getLocalizedAuthError } from '@/utils/auth-errors';
import { useLocale } from 'next-intl';
import { DeumahHeader } from '@/components/deumah/deumah-header';
import { Footer } from '@/components/layout/Footer';
import { useRouter } from '@/i18n/navigation';
import { supabase } from '@/lib/supabase';

export default function UpdatePasswordPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // When a user clicks the password reset link in their email, 
  // Supabase automatically logs them in and sets a session.
  // So we just need to call supabase.auth.updateUser() to update the password.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg(isAr ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      setSuccessMsg(isAr ? 'تم تحديث كلمة المرور بنجاح! جاري تحويلك...' : 'Password updated successfully! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
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
              {isAr ? 'تحديث كلمة المرور' : 'Update Password'}
            </h1>
            <p className="text-xs text-deumah-gray-500 font-medium">
              {isAr ? 'الرجاء إدخال كلمة المرور الجديدة.' : 'Please enter your new password.'}
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-deumah-sm flex items-center gap-2">
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg ? (
            <div className="bg-deumah-green-50 border border-deumah-green-200 text-deumah-green-700 text-xs font-bold p-3 rounded-deumah-sm flex items-center gap-2">
              ✓ {successMsg}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                  {isAr ? 'كلمة المرور الجديدة' : 'New Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-4 py-2.5 outline-none focus:border-deumah-green-600 bg-white"
                    required
                    minLength={6}
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

              <div>
                <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                  {isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
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
                {loading ? (isAr ? 'جاري التحديث...' : 'Updating...') : (isAr ? 'تحديث كلمة المرور' : 'Update Password')}
              </button>
            </form>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
