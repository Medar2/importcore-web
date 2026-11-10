export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_TRANSIT'
  | 'ARRIVED'
  | 'READY'
  | 'DISPATCHED'
  | 'CANCELLED'

export const ORDER_STEPS: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'IN_TRANSIT',
  'ARRIVED',
  'READY',
  'DISPATCHED',
]

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  IN_TRANSIT: 'En tránsito',
  ARRIVED: 'En puerto RD',
  READY: 'Listo para despacho',
  DISPATCHED: 'Despachado',
  CANCELLED: 'Cancelado',
}

/** Debe coincidir con MANUAL_TRANSITIONS del backend (orders/domain). */
const NEXT: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['ARRIVED'],
  ARRIVED: ['READY'],
  READY: [],
  DISPATCHED: [],
  CANCELLED: [],
}

export function nextStatuses(status: string): OrderStatus[] {
  return NEXT[status as OrderStatus] ?? []
}

export function statusLabel(status: string): string {
  return STATUS_LABEL[status as OrderStatus] ?? status
}
