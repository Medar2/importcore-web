'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Menu } from 'lucide-react'
import { getToken } from '@/lib/api'
import { UserMenu } from '@/features/auth/components/user-menu'
import { useCurrentUser } from '@/features/auth/hooks/use-current-user'
import { AppSidebar } from './app-sidebar'
import { isNavItemActive, visibleNavigation } from '../utils/visible-navigation'

const COLLAPSED_KEY = 'importcore.sidebar.collapsed'

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useCurrentUser()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (!getToken()) router.replace('/login')
  }, [router])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (localStorage.getItem(COLLAPSED_KEY) === '1') setCollapsed(true)
  }, [])

  useEffect(() => {
    if (!mobileOpen) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const sections = visibleNavigation(user)
  const activeItem = sections
    .flatMap((section) => section.items)
    .find((item) => isNavItemActive(pathname, item.href))

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current
      localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0')
      return next
    })
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex h-14 items-center gap-2 px-3 sm:px-4">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          <span className="text-sm font-bold lg:hidden">ImportCore RD</span>
          <span className="hidden truncate text-sm font-semibold text-muted-foreground lg:block">
            {activeItem?.label ?? 'ImportCore RD'}
          </span>

          <div className="ml-auto">
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside
          className={`sticky top-14 hidden h-[calc(100dvh-3.5rem)] shrink-0 border-r border-border transition-[width] duration-200 lg:flex ${
            collapsed ? 'w-20' : 'w-64'
          }`}
        >
          <AppSidebar
            sections={sections}
            collapsed={collapsed}
            variant="desktop"
            className="w-full"
            onToggle={toggleCollapsed}
            pathname={pathname}
          />
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 z-50 w-72 shadow-xl">
            <AppSidebar
              sections={sections}
              variant="mobile"
              className="border-r border-border"
              onClose={() => setMobileOpen(false)}
              onNavigate={() => setMobileOpen(false)}
              pathname={pathname}
            />
          </div>
        </div>
      )}
    </div>
  )
}
