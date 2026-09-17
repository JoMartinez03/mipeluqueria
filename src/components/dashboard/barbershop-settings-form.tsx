'use client'

import { useSyncExternalStore, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ExternalLink, Store, Share2, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageUpload } from '@/components/dashboard/image-upload'
import { CopyLinkButton } from '@/components/dashboard/copy-link-button'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

export type BarbershopSettings = {
  name: string
  slug: string
  phone: string | null
  whatsapp: string | null
  address: string | null
  description: string | null
  instagram: string | null
  logo: string | null
  coverImage: string | null
}

type SiteInfo = { host: string; origin: string }

let cachedSite: SiteInfo | null = null

function getSiteSnapshot(): SiteInfo {
  const host = window.location.host
  const origin = window.location.origin
  if (!cachedSite || cachedSite.host !== host || cachedSite.origin !== origin) {
    cachedSite = { host, origin }
  }
  return cachedSite
}

const subscribeSite = () => () => {}
const getServerSiteSnapshot = () => null

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
    logo: barbershop.logo,
    coverImage: barbershop.coverImage,
  })
  const [saving, setSaving] = useState(false)

  const site = useSyncExternalStore(subscribeSite, getSiteSnapshot, getServerSiteSnapshot)

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
          logo: form.logo,
          coverImage: form.coverImage,
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

  const publicUrl =
    site ? `${site.origin}/${barbershop.slug}` : `/${barbershop.slug}`

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-4 w-4 text-primary" /> Datos de la peluquería
              </CardTitle>
              <CardDescription>Estos datos se muestran en tu página pública</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <ImageUpload
                fieldLabel="logo"
                label="Logo"
                description="Se muestra en tu página pública y en el panel. PNG o JPG."
                value={form.logo}
                onChange={(logo) => setForm((f) => ({ ...f, logo }))}
                maxWidth={320}
                previewClassName="aspect-square w-24 rounded-xl"
              />
              <div className="flex-1 space-y-4">
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
            </div>

            <ImageUpload
              fieldLabel="portada"
              label="Imagen de portada"
              description="Banner principal de tu página. Idealmente amplia (16:9). PNG o JPG."
              value={form.coverImage}
              onChange={(coverImage) => setForm((f) => ({ ...f, coverImage }))}
              maxWidth={1920}
              previewClassName="aspect-[16/5] w-full max-h-40"
            />

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
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-primary" /> Redes y contacto
            </CardTitle>
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
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> Tu página pública
            </CardTitle>
            <CardDescription>El link que compartís con tus clientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-3 py-2.5">
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg',
                  form.logo ? 'bg-card' : 'bg-primary/10 text-primary'
                )}
              >
                {form.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.logo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-bold uppercase">{barbershop.name.slice(0, 2)}</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{barbershop.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {site ? `${site.host}/${barbershop.slug}` : `/${barbershop.slug}`}
                </div>
              </div>
            </div>
            <Button
              render={<a href={publicUrl} target="_blank" rel="noopener noreferrer" />}
              variant="outline"
              className="w-full"
            >
              <ExternalLink className="mr-2 h-4 w-4" /> Ver página pública
            </Button>
            <CopyLinkButton
              path={`/${barbershop.slug}`}
              label="Copiar enlace"
              variant="outline"
              toastTitle="Enlace copiado"
            />
            <p className="text-xs text-muted-foreground">
              Tu enlace es único: tus clientes eligen día, horario y servicio, y reservan sin
              crearse una cuenta.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}