import { Poppins } from 'next/font/google'
import { AppShell } from '@/features/navigation/components/app-shell'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={poppins.className}>
      <AppShell>{children}</AppShell>
    </div>
  )
}
