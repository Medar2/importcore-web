import { apiGet } from '@/lib/api'

export interface AuditChange {
  from: unknown
  to: unknown
}

export interface AuditLogMetadata {
  changes?: Record<string, AuditChange>
  orderNumber?: string
  encf?: string
  [key: string]: unknown
}

export interface AuditLogRow {
  id: string
  timestamp: string
  userId: string | null
  userEmail: string | null
  action: string
  resource: string
  resourceId?: string | null
  result: 'success' | 'failure' | 'denied'
  reason?: string | null
  ipAddress?: string | null
  method?: string | null
  endpoint?: string | null
  metadata?: AuditLogMetadata | null
}

interface AuditLogsResponse {
  success: boolean
  data: AuditLogRow[]
  count: number
}

export interface SessionAuditRow {
  id: string
  userId: string
  userEmail: string | null
  username: string | null
  deviceName: string | null
  deviceType: string | null
  browser: string | null
  os: string | null
  ipAddress: string | null
  country: string | null
  city: string | null
  isActive: boolean
  createdAt: string
  lastActivityAt: string
  closedAt: string | null
  closeReason: string | null
  durationMs: number
}

interface SessionsResponse {
  success: boolean
  data: SessionAuditRow[]
  total: number
  page: number
  limit: number
}

interface UserSessionsResponse {
  success: boolean
  data: SessionAuditRow[]
  count: number
}

export interface SessionSummaryRow {
  userId: string
  userEmail: string | null
  username: string | null
  totalSessions: number
  activeSessions: number
  totalDurationMs: number
}

interface SummaryResponse {
  success: boolean
  data: SessionSummaryRow[]
}

export interface AuditLogFilters {
  action?: string
  userEmail?: string
  resource?: string
  result?: 'success' | 'failure' | 'denied'
  startDate?: string
  endDate?: string
}

function auditQuery(filters?: AuditLogFilters): string {
  const q = new URLSearchParams()
  if (filters?.action) q.set('action', filters.action)
  if (filters?.userEmail) q.set('userEmail', filters.userEmail)
  if (filters?.resource) q.set('resource', filters.resource)
  if (filters?.result) q.set('result', filters.result)
  if (filters?.startDate) q.set('startDate', filters.startDate)
  if (filters?.endDate) q.set('endDate', filters.endDate)
  const qs = q.toString()
  return qs ? `?${qs}` : ''
}

export const auditAdminService = {
  list: (filters?: AuditLogFilters) =>
    apiGet<AuditLogsResponse>(`/audit/logs${auditQuery(filters)}`).then((r) => r.data),

  listSessions: (params?: {
    userId?: string
    isActive?: boolean
    closeReason?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }) => {
    const q = new URLSearchParams()
    if (params?.userId) q.set('userId', params.userId)
    if (params?.isActive !== undefined) q.set('isActive', String(params.isActive))
    if (params?.closeReason) q.set('closeReason', params.closeReason)
    if (params?.startDate) q.set('startDate', params.startDate)
    if (params?.endDate) q.set('endDate', params.endDate)
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    const qs = q.toString()
    return apiGet<SessionsResponse>(`/audit/sessions${qs ? `?${qs}` : ''}`)
  },

  userSessions: (userId: string, params?: { startDate?: string; endDate?: string }) => {
    const q = new URLSearchParams()
    if (params?.startDate) q.set('startDate', params.startDate)
    if (params?.endDate) q.set('endDate', params.endDate)
    const qs = q.toString()
    return apiGet<UserSessionsResponse>(
      `/audit/sessions/user/${userId}${qs ? `?${qs}` : ''}`,
    ).then((r) => r.data)
  },

  sessionSummary: (params?: { startDate?: string; endDate?: string }) => {
    const q = new URLSearchParams()
    if (params?.startDate) q.set('startDate', params.startDate)
    if (params?.endDate) q.set('endDate', params.endDate)
    const qs = q.toString()
    return apiGet<SummaryResponse>(`/audit/sessions/summary${qs ? `?${qs}` : ''}`).then(
      (r) => r.data,
    )
  },
}
