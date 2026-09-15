'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, Scissors, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const LINKS = [
  { label: 'Funciones', href: '#funciones' },
  { label: 'Para tus clientes', href: '#clientes' },
  { label: 'Cómo funciona', href: '#pasos' },
]

export function PublicNavbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Scissors className="h-4.5 w-4.5" strokeWidth={2} />
          </span>
          <span className="text-lg font-bold tracking-tight">MiPeluqueria</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button render={<Link href="/login" />} variant="ghost" size="sm">
            Ingresar
          </Button>
          <Button render={<Link href="/register" />} size="sm">
            Comenzar gratis
          </Button>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-foreground hover:bg-accent md:hidden"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          'overflow-hidden border-b bg-background md:hidden',
          open ? 'max-h-96 py-3' : 'max-h-0 border-b-0'
        )}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
          <div className="mt-2 flex gap-2 border-t pt-3">
            <Button render={<Link href="/login" />} variant="outline" size="sm" className="flex-1">
              Ingresar
            </Button>
            <Button render={<Link href="/register" />} size="sm" className="flex-1">
              Comenzar gratis
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}