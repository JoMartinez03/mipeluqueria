import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { computeAvailableSlots } from '@/lib/booking'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const slug = searchParams.get('slug')
  const serviceId = searchParams.get('serviceId')
  const dateStr = searchParams.get('date')

  if (!slug || !serviceId || !dateStr) {
    return Response.json({ error: 'Parámetros incompletos' }, { status: 400 })
  }

  const date = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return Response.json({ error: 'Fecha inválida' }, { status: 400 })
  }

  const barbershop = await prisma.barbershop.findUnique({ where: { slug } })
  if (!barbershop) {
    return Response.json({ error: 'Peluquería no encontrada' }, { status: 404 })
  }

  const service = await prisma.service.findFirst({
    where: { id: serviceId, barbershopId: barbershop.id, active: true },
  })
  if (!service) {
    return Response.json({ error: 'Servicio no encontrado' }, { status: 404 })
  }

  const slots = await computeAvailableSlots({
    barbershopId: barbershop.id,
    timezone: barbershop.timezone,
    duration: service.duration,
    date,
  })

  return Response.json({ slots })
}