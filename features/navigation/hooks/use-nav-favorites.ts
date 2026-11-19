'use client'

import { useCallback, useEffect, useState } from 'react'

function storageKey(userId: string | undefined): string {
  return `importcore.nav.favorites.${userId ?? 'anonymous'}`
}

function readFavorites(userId: string | undefined): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(storageKey(userId))
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

/** Favoritos del menú lateral, persistidos por usuario en localStorage. */
export function useNavFavorites(userId: string | undefined) {
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    setFavorites(readFavorites(userId))
  }, [userId])

  const toggle = useCallback(
    (id: string) => {
      setFavorites((current) => {
        const next = current.includes(id) ? current.filter((f) => f !== id) : [...current, id]
        localStorage.setItem(storageKey(userId), JSON.stringify(next))
        return next
      })
    },
    [userId],
  )

  return { favorites, toggle, isFavorite: (id: string) => favorites.includes(id) }
}
