import { apiGet } from '@/lib/api'
import type { Customer } from '@/features/customers/types'

export const customersService = {
  list: () => apiGet<Customer[]>('/customers'),
  get: (id: string) => apiGet<Customer>(`/customers/${id}`),
}
