'use client'

import { useState, useTransition } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await signIn('credentials', {
        redirect: false,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      })

      if (res?.error) {
        setError('Email o contraseña incorrectos')
        return
      }

      const sessionRes = await fetch('/api/auth/session')
      const session = await sessionRes.json()

      if (session?.user?.barbershopSlug) {
        router.push(`/dashboard/${session.user.barbershopSlug}`)
      } else {
        router.push('/dashboard')
      }
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[oklch(0.975_0.002_247)] p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center">
            <Link
              href="/"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.15_0.008_250)] to-[oklch(0.10_0.008_250)] shadow-lg"
            >
              <ScissorsIcon className="h-5 w-5 text-white" />
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Iniciar Sesión</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Accedé al panel de tu peluquería
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700 border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoFocus
                placeholder="tu@email.com"
                className="h-11 transition-shadow focus-visible:ring-2 focus-visible:ring-ring/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="h-11 transition-shadow focus-visible:ring-2 focus-visible:ring-ring/30"
              />
            </div>

            <Button type="submit" disabled={isPending} className="h-11 w-full font-medium active:scale-[0.98]">
              {isPending ? 'Ingresando...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿No tenés cuenta?{' '}
          <Link href="/register" className="font-semibold text-foreground hover:underline">
            Registrate gratis
          </Link>
        </p>
      </div>
    </div>
  )
}

function ScissorsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 6a2 2 0 11-4 0 2 2 0 014 0zM8 18a2 2 0 11-4 0 2 2 0 014 0zM20 6l-8.1 12M20 18l-8.1-12"
      />
    </svg>
  )
}