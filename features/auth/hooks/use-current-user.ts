'use client'

import { useEffect, useState } from 'react'
import { getToken } from '@/lib/api'
import { profileService } from '../services/profile.service'
import type { CurrentUser } from '../types'

let cached: Promise<CurrentUser> | null = null
let cachedToken: string | null = null

function loadCurrentUser(): Promise<CurrentUser> {
  const token = getToken()
  if (!cached || cachedToken !== token) {
    cachedToken = token
    cached = Promise.all([profileService.me(), profileService.permissions()])
      .then(([profile, perms]) => ({ profile, permissions: perms.map((p) => p.code) }))
      .catch((err) => {
        cached = null
        throw err
      })
  }
  return cached
}

/** Olvida el usuario en memoria (al cerrar sesión). */
export function resetCurrentUser(): void {
  cached = null
  cachedToken = null
}

/** Perfil + permisos del usuario autenticado; se comparte entre pantallas. */
export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) {
      setLoading(false)
      return
    }
    let alive = true
    loadCurrentUser()
      .then((u) => alive && setUser(u))
      .catch((e: Error) => alive && setError(e.message))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  return { user, error, loading }
}
