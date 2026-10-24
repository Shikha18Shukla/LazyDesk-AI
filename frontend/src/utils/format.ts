const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—'
  if (bytes < 1000) return `${bytes} B`
  let value = bytes
  let unit = 0
  while (value >= 1000 && unit < UNITS.length - 1) {
    value /= 1000
    unit += 1
  }
  const digits = value < 10 ? 1 : 0
  return `${value.toFixed(digits)} ${UNITS[unit]}`
}

export function formatClock(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatNow(): string {
  return `Today · ${new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}