import type { ElementType } from 'react'
import {
  ClipboardList,
  Container,
  FileText,
  Package,
  Ship,
  Users,
  Wallet,
} from 'lucide-react'
import { IMPORTCORE_PERMS } from '@/features/auth/utils/permissions'

export interface ModuleDef {
  label: string
  hint: string
  icon: ElementType
  href: string
  endpoint: string
  permission?: string
}

export interface ModuleStat {
  count: number | null
  ok: boolean
}

export const MODULES: ModuleDef[] = [
  {
    label: 'Cotizaciones',
    hint: 'Landed cost y PDF',
    icon: FileText,
    href: '/quotes',
    endpoint: '/quotes',
    permission: IMPORTCORE_PERMS.QUOTES_READ,
  },
  {
    label: 'Pedidos',
    hint: 'CxC y despacho',
    icon: ClipboardList,
    href: '/orders',
    endpoint: '/orders',
    permission: IMPORTCORE_PERMS.ORDERS_READ,
  },
  {
    label: 'Clientes',
    hint: 'RNC y cédula',
    icon: Users,
    href: '/customers',
    endpoint: '/customers',
    permission: IMPORTCORE_PERMS.CUSTOMERS_READ,
  },
  {
    label: 'Productos',
    hint: 'SKU y CBM',
    icon: Package,
    href: '/products',
    endpoint: '/products',
    permission: IMPORTCORE_PERMS.PRODUCTS_READ,
  },
  {
    label: 'Proveedores',
    hint: 'CxP y compras',
    icon: Container,
    href: '/vendors',
    endpoint: '/vendors',
    permission: IMPORTCORE_PERMS.VENDORS_READ,
  },
  {
    label: 'Contenedores',
    hint: 'Logística y demurrage',
    icon: Ship,
    href: '/containers',
    endpoint: '/shipping/containers',
    permission: IMPORTCORE_PERMS.CONTAINERS_READ,
  },
  {
    label: 'Tasas de cambio',
    hint: 'USD · DOP · CNY',
    icon: Wallet,
    href: '/exchange-rates',
    endpoint: '/exchange-rates',
    permission: IMPORTCORE_PERMS.EXCHANGE_RATES_READ,
  },
]
