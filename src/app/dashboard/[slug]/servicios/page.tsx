import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardPageHeader } from '@/components/dashboard/sidebar'
import { ServicesManager } from '@/components/dashboard/services-manager'
import { getVerifiedBarbershop } from '@/lib/tenants'

export default async function ServiciosPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { barbershop } = await getVerifiedBarbershop(slug)

  const services = barbershop.services.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    price: s.price,
    duration: s.duration,
    active: s.active,
  }))

  return (
    <>
      <DashboardPageHeader
        title="Servicios"
        description="Los servicios que ofrecés y que tus clientes pueden reservar"
      />
      <Card>
        <CardHeader>
          <CardTitle>Lista de servicios</CardTitle>
          <CardDescription>
            {services.filter((s) => s.active).length} activos de {services.length} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServicesManager services={services} />
        </CardContent>
      </Card>
    </>
  )
}