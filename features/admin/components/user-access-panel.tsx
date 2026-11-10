'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { CurrentUser } from '@/features/auth/types'
import { PERM, can } from '@/features/auth/utils/permissions'
import { adminUsersService } from '../services/admin-users.service'
import type { AdminUser } from '../types'
import { userAccessService, type CatalogPermission, type CatalogRole, type UserAccess } from '../services/user-access.service'
import { UserRolesEditor } from './user-roles-editor'
import { UserDirectPermissions } from './user-direct-permissions'
import { UserEffectivePermissions } from './user-effective-permissions'

interface UserAccessPanelProps {
  userId: string
  me: CurrentUser
}

export function UserAccessPanel({ userId, me }: UserAccessPanelProps) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [access, setAccess] = useState<UserAccess | null>(null)
  const [roles, setRoles] = useState<CatalogRole[]>([])
  const [perms, setPerms] = useState<CatalogPermission[]>([])
  const [error, setError] = useState<string | null>(null)
  const [sectionError, setSectionError] = useState('')

  const canEditRoles = can(me, PERM.USERS_EDIT)
  const canRolesView = can(me, PERM.ROLES_VIEW)
  const canViewCatalog = can(me, PERM.PERMISSIONS_VIEW)
  const canAssign = can(me, PERM.PERMISSIONS_ASSIGN)
  const canRevoke = can(me, PERM.PERMISSIONS_REVOKE)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [u, a] = await Promise.all([adminUsersService.get(userId), userAccessService.get(userId)])
        if (cancelled) return
        setUser(u)
        setAccess(a)
        const catalogLoads: Promise<void>[] = []
        if (canEditRoles && canRolesView) {
          catalogLoads.push(
            userAccessService.catalogRoles().then((r) => {
              if (!cancelled) setRoles(r)
            }),
          )
        }
        if (canViewCatalog && (canAssign || canRevoke)) {
          catalogLoads.push(
            userAccessService.catalogPermissions().then((p) => {
              if (!cancelled) setPerms(p)
            }),
          )
        }
        await Promise.all(catalogLoads)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'No se pudo cargar')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userId, canEditRoles, canRolesView, canViewCatalog, canAssign, canRevoke])

  if (error) {
    return <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
  }
  if (!user || !access) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Cargando acceso…
      </p>
    )
  }

  const name = `${user.person?.firstName ?? ''} ${user.person?.lastName ?? ''}`.trim() || user.username

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="font-semibold">{name}</p>
        <p className="text-xs text-muted-foreground">
          @{user.username}
          {user.person?.email ? ` · ${user.person.email}` : ''}
        </p>
      </div>
      {sectionError && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{sectionError}</p>}
      <UserRolesEditor
        userId={userId}
        access={access}
        catalog={roles}
        canEdit={canEditRoles}
        onUpdated={setAccess}
        onError={setSectionError}
      />
      <UserDirectPermissions
        userId={userId}
        access={access}
        catalog={perms}
        canAssign={canAssign}
        canRevoke={canRevoke}
        onUpdated={setAccess}
        onError={setSectionError}
      />
      <UserEffectivePermissions access={access} />
    </div>
  )
}
