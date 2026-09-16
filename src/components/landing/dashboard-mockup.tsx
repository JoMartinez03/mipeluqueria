import type { ReactNode } from 'react'
import { Scissors, LayoutDashboard, CalendarDays, Clock, Settings, Wallet, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { icon: LayoutDashboard, label: 'Inicio', active: true },
  { icon: CalendarDays, label: 'Turnos' },
  { icon: Scissors, label: 'Servicios' },
  { icon: Clock, label: 'Horarios' },
  { icon: Settings, label: 'Configuración' },
]

export function DashboardMockup({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border bg-card shadow-[0_2px_6px_-1px_oklch(0.16_0.012_205/0.12),0_24px_48px_-16px_oklch(0.47_0.09_178/0.25)] ring-1 ring-border/60',
        className
      )}
    >
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <div className="mx-auto flex items-center gap-1.5 rounded-md bg-background px-3 py-1 text-[10px] text-muted-foreground ring-1 ring-border">
          mipeluqueria.app/<span className="font-medium text-foreground">barber-san-ra</span>
        </div>
        <span
          title="Agenda online activa"
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 py-0.5 pr-2 pl-1 ring-1 ring-emerald-500/20"
        >
          <span aria-hidden="true" className="relative flex h-1.5 w-1.5">
            <span aria-hidden="true" className="animate-soft-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
            <span aria-hidden="true" className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          <span aria-hidden="true" className="hidden text-[8px] font-semibold tracking-wide text-emerald-700 sm:inline">
            Agenda online activa
          </span>
          <span className="sr-only">Agenda online activa</span>
        </span>
      </div>

      <div className="flex">
        <div className="gradient-sidebar hidden w-36 shrink-0 flex-col gap-1 p-3 sm:flex">
          <div className="mb-2 flex items-center gap-2 px-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 ring-1 ring-white/15">
              <Scissors className="h-3 w-3 text-white" />
            </span>
            <div className="leading-tight">
              <div className="truncate text-[10px] font-semibold text-white">Barber San Ra</div>
              <div className="text-[8px] text-white/50">MiPeluqueria</div>
            </div>
          </div>
          {NAV.map((n) => (
            <div
              key={n.label}
              className={cn(
                'flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px]',
                n.active ? 'bg-white/10 font-medium text-white' : 'text-white/60'
              )}
            >
              <n.icon className="h-3 w-3" />
              {n.label}
            </div>
          ))}
        </div>

        <div className="flex-1 bg-muted/20 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold">Hola, Barber San Ra</div>
              <div className="text-[10px] text-muted-foreground">Resumen de tu actividad de hoy</div>
            </div>
            <span className="rounded-md bg-primary text-[10px] font-medium text-primary-foreground px-2 py-1">
              Crear mi negocio
            </span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <MiniStat icon={<CalendarDays className="h-3 w-3" />} value="6" label="Turnos hoy" />
            <MiniStat icon={<Clock className="h-3 w-3" />} value="17:30" label="Próximo" />
            <MiniStat icon={<Wallet className="h-3 w-3" />} value="$45.000" label="Hoy" />
          </div>

          <div className="mt-3 rounded-lg border bg-card p-3">
            <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
              <Users className="h-3 w-3" /> Próximos turnos
            </div>
            <div className="mt-2 space-y-1.5">
              <TimeRow time="17:30" name="Juan Pérez" detail="Corte clásico · 30 min" price="$5.000" tone="accept" />
              <TimeRow time="18:15" name="Martín López" detail="Corte + barba · 45 min" price="$7.000" tone="pending" />
              <TimeRow time="19:00" name="Lucas Díaz" detail="Corte clásico · 30 min" price="$5.000" tone="accept" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniStat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-lg border bg-card px-2.5 py-2">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="text-primary">{icon}</span>
      </div>
      <div className="mt-1 text-sm font-bold leading-none">{value}</div>
    </div>
  )
}

function TimeRow({
  time,
  name,
  detail,
  price,
  tone,
}: {
  time: string
  name: string
  detail: string
  price: string
  tone: 'accept' | 'pending'
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
      <span className="w-9 shrink-0 text-[10px] font-semibold tabular-nums">{time}</span>
      <div className="min-w-0 flex-1 truncate">
        <div className="truncate text-[10px] font-medium">{name}</div>
        <div className="truncate text-[9px] text-muted-foreground">{detail}</div>
      </div>
      <span className="text-[10px] font-semibold">{price}</span>
      <span
        className={cn(
          'shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-medium',
          tone === 'accept' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
        )}
      >
        {tone === 'accept' ? 'Confirmado' : 'Pendiente'}
      </span>
    </div>
  )
}