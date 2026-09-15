import { Badge } from '@/components/ui/badge'
import { AppointmentStatusMenu } from '@/components/dashboard/appointment-status-menu'
import { formatClock, formatPrice } from '@/lib/format'
import { STATUS_COLORS, STATUS_DOT_COLORS, STATUS_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export type TimelineAppointment = {
  id: string
  startAt: Date
  customerName: string
  status: string
  phone?: string | null
  serviceName: string
  price: number
  duration: number
}

export function AppointmentTimeline({
  groups,
  timezone,
}: {
  groups: { label?: string; items: TimelineAppointment[] }[]
  timezone: string
}) {
  return (
    <div className="space-y-6">
      {groups.map((group, gi) => (
        <div key={gi}>
          {group.label && (
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>
          )}
          <div className="space-y-2">
            {group.items.map((a, i) => (
              <div key={a.id} className="flex items-stretch gap-3">
                <div className="w-14 shrink-0 pt-3.5 text-right sm:w-16">
                  <div className="text-sm font-semibold tabular-nums">
                    {formatClock(a.startAt, timezone)}
                  </div>
                </div>
                <div className="relative flex w-4 shrink-0 justify-center">
                  <span
                    className={cn(
                      'absolute left-1/2 top-6 bottom-0 w-px -translate-x-1/2 bg-border',
                      i === group.items.length - 1 && 'opacity-0'
                    )}
                  />
                  <span
                    className={cn(
                      'absolute left-1/2 top-4 h-2.5 w-2.5 -translate-x-1/2 rounded-full ring-2 ring-background',
                      STATUS_DOT_COLORS[a.status] ?? 'bg-muted-foreground'
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1 rounded-xl border bg-card px-4 py-3 transition-shadow hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{a.customerName}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
                        <span className="truncate">{a.serviceName}</span>
                        <span className="hidden items-center gap-0.5 text-xs sm:inline-flex">
                          · {a.duration} min
                        </span>
                        <span className="font-medium text-foreground">
                          · {formatPrice(a.price)}
                        </span>
                      </div>
                      {a.phone && (
                        <div className="mt-0.5 truncate text-xs text-muted-foreground/80">
                          {a.phone}
                        </div>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={cn('shrink-0 rounded-full', STATUS_COLORS[a.status])}
                    >
                      {STATUS_LABELS[a.status] ?? a.status}
                    </Badge>
                    <AppointmentStatusMenu id={a.id} status={a.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}