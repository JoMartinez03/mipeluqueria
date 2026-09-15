import type { ReactNode } from 'react'
import { Check, ChevronRight, Scissors } from 'lucide-react'
import { cn } from '@/lib/utils'

const SERVICES = ['Corte clásico', 'Corte + barba', 'Afeitado tradicional']
const SLOTS = ['17:00', '17:30', '18:00', '18:30']

export function PhoneMockup({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative w-[270px] shrink-0 rounded-[2rem] border-[6px] border-zinc-900 bg-zinc-900 shadow-2xl shadow-black/30',
        className
      )}
    >
      <div className="absolute left-1/2 top-2 z-10 h-4 w-24 -translate-x-1/2 rounded-full bg-zinc-900" />
      <div className="overflow-hidden rounded-[1.6rem] bg-background px-3 pb-4 pt-7">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Scissors className="h-3.5 w-3.5" />
          </span>
          <div className="leading-tight">
            <div className="text-[11px] font-bold">Barber San Ra</div>
            <div className="text-[9px] text-muted-foreground">San Rafael, Mendoza</div>
          </div>
        </div>

        <div className="mt-3 rounded-lg border bg-muted/40 p-2.5">
          <div className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Elegí tu servicio</div>
          <div className="mt-1.5 space-y-1">
            {SERVICES.map((s, i) => (
              <StepRow
                key={s}
                title={s}
                price={i === 1 ? '$7.000' : '$5.000'}
                selected={i === 0}
                step={i}
              />
            ))}
          </div>
        </div>

        <div className="mt-2 grid grid-cols-4 gap-1">
          {SLOTS.map((t, i) => (
            <div
              key={t}
              className={cn(
                'rounded-md py-1 text-center text-[9px] font-semibold ring-1',
                i === 1 ? 'bg-primary text-primary-foreground ring-primary' : 'bg-muted/50 text-muted-foreground ring-border'
              )}
            >
              {t}
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-1">
          <StepLine n="3" icon={<Check className="h-3 w-3" />} text="Tus datos" active={false} />
          <StepLine n="4" icon={<Check className="h-3 w-3" />} text="Reserva confirmada" active={false} />
        </div>

        <div className="mt-3 flex w-full items-center justify-between rounded-lg bg-primary px-3 py-2 text-[11px] font-semibold text-primary-foreground">
          Confirmar reserva
          <ChevronRight className="h-3.5 w-3.5" />
        </div>
        <div className="mt-1.5 text-center text-[8px] text-muted-foreground">
          Sin crear cuenta · Dura 10 segundos
        </div>
      </div>
    </div>
  )
}

function StepRow({
  title,
  price,
  selected,
  step,
}: {
  title: string
  price: string
  selected?: boolean
  step: number
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md px-1.5 py-1',
        selected && 'bg-primary/10 ring-1 ring-primary/30'
      )}
    >
      <span
        className={cn(
          'flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold',
          selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        )}
      >
        {step + 1}
      </span>
      <span className="flex-1 truncate text-[10px] font-medium">{title}</span>
      <span className="text-[9px] text-muted-foreground">{price}</span>
    </div>
  )
}

function StepLine({ n, icon, text, active }: { n: string; icon: ReactNode; text: string; active: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          'flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px]',
          active ? 'bg-primary text-primary-foreground' : 'bg-emerald-100 text-emerald-600'
        )}
      >
        {active ? n : icon}
      </span>
      <span className="truncate text-[9px] text-muted-foreground">{text}</span>
    </div>
  )
}