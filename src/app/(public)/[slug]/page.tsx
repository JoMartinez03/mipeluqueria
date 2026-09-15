import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Phone, AtSign, MessageCircle, Scissors, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/format'
import { DAY_NAMES } from '@/lib/constants'

export default async function PublicBarbershopPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const barbershop = await prisma.barbershop.findUnique({
    where: { slug },
    include: {
      services: { where: { active: true }, orderBy: { createdAt: 'asc' } },
      businessHours: { orderBy: { dayOfWeek: 'asc' } },
    },
  })

  if (!barbershop) notFound()

  const scheduleByDay = new Map(barbershop.businessHours.map((h) => [h.dayOfWeek, h]))

  return (
    <div className="animate-slide-up">
      <section className="relative overflow-hidden">
        <div className="gradient-sidebar absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.08),transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <Badge className="mb-4 rounded-full bg-white/10 text-white ring-1 ring-white/20">
            <Scissors className="mr-1.5 h-3 w-3" /> Reservas online
          </Badge>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {barbershop.name}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/70">
            {barbershop.description ?? 'Reservá tu turno online en minutos, elegí el día y el horario que mejor te queden.'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button render={<Link href={`/${slug}/reservar`} />} size="lg" className="bg-white text-foreground hover:bg-white/90">
              Reservar turno <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            {barbershop.instagram && (
              <Button render={<a href={`https://instagram.com/${barbershop.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" />} size="lg" variant="ghost" className="text-white hover:bg-white/10">
                <AtSign className="mr-2 h-4 w-4" /> Instagram
              </Button>
            )}
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-white/60">
            {barbershop.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {barbershop.address}
              </span>
            )}
            {barbershop.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-4 w-4" /> {barbershop.phone}
              </span>
            )}
            {barbershop.whatsapp && (
              <span className="flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4" /> {barbershop.whatsapp}
              </span>
            )}
          </div>
        </div>
      </section>

      <section id="servicios" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Scissors className="h-4 w-4" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Servicios</h2>
        </div>
        {barbershop.services.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Todavía no hay servicios publicados.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {barbershop.services.map((service) => (
              <Card key={service.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <h3 className="font-semibold">{service.name}</h3>
                  {service.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold">{formatPrice(service.price)}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> {service.duration} min
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <div className="mt-8 flex justify-center">
          <Button render={<Link href={`/${slug}/reservar`} />} size="lg">
            Elegir horario <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      <section className="border-t bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-xl font-bold tracking-tight">Horarios de atención</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DAY_NAMES.map((day, i) => {
              const h = scheduleByDay.get(i)
              const closed = !h || h.closed || !h.open1 || !h.close1
              return (
                <div key={day} className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
                  <span className={closed ? 'text-muted-foreground' : 'font-medium'}>{day}</span>
                  <span className="text-sm text-muted-foreground">
                    {closed
                      ? 'Cerrado'
                      : `${h?.open1} – ${h?.close1}${h?.open2 && h.close2 ? ` · ${h.open2} – ${h.close2}` : ''}`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}