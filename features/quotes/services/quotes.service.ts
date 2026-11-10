import { apiGet, apiPatch, apiPost, downloadPdf } from '@/lib/api'
import type { Quote, QuoteComputationResult } from '../types'

export interface QuoteItemInput {
  description?: string
  unitsPerBox: number
  boxesCount: number
  lengthM: string
  widthM: string
  heightM: string
  unitFobPriceUsd: string
  boxGrossWeightKg?: string
  rates: { gravamenRate: string; itbisRate?: string; selectivoRate?: string }
}

export interface CalculateQuoteInput {
  items: QuoteItemInput[]
  containerFreightUsd: string
  containerInsuranceUsd?: string
  localExpensesUsd?: string
  bankFeesUsd?: string
  containerType?: '20_ST' | '40_ST' | '40_HC' | 'LCL'
  containerUsableCbm?: string
  containerPayloadKg?: string
  prorationBasis?: 'WEIGHT' | 'CBM' | 'VALUE'
  markupPercent?: string
}

export const quotesService = {
  list: () => apiGet<Quote[]>('/quotes'),
  calculate: (input: CalculateQuoteInput) =>
    apiPost<QuoteComputationResult>('/quotes/calculate', input),
  create: (
    input: CalculateQuoteInput & {
      customerName?: string
      customerId?: string
      validDays?: number
      containerId?: string
    },
  ) => apiPost<Quote>('/quotes', input),
  setStatus: (id: string, status: string) =>
    apiPatch<Quote>(`/quotes/${id}/status`, { status }),
  pdf: (id: string, quoteNumber: string) =>
    downloadPdf(`/quotes/${id}/pdf`, `${quoteNumber}.pdf`),
}
