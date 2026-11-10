export const inputCls =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring'

export const DOC_STATUS: Record<string, { label: string; className: string }> = {
  ACCEPTED: { label: 'Aceptado', className: 'bg-success/15 text-success' },
  CONDITIONAL: { label: 'Aceptado condicional', className: 'bg-warning/15 text-warning' },
  IN_PROCESS: { label: 'En proceso', className: 'bg-info/15 text-info' },
  REJECTED: { label: 'Rechazado', className: 'bg-destructive/15 text-destructive' },
  CANCELLED: { label: 'Anulado', className: 'bg-muted text-muted-foreground' },
}

export const dop = (v: string) =>
  `RD$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/** AAAAMM ↔ valor de <input type="month"> (AAAA-MM). */
export const toMonthInput = (period: string) => `${period.slice(0, 4)}-${period.slice(4)}`
export const fromMonthInput = (value: string) => value.replace('-', '')
