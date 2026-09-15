import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireBarbershopAccess } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { startOfLocalDayInUtc, endOfLocalDayInUtc } from '@/lib/booking'

const createSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  closed: z.boolean().optional(),
  open1: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  close1: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  open2: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  close2: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  reason: z.string().max(200).optional().nullable(),
})

export async function POST(request: NextRequest) {
  const access = await requireBarbershopAccess()
  if (!access) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }, { status: 400 })
  }

  const barbershop = await prisma.barbershop.findUnique({
    where: { id: access.barbershopId },
    select: { timezone: true },
  })
  if (!barbershop) return Response.json({ error: 'No encontrado' }, { status: 404 })

  const [y, m, d] = parsed.data.date.split('-').map(Number)
  const localDate = new Date(y, (m ?? 1) - 1, d)
  const dayStart = startOfLocalDayInUtc(localDate, barbershop.timezone)
  const dayEnd = endOfLocalDayInUtc(localDate, barbershop.timezone)

  const data = {
    closed: parsed.data.closed ?? false,
    open1: parsed.data.open1 ?? null,
    close1: parsed.data.close1 ?? null,
    open2: parsed.data.open2 ?? null,
    close2: parsed.data.close2 ?? null,
    reason: parsed.data.reason ?? null,
  }

  const exception = await prisma.scheduleException.upsert({
    where: {
      barbershopId_date: { barbershopId: access.barbershopId, date: dayStart },
    },
    create: { barbershopId: access.barbershopId, date: dayStart, ...data },
    update: data,
  })

  return Response.json({ exception, dayEnd }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const access = await requireBarbershopAccess()
  if (!access) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const date = (body as { date?: string })?.date
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: 'Fecha inválida' }, { status: 400 })
  }

  const barbershop = await prisma.barbershop.findUnique({
    where: { id: access.barbershopId },
    select: { timezone: true },
  })
  if (!barbershop) return Response.json({ error: 'No encontrado' }, { status: 404 })

  const [y, m, d] = date.split('-').map(Number)
  const localDate = new Date(y, (m ?? 1) - 1, d)
  const dayStart = startOfLocalDayInUtc(localDate, barbershop.timezone)

  await prisma.scheduleException.deleteMany({
    where: { barbershopId: access.barbershopId, date: dayStart },
  })

  return Response.json({ success: true })
}