import Link from 'next/link'
import { CalendarDays, Clock, Wallet, Users, CalendarCheck } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DashboardPageHeader } from '@/components/dashboard/sidebar'
import { AppointmentTimeline } from '@/components/dashboard/appointment-timeline'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { CopyLinkButton } from '@/components/dashboard/copy-link-button'
import { getVerifiedBarbershop } from '@/lib/tenants'
import { prisma } from '@/lib/prisma'
import { formatClock, formatPrice } from '@/lib/format'
import { topOfLocalDayUtc, addDays } from '@/lib/dates'

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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<CalendarDays className="h-4 w-4" />}
          label="Turnos de hoy"
          value={String(todayAppointments.length)}
          hint={
            pendingCount > 0
              ? `${pendingCount} pendientes de confirmar`
              : todayAppointments.length > 0
                ? 'Sin pendientes hoy'
                : 'Aún sin turnos'
          }
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Próximo turno"
          value={nextAppointment ? formatClock(nextAppointment.startAt, barbershop.timezone) : '—'}
          hint={nextAppointment ? nextAppointment.customerName : 'Sin turnos agendados'}
        />
        <StatCard
          icon={<Wallet className="h-4 w-4" />}
          label="Ingresos estimados"
          value={formatPrice(revenueToday)}
          hint="Confirmados y completados"
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Próximos 7 días"
          value={String(weekCount)}
          hint="Turnos activos agendados"
        />
      </div>

      <section className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Acciones rápidas
          </h2>
          <span className="h-px flex-1 bg-border" />
        </div>
        <QuickActions slug={slug} />
      </section>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Próximos turnos</CardTitle>
            <CardDescription>
              {todayAppointments.length === 0
                ? 'Todavía no tenés turnos agendados para hoy.'
                : `${activeToday.length} activos · ${counts.COMPLETED ?? 0} completados`}
            </CardDescription>
          </div>
          {todayAppointments.length > 0 && (
            <Button render={<Link href={`/dashboard/${slug}/turnos`} />} variant="outline" size="sm">
              Ver todos
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {todayAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/30 px-6 py-10 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CalendarCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium">No hay turnos hoy</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Cuando recibas una reserva aparecerá acá.
                </p>
              </div>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                <Button
                  render={
                    <Link href={`/${slug}`} target="_blank" rel="noopener noreferrer" />
                  }
                  variant="outline"
                  size="sm"
                >
                  Ver página pública <ExternalLinkIcon className="ml-1.5 h-3.5 w-3.5" />
                </Button>
                <CopyLinkButton
                  path={`/${slug}`}
                  label="Copiar enlace"
                  size="sm"
                  className="w-auto"
                  toastTitle="Enlace de reservas copiado"
                />
              </div>
            </div>
          ) : (
            <AppointmentTimeline
              timezone={barbershop.timezone}
              groups={[
                {
                  items: todayAppointments.map((a) => ({
                    id: a.id,
                    startAt: a.startAt,
                    customerName: a.customerName,
                    status: a.status,
                    phone: a.customerPhone,
                    serviceName: a.service.name,
                    price: a.service.price,
                    duration: a.service.duration,
                  })),
                },
              ]}
            />
          )}
        </CardContent>
      </Card>
    </>
  )
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 5h5v5M19 5l-8 8M9 5H5a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-4"
      />
    </svg>
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
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </span>
        </div>
        <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}