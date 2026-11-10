export type AgingBucket = 'CURRENT' | 'DAYS_31_60' | 'DAYS_61_90' | 'OVER_90'

export interface AgedReceivable {
  orderId: string
  orderNumber: string
  customerId: string
  customerName: string
  balanceUsd: string
  days: number
  bucket: AgingBucket
}

export interface AgingReport {
  asOf: string
  totals: Record<AgingBucket, string> & { total: string }
  items: AgedReceivable[]
}

export interface ReminderRunResult {
  sent: string[]
  withoutEmail: string[]
}
