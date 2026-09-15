import Link from 'next/link'
import {
  CalendarCheck,
  Clock,
  QrCode,
  Scissors,
  Smartphone,
  Users,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const FEATURES = [
  {
    icon: Smartphone,
    title: 'Tu página propia',
    description:
      'Un enlace único y elegante para tu peluquería. Tus clientes eligen servicio, día y hora sin crear cuentas.',
  },
  {
    icon: CalendarCheck,
    title: 'Turnos sin dobles reservas',
    description:
      'Cada horario se bloquea automáticamente. La plataforma evita choques de turnos por ti.',
  },
  {
    icon: QrCode,
    title: 'Más fácil que una llamada',
    description:
      'Tu equipo de reservas 24/7. Decile adiós a la agenda de papel y a las idas y vueltas por WhatsApp.',
  },
  {
    icon: Users,
    title: 'Panel de gestión',
    description:
      'Mirá el turno que sigue, confirmá pendientes y llevá el control de tus servicios y horarios.',
  },
]

const STEPS = [
  { n: 1, title: 'Creá tu negocio', description: 'Registrate y creá tu página en un par de minutos, sin tarjeta.' },
  { n: 2, title: 'Cargá tus servicios y horarios', description: 'Definí precios, duración y cuándo atendés.' },
  { n: 3, title: 'Compartí tu link', description: 'Publicá tu enlace en Instagram, WhatsApp y Google.' },
  { n: 4, title: 'Cobrá la primera reserva', description: 'Recibí el aviso y confirmá desde tu panel.' },
]

export default function LandingPage() {
  return (
    <div className="animate-slide-up">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-sidebar [mask-image:radial-gradient(ellipse_at_top_left,black_35%,transparent_75%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <Badge className="mb-5 rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
            <Sparkles className="mr-1.5 h-3 w-3" /> Gestión de turnos para peluquerías
          </Badge>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Tu peluquería,{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              con reservas online
            </span>{' '}
            en minutos.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Creá tu página pública, cargá tus servicios y compartí tu link. Tus clientes reservan solos,
            vos solo te sentás a atender.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button render={<Link href="/register" />} size="lg">
            Crear mi negocio gratis <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button render={<a href="#como-funciona" />} size="lg" variant="outline">
            Ver cómo funciona
          </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Sin tarjeta de crédito · Sin instalaciones · Datos de prueba en la registración
          </p>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-6 transition-shadow hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="border-y bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">Empezás en 4 pasos</h2>
            <p className="mt-2 text-muted-foreground">
              De cero a recibir tu primer turno online, hoy mismo.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground">
                  {s.n}
                </div>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="overflow-hidden rounded-3xl gradient-sidebar">
          <div className="px-8 py-14 text-center sm:px-14">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <Scissors className="h-6 w-6 text-white" strokeWidth={1.8} />
            </div>
            <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Listo para llenar tu agenda de turnos
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/70">
              Creá tu peluquería, cargá tus servicios y compartí tu link en 5 minutos.
            </p>
<Button render={<Link href="/register" />} size="lg" className="mt-8 bg-white text-foreground hover:bg-white/90">
              Crear mi negocio gratis <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/50">
              <Clock className="h-3.5 w-3.5" /> Configurás tu horario y listo
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}