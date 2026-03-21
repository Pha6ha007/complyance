'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useRouter, Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

interface LoginFormProps {
  locale: string;
}

export function LoginForm({ locale }: LoginFormProps) {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    referralCode: '',
  });

  // Check for referral code or register mode in URL parameters
  useEffect(() => {
    const refCode = searchParams?.get('ref');
    const urlMode = searchParams?.get('mode');
    if (refCode) {
      setFormData((prev) => ({ ...prev, referralCode: refCode }));
      setMode('register');
    } else if (urlMode === 'register') {
      setMode('register');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setError(t('invalidCredentials'));
        } else {
          router.push('/dashboard');
          router.refresh();
        }
      } else {
        // Register new user
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || t('registrationFailed'));
        } else {
          const data = await response.json();
          const userId = data.user.id;

          // Apply referral code if provided
          if (formData.referralCode) {
            try {
              await fetch('/api/referral/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: formData.referralCode, userId }),
              });
            } catch {
              // Don't block registration if referral code is invalid
            }
          }

          // Auto-login after registration
          const result = await signIn('credentials', {
            email: formData.email,
            password: formData.password,
            redirect: false,
          });

          if (result?.error) {
            setError(t('registrationSuccessLogin'));
            setMode('login');
          } else {
            router.push('/dashboard');
            router.refresh();
          }
        }
      }
    } catch {
      setError(t('genericError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="relative z-10 w-full max-w-md">
      {/* Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 shadow-[0_0_60px_rgba(0,0,0,0.4)]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight font-dm-sans">
            {mode === 'login' ? t('login') : t('register')}
          </h1>
          <p className="mt-1.5 text-sm text-white/40">
            {mode === 'login'
              ? t('loginSubtitle')
              : t('registerSubtitle')}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="mb-5 flex w-full items-center justify-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white hover:border-white/20 disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {t('signInWithGoogle')}
        </button>

        {/* Divider */}
        <div className="relative mb-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs font-medium tracking-widest text-white/25 uppercase">{t('or')}</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-white/50 uppercase tracking-wider">
                {t('name')}
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required={mode === 'register'}
                disabled={isLoading}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-emerald-500/50 focus:bg-white/8 focus:ring-1 focus:ring-emerald-500/30 disabled:opacity-50"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-white/50 uppercase tracking-wider">
              {t('email')}
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-emerald-500/50 focus:bg-white/8 focus:ring-1 focus:ring-emerald-500/30 disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-white/50 uppercase tracking-wider">
              {t('password')}
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={isLoading}
              minLength={6}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-emerald-500/50 focus:bg-white/8 focus:ring-1 focus:ring-emerald-500/30 disabled:opacity-50"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label htmlFor="referralCode" className="mb-1.5 block text-xs font-medium text-white/50 uppercase tracking-wider">
                {t('referralCode')}
              </label>
              <input
                id="referralCode"
                type="text"
                value={formData.referralCode}
                onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                placeholder="COMP-XXXX"
                disabled={isLoading}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-emerald-500/50 focus:bg-white/8 focus:ring-1 focus:ring-emerald-500/30 disabled:opacity-50"
              />
            </div>
          )}

          {mode === 'login' && (
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-emerald-400/70 transition-colors hover:text-emerald-400"
              >
                {t('forgotPassword')}
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] transition-all duration-200 hover:bg-emerald-400 hover:shadow-[0_4px_24px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? tCommon('loading')
              : mode === 'login'
                ? t('login')
                : t('register')}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="mt-5 text-center text-sm text-white/40">
          {mode === 'login' ? (
            <>
              {t('noAccount')}{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-medium text-emerald-400 transition-colors hover:text-emerald-300"
              >
                {t('register')}
              </button>
            </>
          ) : (
            <>
              {t('hasAccount')}{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-medium text-emerald-400 transition-colors hover:text-emerald-300"
              >
                {t('login')}
              </button>
            </>
          )}
        </div>

        {/* Legal */}
        <p className="mt-4 text-center text-xs text-white/20">
          {t('legalConsent')}{' '}
          <Link href="/terms" className="text-white/35 transition-colors hover:text-white/60">
            {t('terms')}
          </Link>{' '}
          &amp;{' '}
          <Link href="/privacy" className="text-white/35 transition-colors hover:text-white/60">
            {t('privacy')}
          </Link>
        </p>
      </div>
    </div>
  );
}
