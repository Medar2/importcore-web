import { apiGet, apiPatch, apiPost } from '@/lib/api'
import type { NewPurchaseOrder, PurchaseBalance, PurchaseOrder } from '../types'

const BASE = '/purchases/orders'

export const purchasesService = {
  list: () => apiGet<PurchaseOrder[]>(BASE),
  get: (id: string) => apiGet<PurchaseOrder>(`${BASE}/${id}`),
  balance: (id: string) => apiGet<PurchaseBalance>(`${BASE}/${id}/balance`),
  create: (body: NewPurchaseOrder) => apiPost<PurchaseOrder>(BASE, body),
  setStatus: (id: string, status: string) =>
    apiPatch<PurchaseOrder>(`${BASE}/${id}`, { status }),
  pay: (id: string, body: Record<string, unknown>) =>
    apiPost(`${BASE}/${id}/payments`, body),
}
