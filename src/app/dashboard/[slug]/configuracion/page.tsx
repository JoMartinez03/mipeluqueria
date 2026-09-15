import { DashboardPageHeader } from '@/components/dashboard/sidebar'
import { BarbershopSettingsForm } from '@/components/dashboard/barbershop-settings-form'
import { getVerifiedBarbershop } from '@/lib/tenants'

export default async function ConfiguracionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { barbershop } = await getVerifiedBarbershop(slug)

  return (
    <>
      <DashboardPageHeader
        title="Configuración"
        description="Manejá los datos de tu negocio"
      />
      <BarbershopSettingsForm
        barbershop={{
          name: barbershop.name,
          slug: barbershop.slug,
          phone: barbershop.phone,
          whatsapp: barbershop.whatsapp,
          address: barbershop.address,
          description: barbershop.description,
          instagram: barbershop.instagram,
          logo: barbershop.logo,
          coverImage: barbershop.coverImage,
        }}
      />
    </>
  )
}