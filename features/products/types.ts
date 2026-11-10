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
  boxLengthM: string
  boxWidthM: string
  boxHeightM: string
  boxGrossWeightKg: string | null
  unitFobPriceUsd: string | null
  vendor?: { name: string } | null
  tariffHeading?: TariffHeadingRef | null
}
