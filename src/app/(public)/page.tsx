import Link from 'next/link'
import {
  ArrowRight,
  Bell,
  CalendarCheck,
  Clock,
  Link as LinkIcon,
  QrCode,
  Scissors,
  Smartphone,
  Sparkles,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardMockup } from '@/components/landing/dashboard-mockup'
import { PhoneMockup } from '@/components/landing/phone-mockup'
import { LiveBookingCard } from '@/components/landing/live-booking-card'
import { Reveal } from '@/components/ui/reveal'
import { PublicNavbar } from '@/components/public/navbar'
import { PublicFooter } from '@/components/public/footer'

const FEATURES = [
  {
    icon: CalendarCheck,
    title: 'Turnos sin dobles reservas',
    description:
      'Cada horario se bloquea al instante. La plataforma evita choques de turnos por vos, siempre.',
  },
  {
    icon: Smartphone,
    title: 'Tu página pública',
    description:
      'Un enlace único y elegante para tu peluquería. Tus clientes reservan sin crear cuentas.',
  },
  {
    icon: Clock,
    title: 'Horarios flexibles',
    description:
      'Día por día, con varios intervalos. Cerraste un día? Tu página lo refleja automáticamente.',
  },
  {
    icon: Users,
    title: 'Panel de gestión',
    description:
      'Mirá el turno que sigue, confirmá pendientes y controlá servicios y horarios desde un solo lugar.',
  },
  {
    icon: Bell,
    title: 'Confirmá desde el panel',
    description:
      'Los nuevos turnos llegan a tu panel. Aprobá o rechazá con un clic y mantené todo ordenado.',
  },
  {
    icon: QrCode,
    title: 'Más fácil que una llamada',
    description:
      'Decile adiós a la agenda de papel y a los idas y vueltas por WhatsApp. Tu página trabaja 24/7.',
  },
]

const STEPS = [
  {
    n: 1,
    title: 'Creá tu negocio',
    description: 'Registrate y creá tu página en un par de minutos, sin tarjeta y sin fricción.',
  },
  {
    n: 2,
    title: 'Cargá servicios y horarios',
    description: 'Definí precios, duración y cuándo atendés. Subí tu logo y una portada.',
  },
  {
    n: 3,
    title: 'Compartí tu link',
    description: 'Publicá el enlace de reserva en tu Instagram, WhatsApp y en el perfil de Google.',
  },
  {
    n: 4,
    title: 'Recibí tu primera reserva',
    description: 'Te llega el aviso a tu panel. La confirmás y listo: a atender.',
  },
]

