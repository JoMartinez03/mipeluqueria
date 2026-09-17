import { cn } from '@/lib/utils'
import {
  type BusinessStatusException,
  type BusinessStatusSchedule,
  getBarbershopOpenStatus,
} from '@/lib/business-status'

export function BusinessStatusBadge({
  timezone,
  businessHours,
  scheduleExceptions,
  tone = 'light',
  className,
}: {
  timezone: string
  businessHours: BusinessStatusSchedule[]
  scheduleExceptions: BusinessStatusException[]
  tone?: 'light' | 'dark'
  className?: string
}) {
  const status = getBarbershopOpenStatus({ businessHours, scheduleExceptions, timezone })

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 transition-colors',
        tone === 'dark'
          ? 'bg-white/10 text-white ring-white/15 backdrop-blur'
          : 'bg-white text-foreground shadow-sm ring-black/5',
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        {status.isOpen && (
          <span
            className={cn(
              'animate-soft-pulse absolute inline-flex h-full w-full rounded-full opacity-60',
              tone === 'dark' ? 'bg-emerald-400' : 'bg-emerald-500'
            )}
          />
        )}
        <span
          className={cn(
            'relative inline-flex h-2 w-2 rounded-full',
            status.isOpen
              ? tone === 'dark'
                ? 'bg-emerald-400'
                : 'bg-emerald-500'
              : tone === 'dark'
                ? 'bg-red-400'
                : 'bg-red-500'
          )}
        />
      </span>
      <span>{status.isOpen ? 'Abierto ahora' : 'Cerrado ahora'}</span>
    </span>
  )
}