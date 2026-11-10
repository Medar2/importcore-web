'use client'

import { Loader2, Lock } from 'lucide-react'
import { useCurrentUser } from '../hooks/use-current-user'
import { can } from '../utils/permissions'
import type { CurrentUser } from '../types'

interface PermissionGateProps {
  /** Basta con uno de los permisos. */
  anyOf: string[]
  children: (user: CurrentUser) => React.ReactNode
}

/** Oculta la pantalla si el usuario no tiene permiso; el backend valida igual. */
export function PermissionGate({ anyOf, children }: PermissionGateProps) {
  const { user, error, loading } = useCurrentUser()

  if (loading) {
    return (
      <p className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Cargando…
      </p>
    )
  }
  if (error) return <p className="m-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
  if (!user || !anyOf.some((p) => can(user, p))) {
    return (
      <div className="m-4 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border p-8 text-center">
        <Lock className="size-6 text-muted-foreground" />
        <p className="text-sm font-semibold">Sin acceso</p>
        <p className="text-xs text-muted-foreground">Tu rol no tiene permiso para ver esta sección.</p>
      </div>
    )
  }
  return <>{children(user)}</>
}
