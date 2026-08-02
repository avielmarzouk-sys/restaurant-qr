'use client'

import { useState, useEffect } from 'react'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])

  const fetchData = async () => {
    const [statsRes, ordersRes] = await Promise.all([
      fetch('/api/stats'),
      fetch('/api/orders'),
    ])
    const statsData = await statsRes.json()
    const ordersData = await ordersRes.json()
    setStats(statsData)
    setOrders(Array.isArray(ordersData) ? ordersData : [])
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const newOrders = orders.filter(o => o.status === 'NEW').length
  const preparingOrders = orders.filter(o => o.status === 'PREPARING' || o.status === 'ACCEPTED').length
  const readyOrders = orders.filter(o => o.status === 'READY').length

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">לוח בקרה</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-gray-400 text-sm">מתעדכן אוטומטית</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 rounded-2xl p-6 border border-orange-500/30">
          <p className="text-gray-400 text-sm mb-1">הזמנות חדשות</p>
          <p className="text-4xl font-bold text-orange-500">{newOrders}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6 border border-yellow-500/30">
          <p className="text-gray-400 text-sm mb-1">בהכנה</p>
          <p className="text-4xl font-bold text-yellow-500">{preparingOrders}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6 border border-green-500/30">
          <p className="text-gray-400 text-sm mb-1">מוכנות</p>
          <p className="text-4xl font-bold text-green-500">{readyOrders}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">הכנסות היום</p>
          <p className="text-4xl font-bold text-white">{stats?.todayRevenue || 0} ₪</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h3 className="font-bold text-lg mb-4">הזמנות אחרונות</h3>
        {orders.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-4xl mb-3">🍽️</p>
            <p>אין הזמנות עדיין</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-orange-400">#{order.orderNumber}</span>
                  <span className="text-gray-400 text-sm">{order.table?.name}</span>
                  <span className="text-gray-500 text-sm">
                    {order.items?.length} מנות
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-lg text-white ${
                    order.status === 'NEW' ? 'bg-orange-500' :
                    order.status === 'ACCEPTED' ? 'bg-blue-500' :
                    order.status === 'PREPARING' ? 'bg-yellow-500' :
                    order.status === 'READY' ? 'bg-green-500' :
                    'bg-gray-500'
                  }`}>
                    {order.status === 'NEW' ? 'חדשה' :
                     order.status === 'ACCEPTED' ? 'התקבלה' :
                     order.status === 'PREPARING' ? 'בהכנה' :
                     order.status === 'READY' ? 'מוכנה' :
                     order.status === 'DONE' ? 'הושלמה' : 'בוטלה'}
                  </span>
                  <span className="text-orange-400 font-bold">{order.totalAmount} ₪</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}