export interface QuoteItemBreakdown {
  description?: string
  units: number
  cbm: string
  fobUsd: string
  proratedFreightUsd: string
  proratedInsuranceUsd: string
  cifUsd: string
  gravamenUsd: string
  selectivoUsd: string
  itbisUsd: string
  landedCostUsd: string
  unitLandedCostUsd: string
  unitCustomerPriceUsd?: string
}

export interface QuoteComputationResult {
  currency: string
  prorationBasis: string
  recommendedContainer: string
  totals: {
    cbm: string
    weightKg: string
    fobUsd: string
    freightUsd: string
    insuranceUsd: string
    cifUsd: string
    gravamenUsd: string
    selectivoUsd: string
    itbisUsd: string
    landedCostUsd: string
    customerPriceUsd?: string
  }
  items: QuoteItemBreakdown[]
}

export interface Quote {
  id: string
  quoteNumber: string
  customerName: string | null
  customerId?: string | null
  customer?: {
    id: string
    name: string
    taxId: string
    phone?: string | null
    email?: string | null
  } | null
  containerId?: string | null
  container?: {
    id: string
    containerNumber: string
    containerType: string
    status?: string
  } | null
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'CONVERTED'
  currency: string
  landedCostUsd: string
  customerPriceUsd: string | null
  validUntil: string | null
  createdAt: string
  cbm?: string | null
  weightKg?: string | null
}

export interface QuotePage {
  items: Quote[]
  total: number
  page: number
  pageSize: number
}

export interface QuoteRequestSnapshot {
  items?: Array<{
    description?: string
    unitsPerBox?: number
    boxesCount?: number
    lengthM?: string | number
    widthM?: string | number
    heightM?: string | number
    unitFobPriceUsd?: string | number
    boxGrossWeightKg?: string | number
    rates?: {
      gravamenRate?: string | number
      itbisRate?: string | number
      selectivoRate?: string | number
    }
  }>
  containerFreightUsd?: string | number
  containerInsuranceUsd?: string | number
  localExpensesUsd?: string | number
  bankFeesUsd?: string | number
  containerType?: string
  containerUsableCbm?: string | number
  containerPayloadKg?: string | number
  prorationBasis?: string
  markupPercent?: string | number
}

export interface QuoteReservation {
  reservesSpace: boolean
  heldBy: 'QUOTE' | 'ORDER' | null
  cbm: string
  weightKg: string
  recommendedContainer: string | null
  shareCbmPercent: number | null
  container: {
    id: string
    containerNumber: string
    containerType: string
    status: string
    etd: string | null
    eta: string | null
    ata: string | null
    blNumber: string | null
    capacityCbm: number | null
    capacityKg: number | null
    usedCbm: number | null
    usedKg: number | null
    remainingCbm: number | null
    remainingKg: number | null
    occupancyCbmPercent: number | null
    isOverloaded: boolean
  } | null
}

export interface QuoteDetail extends Quote {
  calculationResult: QuoteComputationResult
  requestSnapshot: QuoteRequestSnapshot | null
  order: { id: string; orderNumber: string; status: string } | null
  reservation: QuoteReservation
  updatedAt?: string
}
