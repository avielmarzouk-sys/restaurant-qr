import { getSession } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import RestaurantOverview from '../components/RestaurantOverview'
import SuperAdminOverview from '../components/SuperAdminOverview'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  if (session.role === 'SUPERADMIN') {
    return <SuperAdminOverview />
  }

  return <RestaurantOverview />
}