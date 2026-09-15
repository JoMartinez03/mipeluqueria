import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BookingFlow } from '@/components/booking/booking-flow'
import { toYmd } from '@/lib/dates'
import { utcToZonedTime } from '@/lib/booking'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const barbershop = await prisma.barbershop.findUnique({
    where: { slug },
    select: { name: true },
  })
  if (!barbershop) return { title: 'No encontrado' }
  return { title: `Reservar turno · ${barbershop.name}` }
}

export default async function ReservarPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const barbershop = await prisma.barbershop.findUnique({
    where: { slug },
    include: {
      services: { where: { active: true }, orderBy: { price: 'asc' } },
      businessHours: true,
    },
  })

  if (!barbershop) notFound()

  const localToday = utcToZonedTime(new Date(), barbershop.timezone)
  const closedDays = barbershop.businessHours
    .filter((h) => h.closed || !h.open1 || !h.close1)
    .map((h) => h.dayOfWeek)

  const services = barbershop.services.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    price: s.price,
    duration: s.duration,
  }))

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Reservá tu turno</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          En {barbershop.name} · Elegí el servicio y el horario que más te convengan
        </p>
      </div>

      {services.length === 0 ? (
        <div className="mx-auto max-w-md rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">
          Esta peluquería todavía no publicó servicios. Volvé más tarde.
        </div>
      ) : (
        <BookingFlow
          slug={barbershop.slug}
          services={services}
          minDateYMD={toYmd(localToday)}
          closedDays={closedDays}
          barbershopName={barbershop.name}
          address={barbershop.address}
        />
      )}
    </div>
  )
}