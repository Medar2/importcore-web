'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Calculator,
  ClipboardList,
  Container,
  FileText,
  HandCoins,
  Home,
  Landmark,
  Package,
  Ship,
  ShoppingCart,
  Users,
  Wallet,
} from 'lucide-react'
import { getToken } from '@/lib/api'
import { UserMenu } from '@/features/auth/components/user-menu'

const NAV = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/quotes', label: 'Cotizaciones', icon: FileText },
  { href: '/orders', label: 'Pedidos', icon: ClipboardList },
  { href: '/purchases', label: 'Compras', icon: ShoppingCart },
  { href: '/receivables', label: 'CxC', icon: HandCoins },
  { href: '/fiscal', label: 'Fiscal', icon: Landmark },
  { href: '/customers', label: 'Clientes', icon: Users },
  { href: '/products', label: 'Productos', icon: Package },
  { href: '/vendors', label: 'Proveedores', icon: Container },
  { href: '/containers', label: 'Contenedores', icon: Ship },
  { href: '/exchange-rates', label: 'Tasas', icon: Wallet },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!getToken()) router.replace('/login')
  }, [router])

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Calculator className="size-4" />
            </span>
            <span className="hidden text-sm font-bold sm:block">ImportCore RD</span>
          </Link>
          <nav className="flex flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <item.icon className="size-3.5" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              )
            })}
          </nav>
          <UserMenu />
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  )
}
