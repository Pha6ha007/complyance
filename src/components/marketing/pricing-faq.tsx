'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export function PricingFAQ({ faqs }: { faqs: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="mt-12 max-w-3xl mx-auto space-y-3">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="border border-white/[0.08] rounded-2xl overflow-hidden bg-white/[0.03] hover:bg-white/[0.05] transition-colors duration-200"
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-8 py-6 text-start gap-4"
            aria-expanded={open === i}
          >
            <span className="text-base font-bold text-white">{faq.question}</span>
            <ChevronDown
              className={`w-5 h-5 text-emerald-400 flex-shrink-0 transition-transform duration-200 ${
                open === i ? 'rotate-180' : ''
              }`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              open === i ? 'max-h-96' : 'max-h-0'
            }`}
          >
            <p className="px-8 pb-6 text-white/55 text-sm leading-relaxed">{faq.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
