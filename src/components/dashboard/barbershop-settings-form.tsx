'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

export type BarbershopSettings = {
  name: string
  slug: string
  phone: string | null
  whatsapp: string | null
  address: string | null
  description: string | null
  instagram: string | null
}

export function BarbershopSettingsForm({ barbershop }: { barbershop: BarbershopSettings }) {
  const router = useRouter()
  const { toast } = useToast()
  const [form, setForm] = useState({
    name: barbershop.name,
    phone: barbershop.phone ?? '',
    whatsapp: barbershop.whatsapp ?? '',
    address: barbershop.address ?? '',
    description: barbershop.description ?? '',
    instagram: barbershop.instagram ?? '',
  })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.name.trim()) {
      toast({ title: 'El nombre es obligatorio', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/barbershop', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim() || null,
          whatsapp: form.whatsapp.trim() || null,
          address: form.address.trim() || null,
          description: form.description.trim() || null,
          instagram: form.instagram.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')
      toast({ title: 'Configuración guardada' })
      router.refresh()
    } catch (e) {
      toast({ title: 'No se pudo guardar', description: (e as Error).message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/${barbershop.slug}` : `/${barbershop.slug}`

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Datos de la peluquería</CardTitle>
            <CardDescription>Estos datos se muestran en tu página pública</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bs-name">Nombre</Label>
                <Input
                  id="bs-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bs-phone">Teléfono</Label>
                <Input
                  id="bs-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+54 9 261 000 0000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bs-address">Dirección</Label>
              <Input
                id="bs-address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Ej: Av. Mitre 1234"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bs-desc">Descripción</Label>
              <Textarea
                id="bs-desc"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Contá qué hace tu lugar: cortes, barbería, estilo…"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Redes y contacto</CardTitle>
            <CardDescription>Opcional, para mostrarse en la página pública</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bs-whatsapp">WhatsApp</Label>
                <Input
                  id="bs-whatsapp"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="+54 9 261 000 0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bs-instagram">Instagram</Label>
                <Input
                  id="bs-instagram"
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  placeholder="@miruta"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => void save()} disabled={saving}>
            <Save className="mr-2 h-4 w-4" /> {saving ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </div>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Tu página pública</CardTitle>
            <CardDescription>El link que compartís con tus clientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-3">
              <div className="truncate text-sm font-medium">
                {typeof window !== 'undefined' ? `${window.location.host}/${barbershop.slug}` : `/${barbershop.slug}`}
              </div>
            </div>
            <Button render={<a href={publicUrl} target="_blank" rel="noopener noreferrer" />} variant="outline" className="w-full">
              <ExternalLink className="mr-2 h-4 w-4" /> Ver página pública
            </Button>
            <p className="text-xs text-muted-foreground">
              Tu enlace es único: tus clientes eligen día, horario y servicio, y reservan sin crearse una cuenta.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}