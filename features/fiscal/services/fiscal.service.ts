import { apiDelete, apiGet, apiPost, downloadFile } from '@/lib/api'
import type { FiscalCatalogs, FiscalDocument, FiscalPurchase, NcfSequence } from '../types'

const q = (params: Record<string, string | undefined>) => {
  const s = new URLSearchParams(
    Object.entries(params).filter((e): e is [string, string] => !!e[1]),
  ).toString()
  return s ? `?${s}` : ''
}

export const fiscalService = {
  catalogs: () => apiGet<FiscalCatalogs>('/fiscal/catalogs'),

  documents: (period?: string, orderId?: string) =>
    apiGet<FiscalDocument[]>(`/fiscal/documents${q({ period, orderId })}`),
  emit: (body: { orderId: string; ecfType?: string; pricesIncludeItbis?: boolean; exchangeRate?: string }) =>
    apiPost<FiscalDocument>('/fiscal/ecf/emit', body),
  cancel: (id: string, cancellationType: string, reason: string) =>
    apiPost<FiscalDocument>(`/fiscal/documents/${id}/cancel`, { cancellationType, reason }),

  sequences: () => apiGet<NcfSequence[]>('/fiscal/sequences'),
  createSequence: (body: { ecfType: string; startNumber: string; endNumber: string; expiresAt?: string }) =>
    apiPost<NcfSequence>('/fiscal/sequences', body),

  purchases: (period?: string) => apiGet<FiscalPurchase[]>(`/fiscal/purchases${q({ period })}`),
  createPurchase: (body: Record<string, string | undefined>) =>
    apiPost<FiscalPurchase>('/fiscal/purchases', body),
  removePurchase: (id: string) => apiDelete(`/fiscal/purchases/${id}`),

  downloadReport: (format: '606' | '607' | '608', period: string) =>
    downloadFile(`/reports/dgii/${format}?period=${period}`, `DGII_F_${format}_${period}.TXT`),
}

/** AAAAMM del mes actual (zona local). */
export function currentPeriod(): string {
  const d = new Date()
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`
}
