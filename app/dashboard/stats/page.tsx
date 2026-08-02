'use client'

import { useState, useEffect } from 'react'

export default function StatsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    const res = await fetch('/api/stats')
    const data = await res.json()
    setStats(data)
    setLoading(false)
  }

  useEffect(() => { fetchStats() }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400">טוען...</p>
    </div>
  )

  return (
    <div dir="rtl">
      <h2 className="text-2xl font-bold mb-6">סטטיסטיקות</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">סה"כ הזמנות</p>
          <p className="text-3xl font-bold text-white">{stats?.totalOrders || 0}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">הכנסות כולל</p>
          <p className="text-3xl font-bold text-orange-500">{stats?.totalRevenue || 0} ₪</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">הזמנות היום</p>
          <p className="text-3xl font-bold text-green-500">{stats?.todayOrders || 0}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">ממוצע להזמנה</p>
          <p className="text-3xl font-bold text-blue-400">{stats?.avgOrder || 0} ₪</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h3 className="font-bold mb-4">המנות הפופולריות</h3>
          {stats?.topProducts?.length > 0 ? (
            <div className="space-y-3">
              {stats.topProducts.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-orange-500 font-bold w-6">{i + 1}.</span>
                    <span className="text-sm">{p.productName}</span>
                  </div>
                  <span className="text-gray-400 text-sm">{p.count} הזמנות</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">אין נתונים עדיין</p>
          )}
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h3 className="font-bold mb-4">הזמנות אחרונות</h3>
          {stats?.recentOrders?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentOrders.map((o: any) => (
                <div key={o.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">הזמנה #{o.orderNumber}</p>
                    <p className="text-gray-400 text-xs">{o.table?.name}</p>
                  </div>
                  <span className="text-orange-400 font-bold">{o.totalAmount} ₪</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">אין הזמנות עדיין</p>
          )}
        </div>
      </div>
    </div>
  )
}