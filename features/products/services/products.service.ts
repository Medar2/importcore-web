import { apiGet, apiPatch, apiPost, apiUpload } from '@/lib/api'
import type { Product, ProductDetail } from '@/features/products/types'

export const productsService = {
  list: () => apiGet<Product[]>('/products'),
  get: (id: string) => apiGet<ProductDetail>(`/products/${id}`),
  create: (body: Record<string, unknown>) => apiPost<Product>('/products', body),
  update: (id: string, body: Record<string, unknown>) =>
    apiPatch<ProductDetail>(`/products/${id}`, body),
  uploadImages: (id: string, files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    return apiUpload<ProductDetail>(`/products/${id}/images`, formData)
  },
}
