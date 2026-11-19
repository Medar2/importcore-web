import { apiGet } from '@/lib/api'
import type { Customer } from '@/features/customers/types'

export interface CustomerPage {
  items: Customer[]
  total: number
  page: number
  pageSize: number
}

export const customersService = {
  list: () => apiGet<Customer[]>('/customers'),
  listPage: (params?: { search?: string; page?: number; pageSize?: number }) => {
    const query = new URLSearchParams()
    if (params?.search?.trim()) query.set('search', params.search.trim())
    if (params?.page) query.set('page', String(params.page))
    if (params?.pageSize) query.set('pageSize', String(params.pageSize))
    const qs = query.toString()
    return apiGet<CustomerPage>(`/customers${qs ? `?${qs}` : '?pageSize=20'}`)
  },
  get: (id: string) => apiGet<Customer>(`/customers/${id}`),
}
