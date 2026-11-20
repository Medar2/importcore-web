export function fmtDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleString('es-DO', { dateStyle: 'medium', timeStyle: 'short' })
}

export function fmtDuration(ms: number | null | undefined): string {
  if (ms == null || ms < 0) return '—'
  const totalMin = Math.floor(ms / 60000)
  const hours = Math.floor(totalMin / 60)
  const mins = totalMin % 60
  if (hours > 0) return `${hours}h ${mins}m`
  if (totalMin > 0) return `${totalMin}m`
  return `${Math.floor(ms / 1000)}s`
}
