import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export type ApiAccess = {
  userId: string
  barbershopId: string
  barbershopSlug: string
  barbershopName: string
}

export async function requireBarbershopAccess(slug?: string): Promise<ApiAccess | null> {
  const session = await auth()
  if (!session?.user?.id) return null

  const where = slug
    ? { userId: session.user.id, barbershop: { slug } }
    : { userId: session.user.id }

  const membership = await prisma.barbershopUser.findFirst({
    where,
    include: { barbershop: { select: { id: true, slug: true, name: true } } },
  })

  if (!membership) return null

  return {
    userId: session.user.id,
    barbershopId: membership.barbershop.id,
    barbershopSlug: membership.barbershop.slug,
    barbershopName: membership.barbershop.name,
  }
}