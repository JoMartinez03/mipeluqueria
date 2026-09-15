'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  const [loading, setLoading] = useState(false)
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

  const remove = async (s: ServiceRow) => {
    if (!window.confirm(`¿Desactivar "${s.name}"? No se eliminan los turnos pasados.`)) return
    try {
      const res = await fetch('/api/services', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: s.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')
      toast({ title: 'Servicio desactivado' })
      router.refresh()
    } catch (e) {
      toast({ title: 'No se pudo eliminar', description: (e as Error).message, variant: 'destructive' })
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
          <div key={s.id} className="flex items-center gap-4 px-5 py-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{s.name}</span>
                {!s.active && <Badge variant="secondary">Inactivo</Badge>}
              </div>
              {s.description && (
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{s.description}</p>
              )}
            </div>
            <div className="hidden shrink-0 text-sm text-muted-foreground sm:block">
              {s.duration} min
            </div>
            <div className="w-24 shrink-0 text-right text-sm font-semibold">
              {formatPrice(s.price)}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Editar</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => void remove(s)}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Eliminar</span>
              </Button>
            </div>
          </div>
        ))}
        {services.length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            Todavía no creaste servicios. Agregá el primero para que tus clientes puedan reservar.
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
    </div>
  )
}