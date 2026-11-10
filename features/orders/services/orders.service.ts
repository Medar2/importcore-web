import { apiGet, apiPatch, apiPost } from '@/lib/api'

export interface Order {
  id: string
  orderNumber: string
  status: string
  totalUsd: string
  currency: string
  notes: string | null
  createdAt: string
  customer?: { id: string; name: string } | null
  quote?: { id: string; quoteNumber: string } | null
}

export interface OrderBalance {
  totalUsd: string
  paidUsd: string
  balanceUsd: string
  dispatchLocked: boolean
}

export const ordersService = {
  create: (body: { quoteId: string; customerId?: string; containerId?: string; notes?: string }) =>
    apiPost<Order>('/orders', body),
  list: (status?: string) =>
    apiGet<Order[]>(`/orders${status ? `?status=${status}` : ''}`),
  balance: (id: string) => apiGet<OrderBalance>(`/orders/${id}/balance`),
  pay: (id: string, body: Record<string, unknown>) =>
    apiPost(`/orders/${id}/payments`, body),
  dispatch: (id: string, overrideReason?: string) =>
    apiPost(`/orders/${id}/dispatch`, { overrideReason }),
  setStatus: (id: string, status: string, notes?: string) =>
    apiPatch<Order>(`/orders/${id}/status`, { status, notes }),
}
