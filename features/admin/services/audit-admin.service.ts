import { apiGet } from '@/lib/api'

export interface AuditLogRow {
  id: string
  timestamp: string
  userId: string | null
  userEmail: string | null
  action: string
  resource: string
  result: 'success' | 'failure' | 'denied'
  ipAddress?: string | null
}

interface AuditLogsResponse {
  success: boolean
  data: AuditLogRow[]
  count: number
}

export const auditAdminService = {
  list: (params?: { action?: string; userEmail?: string }) => {
    const q = new URLSearchParams()
    if (params?.action) q.set('action', params.action)
    if (params?.userEmail) q.set('userEmail', params.userEmail)
    const qs = q.toString()
    return apiGet<AuditLogsResponse>(`/audit/logs${qs ? `?${qs}` : ''}`).then((r) => r.data)
  },
}
