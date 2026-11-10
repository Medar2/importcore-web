'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { clearToken, logoutDevice } from '@/lib/api'
import { resetCurrentUser } from './use-current-user'

/** Cierra la sesión de este dispositivo en el servidor y limpia el navegador. */
export function useLogout() {
  const router = useRouter()
  return useCallback(async () => {
    await logoutDevice()
    clearToken()
    resetCurrentUser()
    router.replace('/login')
  }, [router])
}
