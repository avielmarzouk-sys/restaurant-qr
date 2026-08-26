'use client'

import { useState, useEffect } from 'react'

export default function StatsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const fetchStats = async () => {
    setLoadError('')
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      if (!res.ok) {
        setLoadError(typeof data?.error === 'string' ? data.error : `שגיאת שרת (${res.status})`)
        setLoading(false)
        return
      }
      setStats(data)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoadError('לא ניתן להתחבר לשרת. בדוק את הקונסול (F12) לפרטים.')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 15000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div dir="rtl" className="text-gray-400">טוען...</div>

  if (loadError) {
    return (
      <div dir="rtl" className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm text-center">
        {loadError}
      </div>
    )
  }

  const maxProductCount = stats?.topProducts?.[0]?.count || 1

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">סטטיסטיקות</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-gray-400 text-sm">מתעדכן אוטומטית</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-900 rounded-2xl p-6 border border-orange-500/30">
          <p className="text-gray-400 text-sm mb-1">הזמנות היום</p>
          <p className="text-4xl font-bold text-orange-500">{stats?.todayOrders || 0}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6 border border-green-500/30">
          <p className="text-gray-400 text-sm mb-1">הכנסות היום</p>
          <p className="text-4xl font-bold text-green-500">{stats?.todayRevenue || 0} ₪</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">הזמנה ממוצעת</p>
          <p className="text-4xl font-bold text-white">{stats?.avgOrder || 0} ₪</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">סה"כ הזמנות (מאז ההתחלה)</p>
          <p className="text-3xl font-bold text-white">{stats?.totalOrders || 0}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">סה"כ הכנסות (מאז ההתחלה)</p>
          <p className="text-3xl font-bold text-white">{stats?.totalRevenue || 0} ₪</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h3 className="font-bold text-lg mb-4">המנות הכי נמכרות</h3>
        {!stats?.topProducts || stats.topProducts.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-4xl mb-3">🍔</p>
            <p>עדיין אין מספיק הזמנות כדי להציג דירוג</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.topProducts.map((p: any, i: number) => (
              <div key={p.productName} className="flex items-center gap-4">
                <span className="text-gray-500 font-bold w-5 text-center">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{p.productName}</span>
                    <span className="text-orange-400 text-sm font-bold">{p.count}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${Math.max(6, (p.count / maxProductCount) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}