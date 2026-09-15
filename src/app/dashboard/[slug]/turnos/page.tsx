import Link from 'next/link'
import { Filter } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DashboardPageHeader } from '@/components/dashboard/sidebar'
import { AppointmentStatusMenu } from '@/components/dashboard/appointment-status-menu'
import { getVerifiedBarbershop } from '@/lib/tenants'
import { prisma } from '@/lib/prisma'
import { formatClock, formatShortDate, formatPrice } from '@/lib/format'
import { addDays, topOfLocalDayUtc } from '@/lib/dates'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'

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

  const buildHref = (r: string, s: string) =>
    `/dashboard/${slug}/turnos?rango=${r}&estado=${s}`

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

      <div className="mb-4 flex flex-wrap items-center gap-2">
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
        <span className="mx-1 h-4 w-px bg-border" />
        {STATUS_FILTERS.map((s) => (
          <Button
            key={s.id}
            render={<Link href={buildHref(range, s.id)} />}
            size="sm"
            variant={status === s.id ? 'secondary' : 'ghost'}
          >
            {s.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {range === 'hoy' ? 'Turnos de hoy' : range === 'proximos' ? 'Próximos turnos' : 'Todos los turnos'}
          </CardTitle>
          <CardDescription>
            {status === 'TODOS' ? 'Mostrando todos los estados' : `Filtrando por ${STATUS_LABELS[status]}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No hay turnos en esta vista.
            </div>
          ) : (
            <div className="divide-y">
              {appointments.map((a) => {
                return (
                  <div key={a.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4">
                    <div className="w-32 shrink-0 sm:text-left">
                      <div className="text-sm font-semibold">
                        {formatClock(a.startAt, barbershop.timezone)} hs
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatShortDate(a.startAt, barbershop.timezone)}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{a.customerName}</div>
                      <div className="truncate text-sm text-muted-foreground">
                        {a.service.name} · {formatPrice(a.service.price)}
                      </div>
                      <div className="truncate text-xs text-muted-foreground/80">{a.customerPhone}</div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn('shrink-0 rounded-full', STATUS_COLORS[a.status])}
                    >
                      {STATUS_LABELS[a.status]}
                    </Badge>
                    <AppointmentStatusMenu id={a.id} status={a.status} />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}