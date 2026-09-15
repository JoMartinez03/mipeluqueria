import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireBarbershopAccess } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const daySchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  open1: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  close1: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  open2: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  close2: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  closed: z.boolean().optional(),
})

const schema = z.object({ days: z.array(daySchema).min(1).max(7) })

export async function POST(request: NextRequest) {
  const access = await requireBarbershopAccess()
  if (!access) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }, { status: 400 })
  }

  for (const day of parsed.data.days) {
    const data = {
      open1: day.open1 ?? null,
      close1: day.close1 ?? null,
      open2: day.open2 ?? null,
      close2: day.close2 ?? null,
      closed: day.closed ?? false,
    }

    await prisma.businessHour.upsert({
      where: {
        barbershopId_dayOfWeek: {
          barbershopId: access.barbershopId,
          dayOfWeek: day.dayOfWeek,
        },
      },
      create: { barbershopId: access.barbershopId, dayOfWeek: day.dayOfWeek, ...data },
      update: data,
    })
  }

  return Response.json({ success: true })
}