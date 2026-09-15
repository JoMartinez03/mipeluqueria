import Link from 'next/link'
import { Filter, CalendarX2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DashboardPageHeader } from '@/components/dashboard/sidebar'
import { AppointmentTimeline, type TimelineAppointment } from '@/components/dashboard/appointment-timeline'
import { getVerifiedBarbershop } from '@/lib/tenants'
import { prisma } from '@/lib/prisma'
import { formatShortDate } from '@/lib/format'
import { addDays, topOfLocalDayUtc, toYmd } from '@/lib/dates'
import { utcToZonedTime } from '@/lib/booking'
import { STATUS_LABELS } from '@/lib/constants'

const RANGES = [
  { id: 'hoy', label: 'Hoy', default: true },
  { id: 'proximos', label: 'Próximos' },
  { id: 'todos', label: 'Todos' },
] as const

const STATUS_FILTERS = [
  { id: 'TODOS', label: 'Todos' },
  { id: 'PENDING', label: 'Pendientes' },
  { id: 'CONFIRMED', label: 'Confirmados' },
  { id: 'COMPLETED', label: 'Completados' },
  { id: 'CANCELLED', label: 'Cancelados' },
] as const

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function TurnosPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const range = String(sp.rango ?? 'hoy') as (typeof RANGES)[number]['id']
  const status = String(sp.estado ?? 'TODOS')

  const { barbershop } = await getVerifiedBarbershop(slug)

  const todayStart = topOfLocalDayUtc(new Date(), barbershop.timezone)
  const startRange =
    range === 'hoy'
      ? todayStart
      : range === 'proximos'
        ? new Date()
        : undefined
  const endRange = range === 'hoy' ? addDays(todayStart, 1) : undefined

  const appointments = await prisma.appointment.findMany({
    where: {
      barbershopId: barbershop.id,
      ...(startRange ? { startAt: { gte: startRange } } : {}),
      ...(endRange ? { startAt: { lt: endRange } } : {}),
      ...(status !== 'TODOS' ? { status: status as 'PENDING' } : {}),
    },
    include: { service: true },
    orderBy: { startAt: 'asc' },
  })

  const rows: TimelineAppointment[] = appointments.map((a) => ({
    id: a.id,
    startAt: a.startAt,
    customerName: a.customerName,
    status: a.status,
    phone: a.customerPhone,
    serviceName: a.service.name,
    price: a.service.price,
    duration: a.service.duration,
  }))

  const groups: { label?: string; items: TimelineAppointment[] }[] = []
  for (const row of rows) {
    const dayKey = toYmd(utcToZonedTime(row.startAt, barbershop.timezone))
    const last = groups[groups.length - 1]
    if (last && last.label === dayKey) {
      last.items.push(row)
    } else {
      groups.push({ label: dayKey, items: [row] })
    }
  }

  for (const g of groups) {
    g.label = formatShortDate(g.items[0].startAt, barbershop.timezone)
  }

  const buildHref = (r: string, s: string) =>
    `/dashboard/${slug}/turnos?rango=${r}&estado=${s}`

  const sectionTitle =
    range === 'hoy'
      ? 'Turnos de hoy'
      : range === 'proximos'
        ? 'Próximos turnos'
        : 'Todos los turnos'

  return (
    <>
      <DashboardPageHeader
        title="Turnos"
        description="Gestioná todas tus reservas"
        action={
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            {appointments.length} turnos
          </div>
        }
      />

      <div className="mb-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Período
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {RANGES.map((r) => (
              <Button
                key={r.id}
                render={<Link href={buildHref(r.id, status)} />}
                size="sm"
                variant={range === r.id ? 'default' : 'outline'}
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Estado
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {STATUS_FILTERS.map((s) => (
              <Button
                key={s.id}
                render={<Link href={buildHref(range, s.id)} />}
                size="sm"
                variant={status === s.id ? 'default' : 'ghost'}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{sectionTitle}</CardTitle>
          <CardDescription>
            {status === 'TODOS' ? 'Mostrando todos los estados' : `Filtrando por ${STATUS_LABELS[status] ?? status}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/30 px-6 py-12 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <CalendarX2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium">No hay turnos en esta vista</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Probá con otro período o estado para ver más turnos.
                </p>
              </div>
              {(range !== 'hoy' || status !== 'TODOS') && (
                <Button render={<Link href={buildHref('hoy', 'TODOS')} />} variant="outline" size="sm">
                  Ver turnos de hoy
                </Button>
              )}
            </div>
          ) : (
            <AppointmentTimeline timezone={barbershop.timezone} groups={groups} />
          )}
        </CardContent>
      </Card>
    </>
  )
}