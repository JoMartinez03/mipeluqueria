'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Clock, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { DAY_NAMES } from '@/lib/constants'

export type HourRow = {
  dayOfWeek: number
  open1: string | null
  close1: string | null
  open2: string | null
  close2: string | null
  closed: boolean
}

export function BusinessHoursEditor({ hours, timezone }: { hours: HourRow[]; timezone: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [rows, setRows] = useState<HourRow[]>(
    DAY_NAMES.map((_, dayOfWeek) => {
      const existing = hours.find((h) => h.dayOfWeek === dayOfWeek)
      return existing ? { ...existing } : { dayOfWeek, open1: '09:00', close1: '18:00', open2: null, close2: null, closed: true }
    })
  )
  const [saving, setSaving] = useState(false)

  const update = (dayOfWeek: number, patch: Partial<HourRow>) => {
    setRows((prev) => prev.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, ...patch } : r)))
  }

  const addInterval = (dayOfWeek: number) => {
    setRows((prev) =>
      prev.map((r) =>
        r.dayOfWeek === dayOfWeek ? { ...r, open2: r.open2 ?? r.close1 ?? '18:00', close2: r.close2 ?? '21:00' } : r
      )
    )
  }

  const clearInterval = (dayOfWeek: number) => {
    setRows((prev) =>
      prev.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, open2: null, close2: null } : r))
    )
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/business-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: rows }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')
      toast({ title: 'Horarios guardados' })
      router.refresh()
    } catch (e) {
      toast({ title: 'No se pudieron guardar', description: (e as Error).message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="divide-y">
        {rows.map((r) => {
          const hasSecond = Boolean(r.open2 && r.close2)
          return (
            <div key={r.dayOfWeek} className="grid gap-3 py-3.5 first:pt-0 sm:grid-cols-[11rem_1fr] sm:items-start">
              <div className="flex items-center gap-3">
                <Switch
                  checked={!r.closed}
                  onCheckedChange={(v) => update(r.dayOfWeek, { closed: !v })}
                  aria-label={`${DAY_NAMES[r.dayOfWeek]} abierto`}
                />
                <span className={r.closed ? 'text-sm text-muted-foreground' : 'text-sm font-medium'}>
                  {DAY_NAMES[r.dayOfWeek]}
                </span>
              </div>

              {r.closed ? (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                  Cerrado
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/20 px-2.5 py-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <TimeInput
                      label="Desde"
                      value={r.open1 ?? ''}
                      onChange={(v) => update(r.dayOfWeek, { open1: v || null })}
                    />
                    <span className="text-muted-foreground">—</span>
                    <TimeInput
                      label="Hasta"
                      value={r.close1 ?? ''}
                      onChange={(v) => update(r.dayOfWeek, { close1: v || null })}
                    />
                  </div>

                  {hasSecond ? (
                    <>
                      <span className="hidden h-4 w-px bg-border sm:block" />
                      <div className="flex items-center gap-2 rounded-lg border bg-muted/20 px-2.5 py-1.5">
                        <span className="hidden text-xs text-muted-foreground lg:block">Turno 2</span>
                        <TimeInput
                          label="Desde"
                          value={r.open2 ?? ''}
                          onChange={(v) => update(r.dayOfWeek, { open2: v || null })}
                        />
                        <span className="text-muted-foreground">—</span>
                        <TimeInput
                          label="Hasta"
                          value={r.close2 ?? ''}
                          onChange={(v) => update(r.dayOfWeek, { close2: v || null })}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-red-500"
                          onClick={() => clearInterval(r.dayOfWeek)}
                          aria-label={`Quitar segundo intervalo de ${DAY_NAMES[r.dayOfWeek]}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary"
                      onClick={() => addInterval(r.dayOfWeek)}
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" /> Agregar intervalo
                    </Button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Zona horaria: {timezone}. Los turnos se generan según estos horarios.
      </p>
      <div className="mt-4 flex justify-end">
        <Button onClick={() => void save()} disabled={saving}>
          <Save className="mr-2 h-4 w-4" /> {saving ? 'Guardando…' : 'Guardar horarios'}
        </Button>
      </div>
    </div>
  )
}

function TimeInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <Label className="hidden text-xs text-muted-foreground lg:block">{label}</Label>
      <Input
        type="time"
        step={300}
        className="h-8 w-24 bg-background px-1.5 text-sm sm:w-28"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}