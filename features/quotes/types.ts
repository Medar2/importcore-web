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
  customer?: { id: string; name: string; taxId: string } | null
  containerId?: string | null
  container?: { id: string; containerNumber: string; containerType: string } | null
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'CONVERTED'
  currency: string
  landedCostUsd: string
  customerPriceUsd: string | null
  validUntil: string | null
  createdAt: string
}
