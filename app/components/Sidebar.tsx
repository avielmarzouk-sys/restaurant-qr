'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { href: '/dashboard', icon: '📊', label: 'לוח בקרה' },
  { href: '/dashboard/orders', icon: '🧾', label: 'הזמנות' },
  { href: '/dashboard/menu', icon: '🍔', label: 'תפריט' },
  { href: '/dashboard/tables', icon: '🪑', label: 'שולחנות' },
  { href: '/dashboard/stats', icon: '📈', label: 'סטטיסטיקות' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 min-h-screen bg-gray-900 border-l border-gray-800 p-4" dir="rtl">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-orange-500">🍽️ MenuQR</h1>
      </div>
      <nav className="space-y-1">
        {menuItems.map((item) => (
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