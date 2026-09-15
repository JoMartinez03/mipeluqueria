import NextAuth, { type DefaultSession } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      barbershopId?: string
      barbershopSlug?: string
      barbershopName?: string
    } & DefaultSession['user']
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined
        if (!email || !password) return null

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return null

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) return null

        const barbershopUser = await prisma.barbershopUser.findFirst({
          where: { userId: user.id },
          include: { barbershop: { select: { slug: true, name: true, id: true } } },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          barbershopId: barbershopUser?.barbershopId,
          barbershopSlug: barbershopUser?.barbershop.slug,
          barbershopName: barbershopUser?.barbershop.name,
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const u = user as {
          id: string
          barbershopId?: string
          barbershopSlug?: string
          barbershopName?: string
        }
        token.id = u.id
        token.barbershopId = u.barbershopId
        token.barbershopSlug = u.barbershopSlug
        token.barbershopName = u.barbershopName
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? ''
        session.user.barbershopId = token.barbershopId as string | undefined
        session.user.barbershopSlug = token.barbershopSlug as string | undefined
        session.user.barbershopName = token.barbershopName as string | undefined
      }
      return session
    },
  },
})