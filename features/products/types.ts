export interface TariffHeadingRef {
  id: string
  hsCode: string
  description: string
  gravamenRate: string
  itbisRate: string
  selectivoRate: string
}

export interface Product {
  id: string
  sku: string
  description: string
  unitsPerBox: number
  boxesPerPallet: number | null
  boxLengthM: string
  boxWidthM: string
  boxHeightM: string
  boxGrossWeightKg: string | null
  unitFobPriceUsd: string | null
  imageUrls?: string[]
  isActive?: boolean
  vendor?: { id?: string; name: string } | null
  tariffHeading?: TariffHeadingRef | null
  createdAt?: string
  updatedAt?: string
}

export interface ProductDetail extends Product {
  relatedProducts: Product[]
}
