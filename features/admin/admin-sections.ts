import type { ElementType } from 'react'
import { KeyRound, ScrollText, Settings, ShieldCheck, Users } from 'lucide-react'
import { PERM } from '@/features/auth/utils/permissions'

export interface AdminSection {
  label: string
  hint: string
  icon: ElementType
  permission: string
  href: string
}

/** Módulos de administración nativos (importcore-api + PostgreSQL security). */
export const ADMIN_SECTIONS: AdminSection[] = [
  {
    label: 'Usuarios',
    hint: 'Cuentas, estado, roles y permisos directos',
    icon: Users,
    permission: PERM.USERS_VIEW,
    href: '/admin/users',
  },
  {
    label: 'Roles',
    hint: 'Roles del sistema y matriz de permisos',
    icon: ShieldCheck,
    permission: PERM.ROLES_VIEW,
    href: '/admin/roles',
  },
  {
    label: 'Permisos',
    hint: 'Catálogo de permisos de la aplicación',
    icon: KeyRound,
    permission: PERM.PERMISSIONS_VIEW,
    href: '/admin/permissions',
  },
  {
    label: 'Auditoría',
    hint: 'Bitácora de acciones y cambios de seguridad',
    icon: ScrollText,
    permission: PERM.AUDIT_VIEW,
    href: '/admin/audit',
  },
  {
    label: 'Configuración del sistema',
    hint: 'Empresa fiscal, correo SMTP, validaciones',
    icon: Settings,
    permission: PERM.SETTINGS_VIEW,
    href: '/admin/settings',
  },
]
