'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface CheckoutButtonProps {
  priceId: string;
  planName: string;
  label?: string;
  customerId?: string;
  email?: string;
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export function CheckoutButton({
  priceId,
  planName,
  label,
  customerId,
  email,
  variant = 'default',
  className,
}: CheckoutButtonProps) {
  const t = useTranslations('billing');
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      // Initialize Paddle
      if (typeof window === 'undefined' || !window.Paddle) {
        setLoading(false);
        return;
      }

      // Open Paddle checkout
      window.Paddle.Checkout.open({
        items: [
          {
            priceId,
            quantity: 1,
          },
        ],
        customer: customerId
          ? { id: customerId }
          : email
          ? { email }
          : undefined,
        customData: {
          plan: planName,
        },
        successCallback: () => {
          window.location.href = '/dashboard?checkout=success';
        },
        closeCallback: () => {
          setLoading(false);
        },
      });
    } catch {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      variant={variant}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="me-2 h-4 w-4 animate-spin" />
          {t('processing')}
        </>
      ) : (
        label ?? t('subscribe')
      )}
    </Button>
  );
}
