import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireBarbershopAccess } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  name: z.string().min(2).max(60).optional(),
  phone: z.string().max(30).optional().nullable(),
  whatsapp: z.string().max(30).optional().nullable(),
  address: z.string().max(120).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  instagram: z.string().max(60).optional().nullable(),
  logo: z.string().max(2_000_000).optional().nullable(),
  coverImage: z.string().max(4_000_000).optional().nullable(),
})

export async function PATCH(request: NextRequest) {
  const access = await requireBarbershopAccess()
  if (!access) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }, { status: 400 })
  }

  const barbershop = await prisma.barbershop.update({
    where: { id: access.barbershopId },
    data: parsed.data,
    select: {
      id: true,
      name: true,
      slug: true,
      phone: true,
      whatsapp: true,
      address: true,
      description: true,
      instagram: true,
      logo: true,
      coverImage: true,
      timezone: true,
    },
  })

  return Response.json({ barbershop })
}