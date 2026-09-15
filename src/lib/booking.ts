import { prisma } from './prisma'

export function zonedTimeToUtc(date: Date, timeZone: string): Date {
  const guess = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  )
  const offset = getTzOffsetMinutes(new Date(guess), timeZone)
  return new Date(guess - offset * 60000)
}

export function utcToZonedTime(date: Date, timeZone: string): Date {
  const offset = getTzOffsetMinutes(date, timeZone)
  return new Date(date.getTime() + offset * 60000)
}

function getTzOffsetMinutes(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant)

  const values: Record<string, number> = {}
  for (const part of parts) {
    if (part.type !== 'literal') values[part.type] = parseInt(part.value, 10)
  }
  const hour = (values.hour ?? 0) === 24 ? 0 : values.hour ?? 0
  const wallMs = Date.UTC(
    values.year ?? 0,
    (values.month ?? 1) - 1,
    values.day ?? 1,
    hour,
    values.minute ?? 0,
    values.second ?? 0
  )
  return (wallMs - instant.getTime()) / 60000
}

export function formatTimeInTimezone(utcDate: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(utcDate)
}

export function formatDateInTimezone(utcDate: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    timeZone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(utcDate)
}

export function startOfLocalDayInUtc(date: Date, timeZone: string): Date {
  const midnightLocal = new Date(date)
  midnightLocal.setHours(0, 0, 0, 0)
  return zonedTimeToUtc(midnightLocal, timeZone)
}

export function endOfLocalDayInUtc(date: Date, timeZone: string): Date {
  const nextMidnight = new Date(date)
  nextMidnight.setDate(nextMidnight.getDate() + 1)
  nextMidnight.setHours(0, 0, 0, 0)
  return zonedTimeToUtc(nextMidnight, timeZone)
}

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export type DaySchedule = {
  closed: boolean
  windows: { open: string; close: string }[]
}

export type ScheduleFields = {
  closed: boolean
  open1: string | null
  close1: string | null
  open2: string | null
  close2: string | null
}

export function getDaySchedule(
  businessHours: ScheduleFields | null,
  exception: ScheduleFields | null
): DaySchedule {
  const source = exception ?? businessHours
  return scheduleFromSource(source)
}

function scheduleFromSource(s: ScheduleFields | null): DaySchedule {
  if (!s || s.closed || !s.open1 || !s.close1) return { closed: true, windows: [] }

  const windows = [{ open: s.open1, close: s.close1 }]
  if (s.open2 && s.close2) windows.push({ open: s.open2, close: s.close2 })

  const valid = windows.filter((w) => {
    const o = parseTimeToMinutes(w.open)
    const c = parseTimeToMinutes(w.close)
    return o < c
  })

  return { closed: valid.length === 0, windows: valid }
}

export type SlotBooked = { startAt: Date; endAt: Date }

export async function computeAvailableSlots(params: {
  barbershopId: string
  timezone: string
  duration: number
  date: Date
}) {
  const { barbershopId, timezone, duration, date } = params

  const localDay = new Date(date)
  localDay.setHours(0, 0, 0, 0)

  const startOfDayUtc = startOfLocalDayInUtc(localDay, timezone)
  const endOfDayUtc = endOfLocalDayInUtc(localDay, timezone)

  const dayOfWeek = new Date(
    Date.UTC(localDay.getFullYear(), localDay.getMonth(), localDay.getDate())
  ).getUTCDay()

  const [exception, businessHours] = await Promise.all([
    prisma.scheduleException.findUnique({
      where: { barbershopId_date: { barbershopId, date: startOfDayUtc } },
    }),
    prisma.businessHour.findUnique({
      where: { barbershopId_dayOfWeek: { barbershopId, dayOfWeek } },
    }),
  ])

  const schedule = getDaySchedule(
    businessHours
      ? {
          closed: businessHours.closed,
          open1: businessHours.open1,
          close1: businessHours.close1,
          open2: businessHours.open2,
          close2: businessHours.close2,
        }
      : null,
    exception
      ? {
          closed: exception.closed,
          open1: exception.open1,
          close1: exception.close1,
          open2: exception.open2,
          close2: exception.close2,
        }
      : null
  )

  if (schedule.closed) return [] as string[]

  const candidates: string[] = []
  for (const win of schedule.windows) {
    const open = parseTimeToMinutes(win.open)
    const close = parseTimeToMinutes(win.close)
    for (let t = open; t + duration <= close; t += duration) {
      candidates.push(minutesToTime(t))
    }
  }

  const booked = await prisma.appointment.findMany({
    where: {
      barbershopId,
      status: { not: 'CANCELLED' },
      startAt: { gte: startOfDayUtc, lt: endOfDayUtc },
    },
    select: { startAt: true, endAt: true },
  })

  const normalizedBooked = booked.map((b) => ({
    startAt: new Date(b.startAt),
    endAt: new Date(b.endAt),
  }))

  const nowUtc = new Date()
  const nowLocal = utcToZonedTime(nowUtc, timezone)

  const free: string[] = []
  for (const cand of candidates) {
    const [ch, cm] = cand.split(':').map(Number)
    const localStart = new Date(localDay)
    localStart.setHours(ch ?? 0, cm ?? 0, 0, 0)

    const candLocal = new Date(localDay)
    candLocal.setHours(ch ?? 0, cm ?? 0, 0, 0)
    if (candLocal <= nowLocal) continue

    const candStartUtc = zonedTimeToUtc(candLocal, timezone)
    const candEndUtc = new Date(candStartUtc.getTime() + duration * 60000)

    const overlaps = normalizedBooked.some(
      (b) => b.startAt < candEndUtc && b.endAt > candStartUtc
    )
    if (!overlaps) free.push(cand)
  }

  return free
}

export async function assertSlotAvailable(params: {
  barbershopId: string
  timezone: string
  startAt: Date
  endAt: Date
}): Promise<boolean> {
  const { barbershopId, startAt, endAt } = params

  const conflicting = await prisma.appointment.findFirst({
    where: {
      barbershopId,
      status: { not: 'CANCELLED' },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
  })

  return !conflicting
}