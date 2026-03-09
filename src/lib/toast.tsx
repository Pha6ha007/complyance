import { toast as sonnerToast } from 'sonner';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastOptions = {
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
};

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, {
      description: options?.description,
      action: options?.action,
      duration: options?.duration || 4000,
      icon: <CheckCircle2 className="h-5 w-5" />,
    });
  },

  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, {
      description: options?.description,
      action: options?.action,
      duration: options?.duration || 5000,
      icon: <AlertCircle className="h-5 w-5" />,
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, {
      description: options?.description,
      action: options?.action,
      duration: options?.duration || 4000,
      icon: <AlertTriangle className="h-5 w-5" />,
    });
  },

  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, {
      description: options?.description,
      action: options?.action,
      duration: options?.duration || 4000,
      icon: <Info className="h-5 w-5" />,
    });
  },

  loading: (message: string) => {
    return sonnerToast.loading(message);
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  },

  dismiss: (id?: string | number) => {
    return sonnerToast.dismiss(id);
  },
};
