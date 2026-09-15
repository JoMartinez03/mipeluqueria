import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireBarbershopAccess } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  id: z.string(),
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']),
})

export async function PATCH(request: NextRequest) {
  const access = await requireBarbershopAccess()
  if (!access) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }, { status: 400 })
  }

  const { id, status } = parsed.data

  const appointment = await prisma.appointment.findFirst({
    where: { id, barbershopId: access.barbershopId },
  })
  if (!appointment) return Response.json({ error: 'Turno no encontrado' }, { status: 404 })

  if (status === 'CANCELLED' && appointment.status === 'CANCELLED') {
    return Response.json({ appointment })
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status },
  })

  return Response.json({ appointment: updated })
}

export async function DELETE(request: NextRequest) {
  const access = await requireBarbershopAccess()
  if (!access) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const id = (body as { id?: string })?.id
  if (!id) return Response.json({ error: 'Falta el id del turno' }, { status: 400 })

  const existing = await prisma.appointment.findFirst({
    where: { id, barbershopId: access.barbershopId },
  })
  if (!existing) return Response.json({ error: 'Turno no encontrado' }, { status: 404 })

  const appointment = await prisma.appointment.update({
    where: { id },
    data: { status: 'CANCELLED' },
  })

  return Response.json({ appointment })
}