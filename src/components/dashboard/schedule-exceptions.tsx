'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, CalendarOff, CalendarPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { formatFullDate, todayLocalString } from '@/lib/format'

export type ExceptionRow = {
  date: string
  closed: boolean
  open1: string | null
  close1: string | null
  open2: string | null
  close2: string | null
  reason: string | null
}

export function ScheduleExceptions({ exceptions, timezone }: { exceptions: ExceptionRow[]; timezone: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    date: todayLocalString(),
    closed: true,
    open1: '09:00',
    close1: '18:00',
    reason: '',
  })

  const save = async () => {
    if (!form.date) {
      toast({ title: 'Elegí una fecha' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/schedule-exceptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: form.date,
          closed: form.closed,
          ...(form.closed ? {} : { open1: form.open1, close1: form.close1 }),
          reason: form.reason.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')
      toast({ title: form.closed ? 'Día marcado como cerrado' : 'Día especial guardado' })
      setOpen(false)
      router.refresh()
    } catch (e) {
      toast({ title: 'No se pudo guardar', description: (e as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const remove = async (date: string) => {
    try {
      const res = await fetch('/api/schedule-exceptions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')
      toast({ title: 'Excepción eliminada' })
      router.refresh()
    } catch (e) {
      toast({ title: 'No se pudo eliminar', description: (e as Error).message, variant: 'destructive' })
    }
  }

  const sorted = [...exceptions].sort((a, b) => (a.date < b.date ? -1 : 1))

  return (
    <div className="flex h-full flex-col">
      {sorted.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
          <CalendarOff className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Sin excepciones. Agregá feriados, vacaciones o días especiales.
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {sorted.map((e) => (
            <div key={e.date} className="flex items-center gap-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">
                  {formatFullDate(new Date(`${e.date}T00:00:00`), timezone)}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {e.closed ? (
                    <Badge variant="secondary" className="rounded-full">Cerrado</Badge>
                  ) : (
                    <Badge className="rounded-full">Horario especial {e.open1}–{e.close1}</Badge>
                  )}
                  {e.reason && <span className="truncate">{e.reason}</span>}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => void remove(e.date)}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Eliminar</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto pt-4">
        <Dialog open={open} onOpenChange={setOpen}>
<DialogTrigger render={<Button variant="outline" className="w-full" />}>
            <Plus className="mr-2 h-4 w-4" /> Agregar excepción
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Día especial</DialogTitle>
              <DialogDescription>
                Marcá un día como cerrado o con horario diferente.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="exc-date">Fecha</Label>
                <Input
                  id="exc-date"
                  type="date"
                  value={form.date}
                  min={todayLocalString()}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Día cerrado</div>
                  <div className="text-xs text-muted-foreground">
                    {form.closed ? 'No habrá turnos ese día' : 'Con horario reducido'}
                  </div>
                </div>
                <Switch checked={form.closed} onCheckedChange={(v) => setForm({ ...form, closed: v })} />
              </div>
              {!form.closed && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exc-open">Abre</Label>
                    <Input
                      id="exc-open"
                      type="time"
                      value={form.open1}
                      onChange={(e) => setForm({ ...form, open1: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exc-close">Cierra</Label>
                    <Input
                      id="exc-close"
                      type="time"
                      value={form.close1}
                      onChange={(e) => setForm({ ...form, close1: e.target.value })}
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="exc-reason">Motivo (opcional)</Label>
                <Input
                  id="exc-reason"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Ej: Feriado local"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button onClick={() => void save()} disabled={loading}>
                <CalendarPlus className="mr-2 h-4 w-4" /> Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}