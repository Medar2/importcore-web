import { apiGet } from '@/lib/api'
import type { Product } from '@/features/products/types'

export const productsService = {
  list: () => apiGet<Product[]>('/products'),
}
