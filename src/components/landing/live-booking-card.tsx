'use client'

import { useEffect, useState } from 'react'
import { CalendarCheck, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

const BOOKINGS = [
  { name: 'Juan Pérez', detail: 'Corte clásico · 17:30' },
  { name: 'Martín López', detail: 'Corte + barba · 18:15' },
  { name: 'Lucas Díaz', detail: 'Corte clásico · 19:00' },
]

const SWAP_MS = 4000

export function LiveBookingCard({ className }: { className?: string }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % BOOKINGS.length), SWAP_MS)
    return () => window.clearInterval(id)
  }, [])

  const booking = BOOKINGS[index]

  return (
    <div className={cn('live-card-enter', className)} style={{ animationDelay: '450ms' }}>
      <div className="animate-float rounded-2xl border bg-card/95 p-3 shadow-xl shadow-black/10 ring-1 ring-primary/10 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CalendarCheck className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="text-xs font-semibold">Nuevo turno reservado</div>
            <div
              key={index}
              className="animate-card-swap truncate text-[11px] text-muted-foreground"
            >
              {booking.name} · {booking.detail}
            </div>
          </div>
          <span className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Star className="h-3 w-3" />
          </span>
        </div>
      </div>
    </div>
  )
}