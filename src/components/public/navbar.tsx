'use client'

import Link from 'next/link'
import { Scissors } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PublicNavbar({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70',
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-sidebar">
            <Scissors className="h-4 w-4 text-white" strokeWidth={1.8} />
          </span>
          MiPeluqueria
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/#como-funciona" className="text-muted-foreground transition-colors hover:text-foreground">
            Cómo funciona
          </Link>
          <Link href="/login" className="text-muted-foreground transition-colors hover:text-foreground">
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Crear mi negocio
          </Link>
        </nav>
      </div>
    </header>
  )
}