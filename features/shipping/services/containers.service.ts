import { apiGet, apiPost } from '@/lib/api'

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

export interface ContainerOccupantDetail {
  id: string
  type: 'ORDER' | 'QUOTE'
  reference: string
  customerId?: string | null
  customerName?: string | null
  status: string
  cbm: number
  weightKg: number
  cbmSharePercent: number
  weightSharePercent: number
}

export interface ContainerOccupancy {
  containerId: string
  containerNumber: string
  containerType: string
  status: string
  capacityCbm: number
  capacityKg: number
  usedCbm: number
  usedKg: number
  remainingCbm: number
  remainingKg: number
  occupancyCbmPercent: number
  occupancyKgPercent: number
  isOverloaded: boolean
  itemCount: number
  items: ContainerOccupantDetail[]
}

export interface TrackingSyncResult {
  container: {
    id: string
    containerNumber: string
    status: string
    etd: string | null
    eta: string | null
    ata: string | null
  }
  tracking: {
    containerNumber: string
    carrierCode?: string | null
    status: string
    currentLocation: string | null
    events: Array<{
      date: string
      stage: string
      description: string
      location: string
    }>
  }
  remindersSent: number
}

export const containersService = {
  availability: () =>
    apiGet<ContainerAvailability[]>('/shipping/containers/availability'),
  occupancy: (id: string) =>
    apiGet<ContainerOccupancy>(`/shipping/containers/${id}/occupancy`),
  syncTracking: (id: string) =>
    apiPost<TrackingSyncResult>(`/shipping/containers/${id}/track`, {}),
}
