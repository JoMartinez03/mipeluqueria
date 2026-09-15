import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardPageHeader } from '@/components/dashboard/sidebar'
import { BusinessHoursEditor } from '@/components/dashboard/business-hours-editor'
import { ScheduleExceptions } from '@/components/dashboard/schedule-exceptions'
import { getVerifiedBarbershop } from '@/lib/tenants'
import { prisma } from '@/lib/prisma'
import { toYmd } from '@/lib/dates'
import { utcToZonedTime } from '@/lib/booking'

export default async function HorariosPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { barbershop } = await getVerifiedBarbershop(slug)

  const hours = barbershop.businessHours.map((h) => ({
    dayOfWeek: h.dayOfWeek,
    open1: h.open1,
    close1: h.close1,
    open2: h.open2,
    close2: h.close2,
    closed: h.closed,
  }))

  const exceptions = await prisma.scheduleException.findMany({
    where: { barbershopId: barbershop.id },
    orderBy: { date: 'desc' },
  })

  const exceptionRows = exceptions.map((e) => {
    const local = utcToZonedTime(e.date, barbershop.timezone)
    return {
      date: toYmd(local),
      closed: e.closed,
      open1: e.open1,
      close1: e.close1,
      open2: e.open2,
      close2: e.close2,
      reason: e.reason,
    }
  })

  return (
    <>
      <DashboardPageHeader
        title="Horarios"
        description="Definí cuándo recibís clientes y los días especiales"
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Horario semanal</CardTitle>
            <CardDescription>Tu disponibilidad habitual, día por día</CardDescription>
          </CardHeader>
          <CardContent>
            <BusinessHoursEditor hours={hours} timezone={barbershop.timezone} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Días especiales</CardTitle>
            <CardDescription>Feriados, vacaciones o cierres puntuales</CardDescription>
          </CardHeader>
          <CardContent>
            <ScheduleExceptions exceptions={exceptionRows} timezone={barbershop.timezone} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}