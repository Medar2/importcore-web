export interface Vendor {
  id: string
  name: string
  tradeName: string | null
  countryCode: string
  contact: string | null
  phone: string | null
  email: string | null
  address: string | null
  paymentTerms: string | null
  notes: string | null
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}
