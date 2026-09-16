'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { es } from 'date-fns/locale'
import { Check, ChevronLeft, Clock, Loader2, MapPin, Scissors } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { useToast } from '@/components/ui/use-toast'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'

export type BookingService = {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
}

const STEPS = [
  { id: 'service', label: 'Servicio' },
  { id: 'schedule', label: 'Día y hora' },
  { id: 'details', label: 'Tus datos' },
]

export function BookingFlow({
  slug,
  services,
  minDateYMD,
  closedDays,
  barbershopName,
  address,
}: {
  slug: string
  services: BookingService[]
  minDateYMD: string
  closedDays: number[]
  barbershopName: string
  address?: string | null
}) {
  const router = useRouter()
  const { toast } = useToast()

  const [step, setStep] = useState(0)
  const [serviceId, setServiceId] = useState<string | null>(
    services.length === 1 ? services[0].id : null
  )
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [slots, setSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [time, setTime] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState<null | {
    serviceName: string
    price: number
    date: string
    time: string
  }>(null)

  const service = useMemo(() => services.find((s) => s.id === serviceId) ?? null, [serviceId, services])

  const fetchSlots = useCallback(
    async (svcId: string, day: Date) => {
      setLoadingSlots(true)
      setTime(null)
      setSlots([])
      const ymd = toYmd(day)
      try {
        const res = await fetch(
          `/api/available-slots?slug=${encodeURIComponent(slug)}&serviceId=${encodeURIComponent(svcId)}&date=${ymd}`
        )
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Error')
        setSlots(data.slots ?? [])
      } catch {
        toast({ title: 'No se pudieron cargar los horarios', variant: 'destructive' })
      } finally {
        setLoadingSlots(false)
      }
    },
    [slug, toast]
  )

  const selectService = (svcId: string) => {
    setServiceId(svcId)
    if (date) void fetchSlots(svcId, date)
    setStep(1)
  }

  const selectDate = (day: Date | undefined) => {
    setDate(day)
    if (day && serviceId) void fetchSlots(serviceId, day)
  }

  const startIndex = serviceId ? (services.length === 1 ? 1 : 0) : 0

  const submit = async () => {
    if (!serviceId || !date || !time) return
    if (name.trim().length < 2) {
      toast({ title: 'Ingresá tu nombre', variant: 'destructive' })
      return
    }
    if (phone.trim().length < 6) {
      toast({ title: 'Ingresá un teléfono válido', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          serviceId,
          date: toYmd(date),
          time,
          customerName: name.trim(),
          customerPhone: phone.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al reservar')
      setDone({
        serviceName: data.appointment.serviceName,
        price: data.appointment.price,
        date: formatEsDate(data.appointment.date),
        time: data.appointment.time,
      })
      setStep(3)
    } catch (e) {
      toast({ title: 'No se pudo reservar', description: (e as Error).message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg animate-slide-up">
        <div className="rounded-2xl border bg-card shadow-sm">
          <div className="flex flex-col items-center px-6 pb-6 pt-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
              <Check className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">Turno reservado</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Te esperamos en {barbershopName}
            </p>
          </div>
          <div className="border-t px-6 py-5">
            <dl className="space-y-3 text-sm">
              <Row label="Servicio" value={done.serviceName} />
              <Row label="Fecha" value={done.date} />
              <Row label="Hora" value={`${done.time} hs`} />
              <Row label="Precio" value={formatPrice(done.price)} />
            </dl>
          </div>
          <div className="border-t px-6 py-5">
            <p className="text-xs text-muted-foreground">
              Sin moverte de casa. Si necesitás cambiar o cancelar, llamá o escribí a la peluquería.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t px-6 py-4">
            <Button render={<Link href={`/${slug}`} />} variant="outline">
              Volver a {barbershopName}
            </Button>
            <Button onClick={() => { router.refresh() }}>
              Reservar otro
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Stepper current={step} startIndex={startIndex} />

      {step === 0 && (
        <div className="animate-step-slide space-y-3">
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => selectService(s.id)}
              className={cn(
                'flex w-full items-center gap-4 rounded-xl border bg-card p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md',
                serviceId === s.id &&
                  'border-primary bg-primary/[0.03] ring-2 ring-primary/20'
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Scissors className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{s.name}</div>
                {s.description && (
                  <div className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{s.description}</div>
                )}
              </div>
              {serviceId === s.id && (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
              <div className="shrink-0 text-right">
                <div className="font-bold">{formatPrice(s.price)}</div>
                <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {s.duration} min
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {step === 1 && service && (
        <div className="grid animate-step-slide gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm font-medium">1 · Elegí el día</span>
              {address && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {address}
                </span>
              )}
            </div>
            <div className="rounded-xl border">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => selectDate(d)}
                locale={es}
                disabled={(d) => {
                  const ymd = toYmd(d)
                  return ymd < minDateYMD || closedDays.includes(d.getDay())
                }}
                className="w-full"
              />
            </div>
          </div>
          <div>
            <div className="mb-3 text-sm font-medium">2 · Elegí la hora — {date ? formatEsDate(toYmd(date)) : '…'}</div>
            {!date ? (
              <div className="rounded-xl border border-dashed bg-muted/30 p-10 text-center text-sm text-muted-foreground">
                Seleccioná un día para ver los horarios disponibles.
              </div>
            ) : loadingSlots ? (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/30 p-10 text-center">
                <p className="text-sm font-medium">Sin horarios disponibles</p>
                <p className="mt-1 text-xs text-muted-foreground">Probá con otro día.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots.map((s) => (
                  <Button
                    key={s}
                    variant={time === s ? 'default' : 'outline'}
                    className="h-10"
                    onClick={() => setTime(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            )}
            <div className="mt-6 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(0)}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Servicio
              </Button>
              <Button disabled={!time} onClick={() => setStep(2)}>
                Continuar
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && service && date && time && (
        <div className="grid animate-step-slide gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <div className="mb-1 text-sm font-medium">Tus datos</div>
            <div className="space-y-2">
              <Label htmlFor="bk-name">Nombre</Label>
              <Input
                id="bk-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Juan Pérez"
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bk-phone">Teléfono</Label>
              <Input
                id="bk-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+54 9 261 000 0000"
                autoComplete="tel"
              />
            </div>
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep(1)} disabled={submitting}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Atrás
              </Button>
              <Button onClick={() => void submit()} disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                {submitting ? 'Reservando…' : 'Confirmar reserva'}
              </Button>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <div className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Resumen
            </div>
            <dl className="mt-3 space-y-3 text-sm">
              <Row label="Servicio" value={service.name} />
              <Row label="Duración" value={`${service.duration} min`} />
              <Row label="Fecha" value={formatEsDate(toYmd(date))} />
              <Row label="Hora" value={`${time} hs`} />
              <Row label="Total" value={formatPrice(service.price)} strong />
            </dl>
          </div>
        </div>
      )}
    </div>
  )
}

function Stepper({ current, startIndex }: { current: number; startIndex: number }) {
  const steps = STEPS.slice(startIndex)
  const currentIdx = current - startIndex
  return (
    <ol className="mb-8 flex items-center gap-2">
      {steps.map((s, i) => (
        <li key={s.id} className="flex items-center gap-2">
          <span
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
              i < currentIdx
                ? 'bg-primary text-primary-foreground'
                : i === currentIdx
                  ? 'bg-primary/15 text-primary ring-1 ring-primary/40'
                  : 'bg-muted text-muted-foreground'
            )}
          >
            {i < currentIdx ? <Check className="h-3.5 w-3.5" /> : i + 1}
          </span>
          <span
            className={cn(
              'text-sm',
              i === currentIdx ? 'font-medium text-foreground' : 'text-muted-foreground'
            )}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && <span className="mx-1 h-px w-6 bg-border" />}
        </li>
      ))}
    </ol>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn('text-right', strong ? 'text-base font-bold' : 'font-medium')}>{value}</dd>
    </div>
  )
}

function toYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatEsDate(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number)
  const date = new Date(y, (m ?? 1) - 1, d)
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
}