export default function LandingPage() {
  return (
    <div className="animate-slide-up flex min-h-full flex-col">
      <PublicNavbar />

      <main>
        <section className="relative overflow-hidden">
          <div aria-hidden="true" className="hero-bg absolute inset-0" />
          <div aria-hidden="true" className="hero-grid absolute inset-0" />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[45%_55%] lg:pt-20">
            <div>
              <Badge className="mb-5 rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                <Sparkles className="mr-1.5 h-3 w-3" /> Gestión de turnos para peluquerías
              </Badge>
              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-[3.4rem]">
                Tu peluquería,{' '}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  con reservas online
                </span>{' '}
                en minutos.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                Creá tu página pública, cargá tus servicios y compartí tu link. Tus clientes reservan
                solos, vos solo te sentás a atender.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  render={<Link href="/register" />}
                  size="lg"
                  className="hover:shadow-lg hover:shadow-primary/25"
                >
                  Crear mi negocio gratis{' '}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover/button:translate-x-1" />
                </Button>
                <Button render={<a href="#funciones" />} size="lg" variant="outline">
                  Ver funciones
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Sin tarjeta de crédito · Sin instalaciones · Listo en 5 minutos
              </p>
            </div>

            <div className="hero-mockup-enter relative" style={{ animationDelay: '150ms' }}>
              <div aria-hidden="true" className="hero-mockup-glow pointer-events-none absolute -inset-8 rounded-[3rem] blur-2xl" />
              <DashboardMockup />
              <LiveBookingCard className="absolute -bottom-6 -left-3 hidden sm:block" />
            </div>
          </div>
        </section>

        <section id="funciones" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20">
          <Reveal className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Todo tu negocio, en un solo lugar
            </h2>
            <p className="mt-3 text-muted-foreground">
              No necesitás una app. Necesitás una página que trabaje por vos mientras atendés.
            </p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 60}>
                <div className="group h-full rounded-2xl border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_18px_36px_-14px_oklch(0.47_0.09_178/0.2)]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="clientes" className="border-y bg-muted/40">
          <Reveal>
            <div className="mx-auto grid max-w-6xl scroll-mt-20 items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2">
              <div className="order-2 flex justify-center lg:order-1">
                <div className="relative">
                  <div aria-hidden="true" className="hero-mockup-glow pointer-events-none absolute -inset-10 rounded-full blur-2xl" />
                  <PhoneMockup />
                </div>
              </div>
            <div className="order-1 lg:order-2">
              <Badge className="rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                <LinkIcon className="mr-1.5 h-3 w-3" /> Para tus clientes
              </Badge>
              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Así reservan tus clientes
              </h2>
              <p className="mt-4 text-muted-foreground">
                Abren tu link, eligen el servicio, el día y la hora. Sin crear cuenta, sin descargar
                nada, en menos de 10 segundos.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Sin registración: entran, eligen y confirman.',
                  'Ven solo los horarios disponibles, con tu confirmación.',
                  'Reciben la confirmación al instante.',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CheckIcon />
                    </span>
                    <span className="text-muted-foreground">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          </Reveal>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <Reveal>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border bg-card p-8">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Scissors className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-xl font-bold">Para vos, el peluquero</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Un panel limpio con los turnos del día, el siguiente en fila, ingresos estimados y
                  acciones rápidas. Registrás servicios, ajustás horarios y confirmás turnos sin
                  andar con la agenda de papel.
                </p>
              </div>
              <div className="relative overflow-hidden rounded-3xl border bg-card p-8">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Smartphone className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-xl font-bold">Para tus clientes</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Una página simple y rápida de tu marca, con tus servicios y horarios reales. Pueden
                  compartir tu link con amigos o volver a reservar en segundos desde el celular.
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="pasos" className="scroll-mt-20">
          <div className="border-t bg-muted/40 py-16 sm:py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <Reveal className="mb-12 max-w-2xl">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Empezás en 4 pasos</h2>
                <p className="mt-3 text-muted-foreground">
                  De cero a recibir tu primera reserva online, hoy mismo.
                </p>
              </Reveal>
              <Reveal>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  {STEPS.map((s, i) => (
                    <div key={s.n} className="relative">
                      {i < STEPS.length - 1 && (
                        <div className="absolute left-14 top-6 hidden h-px w-[calc(100%-3.5rem)] bg-gradient-to-r from-primary/40 to-transparent lg:block" />
                      )}
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary font-bold text-primary-foreground shadow-md shadow-primary/30">
                        {s.n}
                      </div>
                      <h3 className="mt-5 font-semibold">{s.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl gradient-sidebar">
              <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
              <div className="relative px-8 py-14 text-center sm:px-14">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                  <Scissors className="h-6 w-6 text-white" strokeWidth={1.8} />
                </div>
                <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Listo para llenar tu agenda de turnos
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-white/70">
                  Creá tu peluquería, cargá tus servicios y compartí tu link en 5 minutos.
                </p>
                <Button
                  render={<Link href="/register" />}
                  size="lg"
                  className="mt-8 bg-white text-foreground hover:bg-white/90"
                >
                  Crear mi negocio gratis{' '}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover/button:translate-x-1" />
                </Button>
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/50">
                  <Clock className="h-3.5 w-3.5" /> Configurás tu horario y listo
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.5 6.5 5 9l4.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}