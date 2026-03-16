'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  LifeBuoy,
  ShieldCheck,
  Handshake,
  Clock,
  CheckCircle2,
  Send,
  Loader2,
  User,
  AtSign,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';

const CONTACT_ITEMS = [
  {
    icon: LifeBuoy,
    titleKey: 'info.support.title' as const,
    descKey: 'info.support.desc' as const,
    email: 'support@complyance.io',
    color: 'emerald',
  },
  {
    icon: ShieldCheck,
    titleKey: 'info.privacy.title' as const,
    descKey: 'info.privacy.desc' as const,
    email: 'privacy@complyance.io',
    color: 'teal',
  },
  {
    icon: Handshake,
    titleKey: 'info.partnership.title' as const,
    descKey: 'info.partnership.desc' as const,
    email: 'partnerships@complyance.io',
    color: 'sky',
  },
] as const;

export function ContactForm() {
  const t = useTranslations('contact');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Client-side validation matching server schema
    if (formData.name.trim().length < 1) {
      setError('Name is required');
      setLoading(false);
      return;
    }
    if (formData.message.trim().length < 10) {
      setError('Message must be at least 10 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show specific field errors from server if available
        const detail = data.details
          ? Array.isArray(data.details) ? data.details.join(', ') : String(data.details)
          : data.error || 'Failed to send message';
        throw new Error(detail);
      }

      setSuccess(true);
      setFormData({ name: '', email: '', subject: 'general', message: '' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0F172A] overflow-hidden">
      {/* Animated grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
          animation: 'gridShift 20s linear infinite',
        }}
      />
      {/* Orbs */}
      <div className="absolute top-0 start-1/3 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 end-0 w-[400px] h-[400px] bg-teal-500/6 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl font-dm-sans">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-white/40">{t('subtitle')}</p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] items-start">
          {/* Left — contact items */}
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30">
              {t('info.title')}
            </p>

            {CONTACT_ITEMS.map(({ icon: Icon, titleKey, descKey, email, color }) => (
              <div
                key={email}
                className="group flex gap-4 rounded-xl border border-white/8 bg-white/4 p-5 backdrop-blur-sm transition-all duration-200 hover:border-white/14 hover:bg-white/6"
              >
                <div
                  className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                    color === 'emerald'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : color === 'teal'
                        ? 'bg-teal-500/15 text-teal-400'
                        : 'bg-sky-500/15 text-sky-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-white/90">{t(titleKey)}</h3>
                  <p className="mt-0.5 text-sm text-white/40">{t(descKey)}</p>
                  <a
                    href={`mailto:${email}`}
                    className={`mt-2 inline-block text-sm font-medium transition-colors ${
                      color === 'emerald'
                        ? 'text-emerald-400/70 hover:text-emerald-400'
                        : color === 'teal'
                          ? 'text-teal-400/70 hover:text-teal-400'
                          : 'text-sky-400/70 hover:text-sky-400'
                    }`}
                  >
                    {email}
                  </a>
                </div>
              </div>
            ))}

            {/* Response time */}
            <div className="flex gap-4 rounded-xl border border-white/8 bg-white/4 p-5">
              <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white/90">{t('info.hours.title')}</h3>
                <p className="mt-0.5 text-sm text-white/40">{t('info.hours.desc')}</p>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-[0_0_60px_rgba(0,0,0,0.3)]">
            <h2 className="mb-6 text-xl font-bold text-white font-dm-sans">{t('form.title')}</h2>

            {success && (
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                {t('form.success')}
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                  {t('form.name')}
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 ps-10 pe-4 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                  {t('form.email')}
                </label>
                <div className="relative">
                  <AtSign className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 ps-10 pe-4 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                  {t('form.subject')}
                </label>
                <div className="relative">
                  <select
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 py-2.5 ps-4 pe-10 text-sm text-white outline-none transition-all focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="general" className="bg-[#1e293b]">{t('form.subjects.general')}</option>
                    <option value="support" className="bg-[#1e293b]">{t('form.subjects.support')}</option>
                    <option value="partnership" className="bg-[#1e293b]">{t('form.subjects.partnership')}</option>
                    <option value="press" className="bg-[#1e293b]">{t('form.subjects.press')}</option>
                    <option value="other" className="bg-[#1e293b]">{t('form.subjects.other')}</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute end-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                  {t('form.message')}
                </label>
                <div className="relative">
                  <MessageSquare className="pointer-events-none absolute start-3.5 top-3.5 h-4 w-4 text-white/25" />
                  <textarea
                    id="message"
                    required
                    minLength={10}
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full resize-none rounded-lg border border-white/10 bg-white/5 py-2.5 ps-10 pe-4 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] transition-all duration-200 hover:bg-emerald-400 hover:shadow-[0_4px_24px_rgba(16,185,129,0.5)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('form.sending')}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {t('form.submit')}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
