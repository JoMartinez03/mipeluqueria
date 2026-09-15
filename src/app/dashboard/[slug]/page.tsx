import Link from 'next/link'
import { CalendarDays, Clock, Wallet, Users } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardPageHeader } from '@/components/dashboard/sidebar'
import { AppointmentStatusMenu } from '@/components/dashboard/appointment-status-menu'
import { getVerifiedBarbershop } from '@/lib/tenants'
import { prisma } from '@/lib/prisma'
import { formatClock, formatPrice } from '@/lib/format'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants'
import { topOfLocalDayUtc, addDays } from '@/lib/dates'
import { cn } from '@/lib/utils'

export default async function DashboardHomePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { barbershop } = await getVerifiedBarbershop(slug)

  const todayStart = topOfLocalDayUtc(new Date(), barbershop.timezone)
  const todayEnd = addDays(todayStart, 1)
  const weekStart = topOfLocalDayUtc(new Date(), barbershop.timezone)

  const [todayAppointments, todayCounts, weekCount] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        barbershopId: barbershop.id,
        startAt: { gte: todayStart, lt: todayEnd },
      },
      include: { service: true },
      orderBy: { startAt: 'asc' },
    }),
    prisma.appointment.groupBy({
      by: ['status'],
      where: {
        barbershopId: barbershop.id,
        startAt: { gte: todayStart, lt: todayEnd },
      },
      _count: true,
    }),
    prisma.appointment.count({
      where: {
        barbershopId: barbershop.id,
        status: { in: ['PENDING', 'CONFIRMED'] },
        startAt: { gte: weekStart },
      },
    }),
  ])

  const counts: Record<string, number> = {}
  for (const g of todayCounts) counts[g.status] = g._count

  const activeToday = todayAppointments.filter(
    (a) => a.status === 'PENDING' || a.status === 'CONFIRMED'
  )
  const revenueToday = todayAppointments
    .filter((a) => a.status === 'CONFIRMED' || a.status === 'COMPLETED')
    .reduce((sum, a) => sum + a.service.price, 0)

  const nextAppointment = activeToday[0]
  const pendingCount = counts.PENDING ?? 0

  return (
    <>
      <DashboardPageHeader
        title={`Hola, ${barbershop.name}`}
        description="Resumen de tu actividad de hoy"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<CalendarDays className="h-5 w-5" />}
          label="Turnos de hoy"
          value={String(todayAppointments.length)}
          hint={pendingCount > 0 ? `${pendingCount} pendientes de confirmar` : 'Sin pendientes'}
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Próximo turno"
          value={nextAppointment ? formatClock(nextAppointment.startAt, barbershop.timezone) : '—'}
          hint={nextAppointment ? nextAppointment.customerName : 'Sin turnos agendados'}
        />
        <StatCard
          icon={<Wallet className="h-5 w-5" />}
          label="Ingresos estimados"
          value={formatPrice(revenueToday)}
          hint="Confirmados y completados"
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Próximos 7 días"
          value={String(weekCount)}
          hint="Turnos activos agendados"
        />
      </div>

      <Card className="mt-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Turnos de hoy</CardTitle>
            <CardDescription>
              {todayAppointments.length === 0
                ? 'Todavía no tenés turnos agendados para hoy.'
                : `${activeToday.length} activos · ${counts.COMPLETED ?? 0} completados`}
            </CardDescription>
          </div>
          <Button render={<Link href={`/dashboard/${slug}/turnos`} />} variant="outline" size="sm">
            Ver todos
          </Button>
        </CardHeader>
        <CardContent>
          {todayAppointments.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Cuando un cliente reserve, vas a verlo acá.
            </div>
          ) : (
            <div className="divide-y">
              {todayAppointments.map((a) => (
                <div key={a.id} className="flex items-center gap-4 py-3">
                  <div className="w-14 shrink-0 text-sm font-semibold">
                    {formatClock(a.startAt, barbershop.timezone)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{a.customerName}</div>
                    <div className="truncate text-sm text-muted-foreground">
                      {a.service.name} · {formatPrice(a.service.price)}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn('shrink-0 rounded-full', STATUS_COLORS[a.status])}
                  >
                    {STATUS_LABELS[a.status]}
                  </Badge>
                  <AppointmentStatusMenu id={a.id} status={a.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <span className="text-muted-foreground">{icon}</span>
        </div>
        <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}