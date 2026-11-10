const LABEL: Record<string, string> = {
  DRAFT: 'Borrador',
  CONFIRMED: 'Confirmada',
  SENT: 'Enviada',
  IN_TRANSIT: 'En tránsito',
  RECEIVED: 'Recibida',
  CANCELLED: 'Cancelada',
}

export const PURCHASE_STATUS_STYLE: Record<string, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  CONFIRMED: 'bg-info/15 text-info',
  SENT: 'bg-primary/15 text-primary',
  IN_TRANSIT: 'bg-warning/15 text-warning',
  RECEIVED: 'bg-success/15 text-success',
  CANCELLED: 'bg-destructive/15 text-destructive',
}

const NEXT: Record<string, string[]> = {
  DRAFT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SENT', 'CANCELLED'],
  SENT: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['RECEIVED'],
}

export function purchaseStatusLabel(status: string): string {
  return LABEL[status] ?? status
}

export function nextPurchaseStatuses(status: string): string[] {
  return NEXT[status] ?? []
}

export function isPurchaseClosed(status: string): boolean {
  return status === 'RECEIVED' || status === 'CANCELLED'
}
