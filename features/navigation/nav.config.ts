import {
  ClipboardList,
  Container,
  FileText,
  HandCoins,
  Home,
  Landmark,
  Package,
  Settings,
  Ship,
  ShoppingCart,
  Users,
  Wallet,
} from 'lucide-react'
import { ADMIN_PERMS, IMPORTCORE_PERMS } from '@/features/auth/utils/permissions'
import type { NavSection } from './types'

/** Catálogo central del menú. La visibilidad se filtra por permisos efectivos del usuario. */
export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'principal',
    label: 'Principal',
    items: [{ id: 'dashboard', href: '/dashboard', label: 'Inicio', icon: Home }],
  },
  {
    id: 'comercial',
    label: 'Comercial',
    items: [
      {
        id: 'quotes',
        href: '/quotes',
        label: 'Cotizaciones',
        icon: FileText,
        permission: IMPORTCORE_PERMS.QUOTES_READ,
      },
      {
        id: 'orders',
        href: '/orders',
        label: 'Pedidos',
        icon: ClipboardList,
        permission: IMPORTCORE_PERMS.ORDERS_READ,
      },
      {
        id: 'purchases',
        href: '/purchases',
        label: 'Compras',
        icon: ShoppingCart,
        permission: IMPORTCORE_PERMS.PURCHASES_READ,
      },
      {
        id: 'receivables',
        href: '/receivables',
        label: 'CxC',
        icon: HandCoins,
        permission: IMPORTCORE_PERMS.ORDERS_READ,
      },
    ],
  },
  {
    id: 'catalogo',
    label: 'Catálogo',
    items: [
      {
        id: 'customers',
        href: '/customers',
        label: 'Clientes',
        icon: Users,
        permission: IMPORTCORE_PERMS.CUSTOMERS_READ,
      },
      {
        id: 'products',
        href: '/products',
        label: 'Productos',
        icon: Package,
        permission: IMPORTCORE_PERMS.PRODUCTS_READ,
      },
      {
        id: 'vendors',
        href: '/vendors',
        label: 'Proveedores',
        icon: Container,
        permission: IMPORTCORE_PERMS.VENDORS_READ,
      },
    ],
  },
  {
    id: 'logistica-fiscal',
    label: 'Logística y fiscal',
    items: [
      {
        id: 'containers',
        href: '/containers',
        label: 'Contenedores',
        icon: Ship,
        permission: IMPORTCORE_PERMS.CONTAINERS_READ,
      },
      {
        id: 'exchange-rates',
        href: '/exchange-rates',
        label: 'Tasas',
        icon: Wallet,
        permission: IMPORTCORE_PERMS.EXCHANGE_RATES_READ,
      },
      {
        id: 'fiscal',
        href: '/fiscal',
        label: 'Fiscal',
        icon: Landmark,
        permission: IMPORTCORE_PERMS.FISCAL_READ,
      },
    ],
  },
  {
    id: 'sistema',
    label: 'Sistema',
    items: [
      {
        id: 'admin',
        href: '/admin',
        label: 'Administración',
        icon: Settings,
        anyOf: ADMIN_PERMS,
      },
    ],
  },
]
