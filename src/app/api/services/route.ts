import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireBarbershopAccess } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const serviceSchema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().max(300).optional().nullable(),
  price: z.coerce.number().int().min(0).max(9999999),
  duration: z.coerce.number().int().min(5).max(1440),
  active: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  const access = await requireBarbershopAccess()
  if (!access) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = serviceSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }, { status: 400 })
  }

  const service = await prisma.service.create({
    data: {
      barbershopId: access.barbershopId,
      ...parsed.data,
      description: parsed.data.description ?? null,
      active: true,
    },
  })

  return Response.json({ service })
}

export async function PATCH(request: NextRequest) {
  const access = await requireBarbershopAccess()
  if (!access) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const id = (body as { id?: string })?.id
  if (!id) return Response.json({ error: 'Falta el id del servicio' }, { status: 400 })

  const parsed = serviceSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }, { status: 400 })
  }

  const existing = await prisma.service.findFirst({
    where: { id, barbershopId: access.barbershopId },
  })
  if (!existing) return Response.json({ error: 'Servicio no encontrado' }, { status: 404 })

  const service = await prisma.service.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      price: parsed.data.price,
      duration: parsed.data.duration,
      ...(parsed.data.active !== undefined ? { active: parsed.data.active } : {}),
    },
  })

  return Response.json({ service })
}

export async function DELETE(request: NextRequest) {
  const access = await requireBarbershopAccess()
  if (!access) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const id = (body as { id?: string })?.id
  if (!id) return Response.json({ error: 'Falta el id del servicio' }, { status: 400 })

  const existing = await prisma.service.findFirst({
    where: { id, barbershopId: access.barbershopId },
  })
  if (!existing) return Response.json({ error: 'Servicio no encontrado' }, { status: 404 })

  const service = await prisma.service.update({
    where: { id },
    data: { active: false },
  })

  return Response.json({ service })
}