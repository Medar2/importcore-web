export interface Customer {
  id: string
  name: string
  taxId: string
  customerType: string
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}
