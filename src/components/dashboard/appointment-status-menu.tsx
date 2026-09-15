'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const ACTIONS: { id: string; label: string }[] = [
  { id: 'CONFIRMED', label: 'Confirmar' },
  { id: 'COMPLETED', label: 'Marcar completado' },
  { id: 'CANCELLED', label: 'Cancelar turno' },
]

export function AppointmentStatusMenu({ id, status }: { id: string; status: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const changeStatus = async (next: string) => {
    if (next === status || loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')
      toast({ title: 'Turno actualizado' })
      router.refresh()
    } catch (e) {
      toast({ title: 'No se pudo actualizar', description: (e as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" disabled={loading} />}>
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Acciones</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Badge className={cn('rounded-full px-2', STATUS_COLORS[status] ?? '')}>
            {STATUS_LABELS[status] ?? status}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ACTIONS.filter((a) => a.id !== status).map((a) => (
          <DropdownMenuItem key={a.id} onClick={() => void changeStatus(a.id)}>
            {a.id === 'CANCELLED' ? (
              <X className="mr-2 h-4 w-4 text-red-500" />
            ) : (
              <Check className="mr-2 h-4 w-4 text-emerald-500" />
            )}
            {a.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}