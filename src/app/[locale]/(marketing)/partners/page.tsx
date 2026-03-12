'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export default function PartnersPage() {
  const t = useTranslations('partners');
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    contactName: '',
    email: '',
    type: 'law_firm',
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

    try {
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send application');
      setSuccess(true);
      setFormData({ companyName: '', website: '', contactName: '', email: '', type: 'law_firm', message: '' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
        <div className="absolute top-0 start-1/4 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 end-0 w-[400px] h-[400px] bg-teal-500/6 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_700px_350px_at_50%_58%,rgba(16,185,129,0.13),transparent)] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 font-mono">
            <Sparkles className="h-4 w-4" />
            Partner Program
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight leading-[1.05] sm:text-6xl lg:text-7xl">
            <span className="text-white">Partner with </span>
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Complyance
            </span>
          </h1>
          <p className="mt-6 mx-auto max-w-2xl text-lg text-white/60">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* ── Benefits ── */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400 font-mono">Why partner</span>
          <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">{t('benefits.title')}</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { emoji: '📈', gradient: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/20', title: t('benefits.revenue.title'), desc: t('benefits.revenue.desc') },
            { emoji: '🏷️', gradient: 'from-blue-500/20 to-indigo-500/10',   border: 'border-blue-500/20',   title: t('benefits.whiteLabel.title'), desc: t('benefits.whiteLabel.desc') },
            { emoji: '🤝', gradient: 'from-violet-500/20 to-purple-500/10', border: 'border-violet-500/20', title: t('benefits.support.title'), desc: t('benefits.support.desc') },
            { emoji: '🎓', gradient: 'from-amber-500/20 to-orange-500/10',  border: 'border-amber-500/20',  title: t('benefits.training.title'), desc: t('benefits.training.desc') },
          ].map(({ emoji, gradient, border, title, desc }) => (
            <div key={title} className={`rounded-2xl border ${border} bg-gradient-to-br ${gradient} p-6 flex flex-col gap-4`}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]">
                {emoji}
              </div>
              <h3 className="font-bold text-white">{title}</h3>
              <p className="text-sm text-white/55 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ideal Partners ── */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400 font-mono">Who we work with</span>
            <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">{t('ideal.title')}</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              { emoji: '⚖️', title: t('ideal.lawFirms.title'), desc: t('ideal.lawFirms.desc') },
              { emoji: '🏢', title: t('ideal.consultancies.title'), desc: t('ideal.consultancies.desc') },
              { emoji: '🔍', title: t('ideal.auditors.title'), desc: t('ideal.auditors.desc') },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 hover:bg-white/[0.06] hover:border-white/20 transition-colors">
                <div className="text-3xl mb-4">{emoji}</div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Application Form ── */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400 font-mono">Apply now</span>
            <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">{t('form.title')}</h2>
            <p className="mt-3 text-white/50">{t('form.subtitle')}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
            {success && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-300">{t('form.success')}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                { id: 'companyName', label: t('form.companyName'), type: 'text', value: formData.companyName, onChange: (v: string) => setFormData({ ...formData, companyName: v }) },
                { id: 'website',     label: t('form.website'),     type: 'url',  value: formData.website,     onChange: (v: string) => setFormData({ ...formData, website: v }),     placeholder: 'https://' },
                { id: 'contactName', label: t('form.contactName'), type: 'text', value: formData.contactName, onChange: (v: string) => setFormData({ ...formData, contactName: v }) },
                { id: 'email',       label: t('form.email'),       type: 'email', value: formData.email,      onChange: (v: string) => setFormData({ ...formData, email: v }) },
              ].map(({ id, label, type, value, onChange, placeholder }) => (
                <div key={id}>
                  <Label htmlFor={id} className="text-white/70 text-sm font-medium">{label}</Label>
                  <Input
                    id={id}
                    type={type}
                    required
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="mt-1.5 bg-white/5 border-white/15 text-white placeholder:text-white/25 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              ))}

              <div>
                <Label htmlFor="type" className="text-white/70 text-sm font-medium">{t('form.type')}</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger id="type" className="mt-1.5 bg-white/5 border-white/15 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/15 text-white">
                    <SelectItem value="law_firm">{t('form.types.lawFirm')}</SelectItem>
                    <SelectItem value="consultancy">{t('form.types.consultancy')}</SelectItem>
                    <SelectItem value="auditor">{t('form.types.auditor')}</SelectItem>
                    <SelectItem value="other">{t('form.types.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message" className="text-white/70 text-sm font-medium">{t('form.message')}</Label>
                <Textarea
                  id="message"
                  required
                  rows={5}
                  placeholder={t('form.messagePlaceholder')}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="mt-1.5 bg-white/5 border-white/15 text-white placeholder:text-white/25 focus:border-emerald-500/50 resize-none"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_4px_24px_rgba(16,185,129,0.35)] hover:shadow-[0_4px_32px_rgba(16,185,129,0.5)] transition-all"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    {t('form.sending')}
                  </>
                ) : (
                  t('form.submit')
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>

    </div>
  );
}
