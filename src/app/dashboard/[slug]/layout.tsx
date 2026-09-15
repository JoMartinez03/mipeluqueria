import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar, MobileHeader } from '@/components/dashboard/sidebar'
import { getVerifiedBarbershop } from '@/lib/tenants'
import { prisma } from '@/lib/prisma'

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { barbershop, user } = await getVerifiedBarbershop(slug)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const todayCount = await prisma.appointment.count({
    where: {
      barbershopId: barbershop.id,
      startAt: { gte: today, lt: tomorrow },
      status: { in: ['PENDING', 'CONFIRMED'] },
    },
  })

  return (
    <SidebarProvider>
      <AppSidebar
        slug={slug}
        barbershopName={barbershop.name}
        userName={user.name ?? 'Usuario'}
        todayCount={todayCount}
        logo={barbershop.logo}
      />
      <SidebarInset className="bg-background">
        <MobileHeader
          barbershopName={barbershop.name}
          userName={user.name ?? 'Usuario'}
          logo={barbershop.logo}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}