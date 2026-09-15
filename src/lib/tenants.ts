import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export type SessionUser = {
  id: string
  email?: string | null
  name?: string | null
  barbershopId?: string
  barbershopSlug?: string
  barbershopName?: string
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    barbershopId: session.user.barbershopId,
    barbershopSlug: session.user.barbershopSlug,
    barbershopName: session.user.barbershopName,
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) redirect('/login')
  return user
}

export async function getVerifiedBarbershop(slug: string) {
  const user = await requireAuth()

  const membership = await prisma.barbershopUser.findFirst({
    where: {
      userId: user.id,
      barbershop: { slug },
    },
    include: {
      barbershop: {
        include: {
          services: true,
          businessHours: true,
        },
      },
    },
  })

  if (!membership) redirect('/dashboard')

  return { barbershop: membership.barbershop, role: membership.role, user }
}