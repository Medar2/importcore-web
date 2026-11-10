import { apiGet } from '@/lib/api'

export interface ContainerAvailability {
  id: string
  containerNumber: string
  containerType: string
  status: string
  capacityCbm: number
  capacityKg: number
  usedCbm: string
  usedKg: string
  remainingCbm: string
  remainingKg: string
}

export const containersService = {
  availability: () =>
    apiGet<ContainerAvailability[]>('/shipping/containers/availability'),
}
