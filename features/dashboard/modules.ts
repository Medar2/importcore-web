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

export interface ModuleDef {
  label: string
  hint: string
  icon: ElementType
  href: string
  endpoint: string
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
  },
  {
    label: 'Pedidos',
    hint: 'CxC y despacho',
    icon: ClipboardList,
    href: '/orders',
    endpoint: '/orders',
  },
  {
    label: 'Clientes',
    hint: 'RNC y cédula',
    icon: Users,
    href: '/customers',
    endpoint: '/customers',
  },
  {
    label: 'Productos',
    hint: 'SKU y CBM',
    icon: Package,
    href: '/products',
    endpoint: '/products',
  },
  {
    label: 'Proveedores',
    hint: 'CxP y compras',
    icon: Container,
    href: '/vendors',
    endpoint: '/vendors',
  },
  {
    label: 'Contenedores',
    hint: 'Logística y demurrage',
    icon: Ship,
    href: '/containers',
    endpoint: '/shipping/containers',
  },
  {
    label: 'Tasas de cambio',
    hint: 'USD · DOP · CNY',
    icon: Wallet,
    href: '/exchange-rates',
    endpoint: '/exchange-rates',
  },
]
