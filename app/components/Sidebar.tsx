'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from './Logo'

const restaurantMenuItems = [
  { href: '/dashboard', icon: '📊', label: 'לוח בקרה' },
  { href: '/dashboard/orders', icon: '🧾', label: 'הזמנות' },
  { href: '/dashboard/menu', icon: '🍔', label: 'תפריט' },
  { href: '/dashboard/tables', icon: '🪑', label: 'שולחנות' },
  { href: '/dashboard/stats', icon: '📈', label: 'סטטיסטיקות' },
  { href: '/dashboard/settings', icon: '🎨', label: 'עיצוב ומיתוג' },
]

const superAdminMenuItems = [
  { href: '/dashboard', icon: '🌐', label: 'סקירה כללית' },
  { href: '/dashboard/restaurants', icon: '🏢', label: 'מסעדות' },
]

export default function Sidebar({ role }: { role?: string }) {
  const pathname = usePathname()

  const items = role === 'SUPERADMIN' ? superAdminMenuItems : restaurantMenuItems

  return (
    <div className="w-64 min-h-screen bg-gray-900 border-l border-gray-800 p-4" dir="rtl">
      <div className="mb-8">
        <Logo size={32} textClassName="text-xl text-white" />
      </div>
      <nav className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              pathname === item.href
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}