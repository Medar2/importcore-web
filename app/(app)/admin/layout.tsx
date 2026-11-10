import { AdminSubnav } from '@/features/admin/components/admin-subnav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminSubnav />
      {children}
    </>
  )
}
