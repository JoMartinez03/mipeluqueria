import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/tenants'

export default async function DashboardIndexPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')
  if (!user.barbershopSlug) redirect('/login')
  redirect(`/dashboard/${user.barbershopSlug}`)
}