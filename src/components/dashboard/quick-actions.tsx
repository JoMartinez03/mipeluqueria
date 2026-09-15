import Link from 'next/link'
import { CalendarPlus, Scissors, ExternalLink, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CopyLinkButton } from '@/components/dashboard/copy-link-button'

export function QuickActions({ slug }: { slug: string }) {
  const actions = [
    {
      key: 'nuevo-turno',
      label: 'Nuevo turno',
      hint: 'Abrir reservas online',
      icon: CalendarPlus,
      href: `/${slug}/reservar`,
      external: true,
    },
    {
      key: 'servicio',
      label: 'Agregar servicio',
      hint: 'Cargar un servicio nuevo',
      icon: Scissors,
      href: `/dashboard/${slug}/servicios`,
    },
    {
      key: 'publica',
      label: 'Ver página pública',
      hint: 'Mirá cómo te ven tus clientes',
      icon: ExternalLink,
      href: `/${slug}`,
      external: true,
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((a) => (
        <Button
          key={a.key}
          render={
            <Link href={a.href} target={a.external ? '_blank' : undefined} rel={a.external ? 'noopener noreferrer' : undefined} />
          }
          variant="outline"
          className="h-auto justify-start gap-3 rounded-xl px-4 py-3"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <a.icon className="h-4 w-4" />
          </span>
          <span className="min-w-0 text-left">
            <span className="block truncate text-sm font-medium">{a.label}</span>
            <span className="block truncate text-xs text-muted-foreground">{a.hint}</span>
          </span>
        </Button>
      ))}
      <CopyLinkButton
        path={`/${slug}`}
        label=""
        variant="outline"
        className="h-auto justify-start gap-3 rounded-xl px-4 py-3"
        toastTitle="Enlace de reservas copiado"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Copy className="h-4 w-4" />
        </span>
        <span className="text-left">
          <span className="block text-sm font-medium">Copiar enlace de reservas</span>
          <span className="block truncate text-xs text-muted-foreground">Compartí tu página</span>
        </span>
      </CopyLinkButton>
    </div>
  )
}