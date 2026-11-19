import type { Quote } from '../types'

export type QuoteStatus = Quote['status']

export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  DRAFT: 'Borrador',
  SENT: 'Enviada',
  ACCEPTED: 'Aceptada',
  REJECTED: 'Rechazada',
  CONVERTED: 'Convertida',
}

export const QUOTE_STATUS_STYLE: Record<QuoteStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  SENT: 'bg-info/15 text-info',
  ACCEPTED: 'bg-success/15 text-success',
  REJECTED: 'bg-destructive/15 text-destructive',
  CONVERTED: 'bg-primary/15 text-primary',
}

export const CONTAINER_TYPE_LABEL: Record<string, string> = {
  '20_ST': '20 pies (28 CBM)',
  '40_ST': '40 pies (58 CBM)',
  '40_HC': '40 HC (68 CBM)',
  LCL: 'LCL',
}

export const CONTAINER_STATUS_LABEL: Record<string, string> = {
  PLANNED: 'Planificado',
  LOADED: 'Cargado',
  IN_TRANSIT: 'En tránsito',
  ARRIVED: 'Arribado',
  DELIVERED: 'Entregado',
  RETURNED: 'Devuelto',
}

export const PRORATION_LABEL: Record<string, string> = {
  WEIGHT: 'Peso',
  CBM: 'Volumen (CBM)',
  VALUE: 'Valor FOB',
}

export function formatUsd(value: string | number | null | undefined): string {
  if (value == null || value === '') return '—'
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'
  return amount.toLocaleString('es-DO', { style: 'currency', currency: 'USD' })
}

export function formatQty(value: string | number | null | undefined, digits = 3): string {
  if (value == null || value === '') return '—'
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'
  return amount.toLocaleString('es-DO', { maximumFractionDigits: digits })
}

/** Tasas guardadas como fracción (0.20 = 20%). */
export function formatRate(value: string | number | null | undefined): string {
  if (value == null || value === '') return '—'
  const rate = Number(value)
  if (!Number.isFinite(rate)) return '—'
  return `${(rate * 100).toLocaleString('es-DO', { maximumFractionDigits: 2 })}%`
}
