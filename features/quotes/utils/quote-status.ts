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
