export type BusinessStatusSchedule = {
  dayOfWeek: number
  closed: boolean
  open1: string | null
  close1: string | null
  open2: string | null
  close2: string | null
}

export type BusinessStatusException = {
  date: Date
  closed: boolean
  open1: string | null
  close1: string | null
  open2: string | null
  close2: string | null
}

export type BusinessOpenStatus = {
  isOpen: boolean
  closesAt: string | null
  now: string
  date: string
  dayOfWeek: number
  timezone: string
}

type TimeZoneParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  weekday: number
}

const WEEKDAYS: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

function timeZoneParts(instant: Date, timeZone: string): TimeZoneParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(instant)

  const values: Record<string, string> = {}
  for (const part of parts) {
    if (part.type !== 'literal') values[part.type] = part.value
  }

  let hour = Number(values.hour ?? 0)
  if (hour === 24) hour = 0

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour,
    minute: Number(values.minute),
    weekday: WEEKDAYS[values.weekday ?? ''] ?? 0,
  }
}

function toYmd(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

export function parseStatusTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

type StatusWindow = { open: number; close: number; closeLabel: string }

function windowsFrom(schedule: BusinessStatusSchedule | null): StatusWindow[] {
  if (!schedule || schedule.closed) return []

  const raw: { open: string; close: string }[] = []
  if (schedule.open1 && schedule.close1) raw.push({ open: schedule.open1, close: schedule.close1 })
  if (schedule.open2 && schedule.close2) raw.push({ open: schedule.open2, close: schedule.close2 })

  return raw
    .map((w) => ({
      open: parseStatusTimeToMinutes(w.open),
      close: parseStatusTimeToMinutes(w.close),
      closeLabel: w.close,
    }))
    .filter((w) => w.open < w.close)
}

export function getBarbershopOpenStatus(params: {
  businessHours: BusinessStatusSchedule[]
  scheduleExceptions: BusinessStatusException[]
  timezone: string
  now?: Date
}): BusinessOpenStatus {
  const { businessHours, scheduleExceptions, timezone } = params
  const instant = params.now ?? new Date()
  const parts = timeZoneParts(instant, timezone)
  const todayYmd = toYmd(parts.year, parts.month, parts.day)
  const nowMinutes = parts.hour * 60 + parts.minute

  const exception = scheduleExceptions.find((e) => {
    const local = timeZoneParts(e.date, timezone)
    return toYmd(local.year, local.month, local.day) === todayYmd
  })

  let schedule: BusinessStatusSchedule | null
  if (exception) {
    schedule = {
      dayOfWeek: parts.weekday,
      closed: exception.closed,
      open1: exception.open1,
      close1: exception.close1,
      open2: exception.open2,
      close2: exception.close2,
    }
  } else {
    schedule = businessHours.find((h) => h.dayOfWeek === parts.weekday) ?? null
  }

  const windows = windowsFrom(schedule)
  const active = windows.find((w) => nowMinutes >= w.open && nowMinutes < w.close)

  return {
    isOpen: Boolean(active),
    closesAt: active?.closeLabel ?? null,
    now: `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`,
    date: todayYmd,
    dayOfWeek: parts.weekday,
    timezone,
  }
}