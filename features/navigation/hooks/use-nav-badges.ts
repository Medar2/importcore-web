'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { apiGet } from '@/lib/api'
import { useCurrentUser } from '@/features/auth/hooks/use-current-user'
import { IMPORTCORE_PERMS, can } from '@/features/auth/utils/permissions'
import type { CurrentUser } from '@/features/auth/types'
import { quotesService } from '@/features/quotes/services/quotes.service'
import { receivablesService } from '@/features/receivables/services/receivables.service'
import type { NavBadgeKey } from '../types'

interface ContainerRow {
  id: string
  status: string
}

const ACTIVE_CONTAINER_STATUSES = new Set(['PLANNED', 'LOADED', 'IN_TRANSIT', 'ARRIVED'])

function badgeFetchers(user: CurrentUser): Partial<Record<NavBadgeKey, () => Promise<number>>> {
  const fetchers: Partial<Record<NavBadgeKey, () => Promise<number>>> = {}

  if (can(user, IMPORTCORE_PERMS.QUOTES_READ)) {
    fetchers['quotes-draft'] = async () => {
      const page = await quotesService.list({ status: 'DRAFT', pageSize: 1 })
      return page.total
    }
  }
  if (can(user, IMPORTCORE_PERMS.ORDERS_READ)) {
    fetchers['receivables-overdue'] = async () => {
      const report = await receivablesService.aging()
      return report.items.filter((item) => item.bucket !== 'CURRENT').length
    }
  }
  if (can(user, IMPORTCORE_PERMS.CONTAINERS_READ)) {
    fetchers['containers-active'] = async () => {
      const containers = await apiGet<ContainerRow[]>('/shipping/containers')
      return containers.filter((c) => ACTIVE_CONTAINER_STATUSES.has(c.status)).length
    }
  }
  return fetchers
}

/** Contadores del menú lateral; se refrescan al navegar. */
export function useNavBadges(): Partial<Record<NavBadgeKey, number>> {
  const { user } = useCurrentUser()
  const pathname = usePathname()
  const [badges, setBadges] = useState<Partial<Record<NavBadgeKey, number>>>({})

  useEffect(() => {
    if (!user) return
    let cancelled = false
    const fetchers = badgeFetchers(user)
    Promise.all(
      Object.entries(fetchers).map(async ([key, fetcher]) => {
        try {
          return [key, await fetcher!()] as const
        } catch {
          return [key, 0] as const
        }
      }),
    ).then((entries) => {
      if (cancelled) return
      setBadges(Object.fromEntries(entries) as Partial<Record<NavBadgeKey, number>>)
    })
    return () => {
      cancelled = true
    }
  }, [user, pathname])

  return badges
}
