'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
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
        {rows.map((r) => (
          <div key={r.dayOfWeek} className="flex flex-col gap-4 py-4 first:pt-0 sm:flex-row sm:items-center">
            <div className="flex w-32 shrink-0 items-center gap-3">
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
              <div className="text-sm text-muted-foreground">Cerrado</div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <TimeInput
                  label="Desde"
                  value={r.open1 ?? ''}
                  onChange={(v) => update(r.dayOfWeek, { open1: v || null })}
                />
                <span className="text-muted-foreground">a</span>
                <TimeInput
                  label="Hasta"
                  value={r.close1 ?? ''}
                  onChange={(v) => update(r.dayOfWeek, { close1: v || null })}
                />
                <span className="text-sm text-muted-foreground">·</span>
                <TimeInput
                  label="Turno 2 (opcional) desde"
                  value={r.open2 ?? ''}
                  onChange={(v) => update(r.dayOfWeek, { open2: v || null })}
                />
                <span className="text-muted-foreground">a</span>
                <TimeInput
                  label="hasta"
                  value={r.close2 ?? ''}
                  onChange={(v) => update(r.dayOfWeek, { close2: v || null })}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
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
        className="w-28"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}