'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      barbershopName: formData.get('barbershopName'),
      slug: formData.get('slug'),
    }

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Error al crear la cuenta')
      setLoading(false)
      return
    }

    router.push('/login')
  }

  const generateSlug = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

  return (
    <div className="flex min-h-screen items-center justify-center bg-[oklch(0.975_0.002_247)] py-10 px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Creá tu cuenta</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Empezá a gestionar tu peluquería en 2 minutos
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
              <Label htmlFor="name" className="text-sm font-medium">
                Tu nombre
              </Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Juan Pérez"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="tu@email.com"
                className="h-11"
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
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                className="h-11"
              />
            </div>

            <div className="border-t border-border pt-4">
              <div className="space-y-2">
                <Label htmlFor="barbershopName" className="text-sm font-medium">
                  Nombre de tu peluquería
                </Label>
                <Input
                  id="barbershopName"
                  name="barbershopName"
                  required
                  placeholder="Barber San Ra"
                  className="h-11"
                  onChange={(e) => {
                    const slugInput = document.getElementById('slug') as HTMLInputElement
                    if (slugInput && !slugInput.dataset.touched) {
                      slugInput.value = generateSlug(e.target.value)
                    }
                  }}
                />
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="slug" className="text-sm font-medium">
                  URL pública de tu peluquería
                </Label>
                <div className="flex items-center gap-2 rounded-lg border border-input bg-muted/50 px-3">
                  <span className="text-sm text-muted-foreground">mipeluqueria.com/</span>
                  <Input
                    id="slug"
                    name="slug"
                    required
                    placeholder="barber-sanra"
                    className="h-9 border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-transparent"
                    onChange={(e) => (e.currentTarget.dataset.touched = 'true')}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Solo minúsculas, números y guiones. Ej: barber-sanra
                </p>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="mt-2 h-11 w-full font-medium active:scale-[0.98]">
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="font-semibold text-foreground hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  )
}