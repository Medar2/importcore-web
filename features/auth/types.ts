export interface ProfileRole {
  id: string
  name: string
  description: string | null
  color: string | null
}

export interface UserProfile {
  id: string
  username: string
  email: string | null
  firstName: string
  lastName: string
  phone: string | null
  status: string
  isSuperAdmin: boolean
  mfaEnabled: boolean
  emailVerified: boolean
  lastLoginAt: string | null
  createdAt: string
  organization: { id: string; name: string } | null
  roles: ProfileRole[]
}

export interface UserPermission {
  code: string
  source: 'role' | 'direct' | 'delegated' | string
  context?: unknown
}

export interface ActiveSession {
  id: string
  deviceName: string | null
  deviceType: string | null
  browser: string | null
  os: string | null
  ipAddress: string | null
  lastActivityAt: string | null
  createdAt: string
}

export interface CurrentUser {
  profile: UserProfile
  permissions: string[]
}
