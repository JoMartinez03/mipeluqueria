'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Clock, Scissors } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { formatPrice } from '@/lib/format'

export type ServiceRow = {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
  active: boolean
}

export function ServicesManager({ services }: { services: ServiceRow[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ServiceRow | null>(null)
  const [confirming, setConfirming] = useState<ServiceRow | null>(null)
  const [loading, setLoading] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '30',
  })

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', description: '', price: '', duration: '30' })
    setOpen(true)
  }

  const openEdit = (s: ServiceRow) => {
    setEditing(s)
    setForm({
      name: s.name,
      description: s.description ?? '',
      price: String(s.price),
      duration: String(s.duration),
    })
    setOpen(true)
  }

  const save = async () => {
    if (!form.name.trim() || !form.price) {
      toast({ title: 'Completá nombre y precio', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const body = {
        ...(editing ? { id: editing.id } : {}),
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: Number(form.price),
        duration: Number(form.duration),
      }
      const res = await fetch('/api/services', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')
      toast({ title: editing ? 'Servicio actualizado' : 'Servicio creado' })
      setOpen(false)
      router.refresh()
    } catch (e) {
      toast({ title: 'No se pudo guardar', description: (e as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (s: ServiceRow) => {
    setTogglingId(s.id)
    try {
      const res = await fetch('/api/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: s.id, active: !s.active }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')
      toast({
        title: s.active ? 'Servicio pausado' : 'Servicio activado',
        description: s.active
          ? 'Ya no se puede reservar hasta que lo actives.'
          : 'Ya aparece de nuevo para reservar.',
      })
      router.refresh()
    } catch (e) {
      toast({ title: 'No se pudo actualizar', description: (e as Error).message, variant: 'destructive' })
    } finally {
      setTogglingId(null)
    }
  }

  const remove = async () => {
    if (!confirming) return
    setLoading(true)
    try {
      const res = await fetch('/api/services', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confirming.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')
      toast({ title: 'Servicio desactivado' })
      setConfirming(null)
      router.refresh()
    } catch (e) {
      toast({ title: 'No se pudo eliminar', description: (e as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo servicio
        </Button>
      </div>

      <div className="mt-4 divide-y rounded-xl border bg-card">
        {services.map((s) => (
          <div key={s.id} className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Scissors className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={s.active ? 'font-medium' : 'font-medium text-muted-foreground'}>
                  {s.name}
                </span>
                {!s.active && <Badge variant="secondary">Inactivo</Badge>}
              </div>
              {s.description && (
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{s.description}</p>
              )}
              <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {s.duration} min
                </span>
                <span className="text-sm font-semibold text-foreground">{formatPrice(s.price)}</span>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-0.5 sm:flex-row sm:items-center sm:gap-2">
              <Switch
                checked={s.active}
                disabled={togglingId === s.id}
                onCheckedChange={() => void toggleActive(s)}
                aria-label={`Activar o pausar ${s.name}`}
                size="sm"
              />
              <span className="hidden text-[10px] uppercase tracking-wide text-muted-foreground sm:inline">
                {s.active ? 'Activo' : 'Pausado'}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Editar</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setConfirming(s)}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Eliminar</span>
              </Button>
            </div>
          </div>
        ))}
        {services.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 px-5 py-12 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Scissors className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium">Aún no creaste servicios</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Agregá el primero para que tus clientes puedan reservar.
              </p>
            </div>
            <Button onClick={openCreate} size="sm" className="mt-1">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Crear primer servicio
            </Button>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar servicio' : 'Nuevo servicio'}</DialogTitle>
            <DialogDescription>
              La duración define entre qué horarios se puede reservar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="svc-name">Nombre</Label>
              <Input
                id="svc-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Corte clásico"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="svc-desc">Descripción (opcional)</Label>
              <Textarea
                id="svc-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ej: Corte con máquina, tijera y terminación"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="svc-price">Precio ($)</Label>
                <Input
                  id="svc-price"
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="5000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="svc-duration">Duración (min)</Label>
                <Input
                  id="svc-duration"
                  type="number"
                  min={5}
                  step={5}
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={() => void save()} disabled={loading}>
              {loading ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear servicio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirming !== null} onOpenChange={(v) => !v && setConfirming(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Desactivar &quot;{confirming?.name}&quot;?</DialogTitle>
            <DialogDescription>
              No se pierde el historial: los turnos pasados se conservan y el servicio deja de
              mostrarse para nuevas reservas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirming(null)} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => void remove()} disabled={loading}>
              {loading ? 'Desactivando…' : 'Sí, desactivar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}