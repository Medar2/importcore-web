export interface PurchaseOrder {
  id: string
  poNumber: string
  status: string
  totalUsd: string
  expectedDate: string | null
  notes: string | null
  createdAt: string
  vendor?: { id: string; name: string } | null
  order?: { id: string; orderNumber: string } | null
}

export interface PurchaseBalance {
  totalUsd: string
  paidUsd: string
  balanceUsd: string
}

export interface NewPurchaseOrder {
  vendorId: string
  orderId?: string
  totalUsd: string
  expectedDate?: string
  notes?: string
}
