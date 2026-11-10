export interface AdminUser {
  id: string
  username: string
  status: string
  isSuperAdmin: boolean
  mfaEnabled: boolean
  lastLoginAt: string | null
  createdAt: string
  person?: { firstName?: string; lastName?: string; email?: string } | null
  roles?: { id: string; name: string }[]
  organization?: { id: string; name: string } | null
}

export interface SystemSetting {
  id?: string
  key: string
  value: string
  description: string | null
  group: string
  /** El backend devuelve `********` en lugar del valor real. */
  isSecret: boolean
  hasValue: boolean
}
