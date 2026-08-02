import { getSession } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import Sidebar from '../components/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-row-reverse">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">
              {session.name as string}
            </span>
            <a href="/api/logout" className="text-sm text-gray-400 px-3 py-1">
              Logout
            </a>
          </div>
        </div>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}