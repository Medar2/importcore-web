'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { LogOut, Settings, ShieldCheck, UserRound } from 'lucide-react'
import { useCurrentUser } from '../hooks/use-current-user'
import { useLogout } from '../hooks/use-logout'
import { ADMIN_PERMS, PERM, can, canAny, displayName, initials } from '../utils/permissions'

const itemCls =
  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition hover:bg-secondary'

export function UserMenu() {
  const { user } = useCurrentUser()
  const logout = useLogout()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const name = displayName(user)
  const close = () => setOpen(false)

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menú de usuario"
        className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary ring-offset-2 transition hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {user ? initials(user) : <UserRound className="size-4" />}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-30 w-64 rounded-xl border border-border bg-card p-1.5 shadow-lg"
        >
          <div className="border-b border-border px-3 pb-2 pt-1.5">
            <p className="truncate text-sm font-semibold">{name || 'Usuario'}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.profile.email ?? user?.profile.username ?? ''}
            </p>
            {user?.profile.roles.length ? (
              <p className="mt-1 truncate text-[11px] text-muted-foreground">
                {user.profile.roles.map((r) => r.name).join(' · ')}
              </p>
            ) : null}
          </div>
          <div className="pt-1">
            <Link href="/profile" role="menuitem" onClick={close} className={itemCls}>
              <UserRound className="size-4 text-muted-foreground" /> Mi perfil
            </Link>
            {canAny(user, ADMIN_PERMS) && (
              <Link href="/admin" role="menuitem" onClick={close} className={itemCls}>
                <ShieldCheck className="size-4 text-muted-foreground" /> Administración
              </Link>
            )}
            {can(user, PERM.SETTINGS_VIEW) && (
              <Link href="/admin/settings" role="menuitem" onClick={close} className={itemCls}>
                <Settings className="size-4 text-muted-foreground" /> Configuración del sistema
              </Link>
            )}
            <button type="button" role="menuitem" onClick={logout} className={`${itemCls} text-destructive`}>
              <LogOut className="size-4" /> Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
