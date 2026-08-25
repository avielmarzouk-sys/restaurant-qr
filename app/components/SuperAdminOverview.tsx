'use client'

import { useState, useEffect } from 'react'

export default function SuperAdminOverview() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div dir="rtl" className="text-gray-400">טוען...</div>

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">סקירה כללית</h2>
          <p className="text-gray-500 text-sm mt-1">ניהול הפלטפורמה — כל המסעדות</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <span className="text-gray-400 text-sm">מתעדכן אוטומטית</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 rounded-2xl p-6 border border-blue-500/30">
          <p className="text-gray-400 text-sm mb-1">מסעדות רשומות</p>
          <p className="text-4xl font-bold text-blue-400">{stats?.totalRestaurants ?? 0}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6 border border-green-500/30">
          <p className="text-gray-400 text-sm mb-1">מסעדות פעילות</p>
          <p className="text-4xl font-bold text-green-500">{stats?.activeRestaurants ?? 0}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6 border border-orange-500/30">
          <p className="text-gray-400 text-sm mb-1">הכנסות ממנויים / חודש</p>
          <p className="text-4xl font-bold text-orange-400">{stats?.subscriptionRevenue ?? 0} ₪</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h3 className="font-bold text-lg mb-4">מסעדות שנוספו לאחרונה</h3>
        {(!stats?.recentRestaurants || stats.recentRestaurants.length === 0) ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-4xl mb-3">🏢</p>
            <p>אין מסעדות עדיין</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentRestaurants.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full border border-gray-700" style={{ backgroundColor: r.primaryColor }}></span>
                  <span className="font-bold">{r.name}</span>
                  <span className="text-gray-500 text-sm">/{r.slug}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg ${r.isActive ? 'text-green-400' : 'text-red-400'}`}>
                  {r.isActive ? '● פעיל' : '● לא פעיל'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}