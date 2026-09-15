import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const registerSchema = z.object({
  name: z.string().min(2, 'Ingresá tu nombre'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  barbershopName: z.string().min(2, 'Ingresá el nombre de tu peluquería'),
  slug: z
    .string()
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Usá solo minúsculas, números y guiones'),
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) {
    return Response.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' },
      { status: 400 }
    )
  }

  const { name, email, password, barbershopName, slug } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return Response.json({ error: 'El email ya está registrado' }, { status: 409 })
  }

  const existingSlug = await prisma.barbershop.findUnique({ where: { slug } })
  if (existingSlug) {
    return Response.json(
      { error: 'Ese slug ya está en uso. Probá con otro.' },
      { status: 409 }
    )
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, email, password: hashedPassword },
      })

      const barbershop = await tx.barbershop.create({
        data: {
          name: barbershopName,
          slug,
        },
      })

      await tx.barbershopUser.create({
        data: {
          userId: user.id,
          barbershopId: barbershop.id,
          role: 'OWNER',
        },
      })

      return { user, barbershop }
    })

    return Response.json(
      { id: result.user.id, barbershopId: result.barbershop.id },
      { status: 201 }
    )
  } catch {
    return Response.json({ error: 'Error al crear la cuenta' }, { status: 500 })
  }
}