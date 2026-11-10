export interface FiscalDocument {
  id: string
  encf: string
  ecfType: string
  issueDate: string
  orderId: string | null
  buyerTaxId: string | null
  buyerName: string
  totalUsd: string
  exchangeRate: string
  subtotalDop: string
  itbisDop: string
  totalDop: string
  status: 'ACCEPTED' | 'CONDITIONAL' | 'IN_PROCESS' | 'REJECTED' | 'CANCELLED'
  provider: string
  trackId: string | null
  securityCode: string | null
  providerMessage: string | null
  cancellationType: string | null
  cancellationReason: string | null
}

export interface NcfSequence {
  id: string
  ecfType: string
  currentNumber: string
  endNumber: string
  expiresAt: string | null
  isActive: boolean
  nextEncf: string | null
  remaining: string
}

export interface FiscalPurchase {
  id: string
  supplierTaxId: string
  supplierName: string
  goodsServicesType: string
  ncf: string
  invoiceDate: string
  servicesAmount: string
  goodsAmount: string
  itbisBilled: string
  paymentMethod: string
}

export type Catalog = Record<string, string>

export interface FiscalCatalogs {
  ecfTypes: Catalog
  goodsServicesTypes: Catalog
  purchasePaymentMethods: Catalog
  isrWithholdingTypes: Catalog
  incomeTypes: Catalog
  cancellationTypes: Catalog
}
