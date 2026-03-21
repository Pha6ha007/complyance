'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, CheckCircle, Lock } from 'lucide-react';

function ResetPasswordForm() {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || '';
  const email = searchParams?.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError(t('passwordMinLength'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password }),
      });

      if (!res.ok) {
        if (res.status === 400) {
          setError(t('invalidOrExpiredResetLink'));
        } else {
          setError(t('genericError'));
        }
        return;
      }

      setDone(true);
    } catch {
      setError(t('genericError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-xl backdrop-blur-sm">
            <h1 className="mb-2 text-2xl font-bold text-white">{t('invalidResetLink')}</h1>
            <p className="mb-6 text-sm text-white/50">{t('invalidResetLinkDescription')}</p>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
            >
              {t('requestNewLink')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-sm">
          {done ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle className="h-6 w-6 text-emerald-400" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-white">{t('passwordResetSuccess')}</h1>
              <p className="mb-6 text-sm text-white/50">{t('passwordResetSuccessDescription')}</p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-400"
              >
                {t('login')}
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">{t('resetPasswordTitle')}</h1>
                <p className="mt-1 text-sm text-white/50">{t('resetPasswordDescription')}</p>
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="password" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                    {t('newPassword')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={isLoading}
                      className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 ps-10 pe-4 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-emerald-500/50 focus:bg-white/8 focus:ring-1 focus:ring-emerald-500/30 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                    {t('confirmPassword')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={isLoading}
                      className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 ps-10 pe-4 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-emerald-500/50 focus:bg-white/8 focus:ring-1 focus:ring-emerald-500/30 disabled:opacity-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-400 disabled:opacity-50"
                >
                  {isLoading ? '...' : t('resetPassword')}
                </button>
              </form>

              <div className="mt-5 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t('backToLogin')}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordContent() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
