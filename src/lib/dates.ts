import { zonedTimeToUtc } from './booking'

export function topOfLocalDayUtc(date: Date, timeZone: string): Date {
  const local = new Date(date)
  local.setHours(0, 0, 0, 0)
  return zonedTimeToUtc(local, timeZone)
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function toYmd(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}