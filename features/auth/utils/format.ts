export function fmtDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleString('es-DO', { dateStyle: 'medium', timeStyle: 'short' })
}
