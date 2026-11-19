import { apiGet } from '@/lib/api'
import type { Vendor } from '@/features/vendors/types'

export const vendorsService = {
  list: () => apiGet<Vendor[]>('/vendors'),
  get: (id: string) => apiGet<Vendor>(`/vendors/${id}`),
}
