import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Scissors } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'

export default async function PublicBarbershopLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const barbershop = await prisma.barbershop.findUnique({
    where: { slug },
    select: { name: true, logo: true },
  })

  if (!barbershop) notFound()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href={`/${slug}`} className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary ring-1 ring-primary/25">
              {barbershop.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={barbershop.logo} alt="" className="h-full w-full object-cover" />
              ) : (
                <Scissors className="h-4.5 w-4.5" />
              )}
            </span>
            <span className="truncate text-base font-semibold tracking-tight">
              {barbershop.name}
            </span>
          </Link>
          <Button render={<Link href={`/${slug}/reservar`} />} size="sm">
            Reservar turno
          </Button>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 px-4 py-8 text-center sm:px-6">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Scissors className="h-3.5 w-3.5" />
          </span>
          <p className="text-xs text-muted-foreground">
            {barbershop.name} · Gestionado con{' '}
            <Link href="/" className="font-medium text-foreground transition-colors hover:text-primary">
              MiPeluqueria
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}