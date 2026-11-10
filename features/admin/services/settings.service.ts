import { apiGet, apiPatch } from '@/lib/api'
import type { SystemSetting } from '../types'

export const settingsService = {
  list: () => apiGet<SystemSetting[]>('/configuracion'),
  /** Crea la clave si no existe (upsert en el backend). */
  save: (key: string, body: { value: string; description?: string | null; group?: string }) =>
    apiPatch<SystemSetting>(`/configuracion/${encodeURIComponent(key)}`, body),
}
