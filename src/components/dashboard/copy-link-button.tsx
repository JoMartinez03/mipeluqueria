'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

export function CopyLinkButton({
  path,
  label,
  variant = 'outline',
  size = 'default',
  className,
  toastTitle = 'Enlace copiado',
  children,
}: {
  path: string
  label: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs' | 'icon-sm' | 'icon-lg'
  className?: string
  toastTitle?: string
  children?: React.ReactNode
}) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    const url = `${window.location.origin}${path}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const el = document.createElement('textarea')
      el.value = url
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    toast({ title: toastTitle, description: url })
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => void copy()}
      className={cn('w-full', className)}
      aria-label={children ? undefined : `Copiar enlace ${label}`}
    >
      {children ?? (copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />)}
      {copied && children ? (
        <span className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-emerald-500">
          <Check className="h-4 w-4" />
        </span>
      ) : null}
    </Button>
  )
}