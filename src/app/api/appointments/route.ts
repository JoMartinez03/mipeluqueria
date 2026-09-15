import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import {
  zonedTimeToUtc,
  computeAvailableSlots,
} from '@/lib/booking'

export const dynamic = 'force-dynamic'

const appointmentSchema = z.object({
  slug: z.string(),
  serviceId: z.string(),
  date: z.string(), // YYYY-MM-DD (fecha local del negocio)
  time: z.string(), // HH:mm (hora local del negocio)
  customerName: z.string().min(2, 'Ingresá tu nombre'),
  customerPhone: z.string().min(6, 'Ingresá un teléfono válido'),
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) {
    return Response.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const parsed = appointmentSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' },
      { status: 400 }
    )
  }

  const { slug, serviceId, date, time, customerName, customerPhone } = parsed.data

  const barbershop = await prisma.barbershop.findUnique({ where: { slug } })
  if (!barbershop) return Response.json({ error: 'Peluquería no encontrada' }, { status: 404 })

  const service = await prisma.service.findFirst({
    where: { id: serviceId, barbershopId: barbershop.id, active: true },
  })
  if (!service) return Response.json({ error: 'Servicio no encontrado' }, { status: 404 })

  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  if (!y || !m || !d || hh === undefined || mm === undefined) {
    return Response.json({ error: 'Fecha u horario inválidos' }, { status: 400 })
  }

  const localDate = new Date(y, m - 1, d)
  const dateObj = new Date(`${date}T00:00:00`)

  const slots = await computeAvailableSlots({
    barbershopId: barbershop.id,
    timezone: barbershop.timezone,
    duration: service.duration,
    date: dateObj,
  })
  if (!slots.includes(time)) {
    return Response.json(
      { error: 'Ese horario ya no está disponible. Elegí otro.' },
      { status: 409 }
    )
  }

  const localStart = new Date(localDate)
  localStart.setHours(hh, mm, 0, 0)
  const startAt = zonedTimeToUtc(localStart, barbershop.timezone)
  const endAt = new Date(startAt.getTime() + service.duration * 60000)

  try {
    await prisma.$transaction(async (tx) => {
      const conflicting = await tx.appointment.findFirst({
        where: {
          barbershopId: barbershop.id,
          status: { not: 'CANCELLED' },
          startAt: { lt: endAt },
          endAt: { gt: startAt },
        },
      })

      if (conflicting) {
        throw new SlotTakenError()
      }

      await tx.appointment.create({
        data: {
          barbershopId: barbershop.id,
          serviceId: service.id,
          customerName,
          customerPhone,
          startAt,
          endAt,
          status: 'PENDING',
        },
      })
    })

    return Response.json(
      {
        success: true,
        appointment: {
          barbershopName: barbershop.name,
          serviceName: service.name,
          price: service.price,
          date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
          time,
        },
      },
      { status: 201 }
    )
  } catch (e) {
    if (e instanceof SlotTakenError) {
      return Response.json(
        { error: 'Ese horario acaba de ser reservado por otra persona. Elegí otro.' },
        { status: 409 }
      )
    }
    if ((e as { code?: string }).code === 'P2002') {
      return Response.json(
        { error: 'Ese horario acaba de ser reservado por otra persona. Elegí otro.' },
        { status: 409 }
      )
    }
    return Response.json({ error: 'Error al crear el turno' }, { status: 500 })
  }
}

class SlotTakenError extends Error {}