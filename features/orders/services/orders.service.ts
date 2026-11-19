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

export interface OrderTrackingResult {
  orderId: string
  orderNumber: string
  status: string
  customerName: string
  financial: {
    totalUsd: string
    paidUsd: string
    balanceUsd: string
    dispatchLocked: boolean
  }
  liberationMessage: string
  container: {
    id: string
    containerNumber: string
    containerType: string
    status: string
    etd: string | null
    eta: string | null
    ata: string | null
  } | null
}

export interface OrderPage {
  items: Order[]
  total: number
  page: number
  pageSize: number
}

export interface OrderListParams {
  status?: string
  search?: string
  page?: number
  pageSize?: number
}

export const ordersService = {
  create: (body: { quoteId: string; customerId?: string; containerId?: string; notes?: string }) =>
    apiPost<Order>('/orders', body),
  list: (params?: OrderListParams) => {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.search?.trim()) query.set('search', params.search.trim())
    if (params?.page) query.set('page', String(params.page))
    if (params?.pageSize) query.set('pageSize', String(params.pageSize))
    const qs = query.toString()
    return apiGet<OrderPage>(`/orders${qs ? `?${qs}` : ''}`)
  },
  balance: (id: string) => apiGet<OrderBalance>(`/orders/${id}/balance`),
  tracking: (id: string) => apiGet<OrderTrackingResult>(`/orders/${id}/tracking`),
  pay: (id: string, body: Record<string, unknown>) =>
    apiPost(`/orders/${id}/payments`, body),
  dispatch: (id: string, overrideReason?: string) =>
    apiPost(`/orders/${id}/dispatch`, { overrideReason }),
  setStatus: (id: string, status: string, notes?: string) =>
    apiPatch<Order>(`/orders/${id}/status`, { status, notes }),
}
