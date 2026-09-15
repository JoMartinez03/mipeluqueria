import { useCallback } from 'react'
import { toast } from '@/components/ui/toast'

type ToastOptions = {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const show = useCallback((options: ToastOptions) => {
    toast.add({
      title: options.title,
      description: options.description,
      type: options.variant === 'destructive' ? 'error' : options.title ? 'success' : 'info',
    })
  }, [])

  return { toast: show }
}