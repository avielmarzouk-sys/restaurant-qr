'use client'

import { useState, useEffect, useRef } from 'react'

const STATUS_LABELS: any = {
  NEW: { label: 'חדשה', color: 'bg-orange-500' },
  ACCEPTED: { label: 'התקבלה', color: 'bg-blue-500' },
  PREPARING: { label: 'בהכנה', color: 'bg-yellow-500' },
  READY: { label: 'מוכנה', color: 'bg-green-500' },
  DONE: { label: 'הושלמה', color: 'bg-green-600' },
  CANCELLED: { label: 'בוטלה', color: 'bg-red-500' },
}

const STATUS_ORDER = ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'DONE']

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [waiterCalls, setWaiterCalls] = useState<any[]>([])
  const prevNewOrders = useRef(0)
  const prevWaiterCalls = useRef(0)
  const audioContext = useRef<AudioContext | null>(null)

  // Le navigateur bloque le son tant que l'utilisateur n'a pas interagi avec la page.
  // Ce bloc "débloque" le son dès le premier clic/touche sur la page, pour que
  // la sonnerie fonctionne automatiquement sans qu'il faille cliquer sur le bouton.
  useEffect(() => {
    const unlockAudio = () => {
      try {
        if (!audioContext.current) {
          audioContext.current = new AudioContext()
        }
        if (audioContext.current.state === 'suspended') {
          audioContext.current.resume()
        }
      } catch (e) {}
    }
    window.addEventListener('click', unlockAudio, { once: true })
    window.addEventListener('keydown', unlockAudio, { once: true })
    window.addEventListener('touchstart', unlockAudio, { once: true })
    return () => {
      window.removeEventListener('click', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
      window.removeEventListener('touchstart', unlockAudio)
    }
  }, [])

  const playSound = () => {
    if (!soundEnabled) return
    try {
      const ctx = audioContext.current || new AudioContext()
      audioContext.current = ctx
      if (ctx.state === 'suspended') {
        ctx.resume()
      }
      const notes = [523, 659, 784]
      notes.forEach((freq, i) => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()
        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15)
        gainNode.gain.setValueAtTime(0, ctx.currentTime + i * 0.15)
        gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + i * 0.15 + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3)
        oscillator.start(ctx.currentTime + i * 0.15)
        oscillator.stop(ctx.currentTime + i * 0.15 + 0.3)
      })
    } catch (e) {}
  }

  const fetchOrders = async () => {
    const res = await fetch('/api/orders')
    const data = await res.json()
    const allOrders = Array.isArray(data) ? data : []
    const doneOrders = allOrders.filter((o: any) => o.status === 'DONE' || o.status === 'CANCELLED')
    if (doneOrders.length >= 10) {
      await fetch('/api/orders', { method: 'DELETE' })
      const res2 = await fetch('/api/orders')
      const data2 = await res2.json()
      setOrders(Array.isArray(data2) ? data2 : [])
    } else {
      setOrders(allOrders)
    }
    setLoading(false)
  }

  const fetchWaiterCalls = async () => {
    try {
      const res = await fetch('/api/waiter-call')
      const data = await res.json()
      setWaiterCalls(Array.isArray(data) ? data : [])
    } catch (e) {}
  }

  const markWaiterCallDone = async (id: string) => {
    await fetch(`/api/waiter-call/${id}`, { method: 'PATCH' })
    fetchWaiterCalls()
  }

  const clearOldOrders = async () => {
    if (!confirm('למחוק את כל ההזמנות שהושלמו ובוטלו?')) return
    await fetch('/api/orders', { method: 'DELETE' })
    fetchOrders()
  }

  const deleteOrder = async (id: string) => {
    if (!confirm('למחוק הזמנה זו לצמיתות?')) return
    await fetch(`/api/orders/${id}/delete`, { method: 'DELETE' })
    setSelectedOrder(null)
    fetchOrders()
  }

  useEffect(() => {
    fetchOrders()
    fetchWaiterCalls()
    const interval = setInterval(fetchOrders, 5000)
    const waiterInterval = setInterval(fetchWaiterCalls, 5000)
    return () => {
      clearInterval(interval)
      clearInterval(waiterInterval)
    }
  }, [])

  useEffect(() => {
    const newCount = orders.filter(o => o.status === 'NEW').length
    if (newCount > prevNewOrders.current) {
      playSound()
    }
    prevNewOrders.current = newCount
  }, [orders, soundEnabled])

  useEffect(() => {
    if (waiterCalls.length > prevWaiterCalls.current) {
      playSound()
    }
    prevWaiterCalls.current = waiterCalls.length
  }, [waiterCalls, soundEnabled])

  const updateStatus = async (orderId: string, status: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchOrders()
  }

  const getNextStatus = (current: string) => {
    const idx = STATUS_ORDER.indexOf(current)
    return idx < STATUS_ORDER.length - 1 ? STATUS_ORDER[idx + 1] : null
  }

  const doneOrders = orders.filter(o => o.status === 'DONE' || o.status === 'CANCELLED')

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400">טוען...</p>
    </div>
  )

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">הזמנות</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={clearOldOrders}
            className="bg-red-500/20 text-red-400 px-3 py-1 rounded-xl text-sm"
          >
            🗑️ נקה הזמנות ישנות
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1 rounded-xl text-sm ${soundEnabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-400'}`}
          >
            {soundEnabled ? '🔔 צליל פעיל' : '🔕 צליל כבוי'}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-gray-400 text-sm">מתעדכן אוטומטית</span>
          </div>
        </div>
      </div>

      {waiterCalls.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500 rounded-2xl p-4 mb-6">
          <h3 className="font-bold mb-3 text-orange-400 flex items-center gap-2">
            <span>🛎️</span>
            <span>קריאות למלצר ({waiterCalls.length})</span>
          </h3>
          <div className="space-y-2">
            {waiterCalls.map((call) => (
              <div key={call.id} className="flex items-center justify-between bg-gray-900 rounded-xl px-4 py-3 border border-orange-500/30">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-orange-400">{call.table?.name}</span>
                  <span className="text-gray-500 text-sm">
                    {new Date(call.createdAt).toLocaleTimeString('he-IL')}
                  </span>
                </div>
                <button
                  onClick={() => markWaiterCallDone(call.id)}
                  className="bg-orange-500 text-white px-3 py-1 rounded-lg text-sm font-bold"
                >
                  טופל
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {['NEW', 'ACCEPTED', 'PREPARING', 'READY'].map((status) => (
          <div key={status} className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-3 h-3 rounded-full ${STATUS_LABELS[status].color}`}></div>
              <h3 className="font-bold text-sm">{STATUS_LABELS[status].label}</h3>
              <span className="text-gray-500 text-xs">
                ({orders.filter(o => o.status === status).length})
              </span>
            </div>
            <div className="space-y-3">
              {orders.filter(o => o.status === status).map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-gray-800 rounded-xl p-3 cursor-pointer hover:border hover:border-orange-500 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-orange-400">#{order.orderNumber}</span>
                    <span className="text-xs text-gray-400">{order.table?.name}</span>
                  </div>
                  <div className="space-y-1">
                    {order.items?.slice(0, 2).map((item: any) => (
                      <p key={item.id} className="text-xs text-gray-400">
                        {item.quantity}x {item.productName}
                      </p>
                    ))}
                    {order.items?.length > 2 && (
                      <p className="text-xs text-gray-500">+{order.items.length - 2} עוד</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-orange-400 font-bold text-sm">{order.totalAmount} ₪</span>
                    {getNextStatus(order.status) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          updateStatus(order.id, getNextStatus(order.status)!)
                        }}
                        className="text-xs bg-orange-500 text-white px-2 py-1 rounded-lg"
                      >
                        הבא
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {doneOrders.length > 0 && (
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 mb-6">
          <h3 className="font-bold mb-4 text-gray-400">
            הזמנות שהושלמו ({doneOrders.length}/10)
          </h3>
          <div className="space-y-2">
            {doneOrders.slice(0, 10).map((order) => (
              <div key={order.id} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-400">#{order.orderNumber}</span>
                  <span className="text-gray-500 text-sm">{order.table?.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-lg ${STATUS_LABELS[order.status].color} text-white`}>
                    {STATUS_LABELS[order.status].label}
                  </span>
                  <span className="text-gray-400 text-sm">{order.totalAmount} ₪</span>
                  <button
                    onClick={() => deleteOrder(order.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 && (
        <div className="bg-gray-900 rounded-2xl p-12 border border-gray-800 text-center text-gray-500">
          <p className="text-4xl mb-3">🧾</p>
          <p>אין הזמנות עדיין</p>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-800" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl">הזמנה #{selectedOrder.orderNumber}</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-500 text-2xl">×</button>
            </div>
            <div className="space-y-1 mb-4">
              <p className="text-gray-400 text-sm">שולחן: {selectedOrder.table?.name}</p>
              <p className="text-gray-400 text-sm">שעה: {new Date(selectedOrder.createdAt).toLocaleTimeString('he-IL')}</p>
            </div>
            <div className="space-y-3 mb-4">
              {selectedOrder.items?.map((item: any) => (
                <div key={item.id} className="bg-gray-800 rounded-xl p-3">
                  <div className="flex justify-between">
                    <span className="font-bold">{item.quantity}x {item.productName}</span>
                    <span className="text-orange-400">{item.subtotal} ₪</span>
                  </div>
                  {item.selectedOptions && (
                    <div className="mt-1">
                      {item.selectedOptions.removed?.length > 0 && (
                        <p className="text-red-400 text-xs">ללא: {item.selectedOptions.removed.join(', ')}</p>
                      )}
                      {item.selectedOptions.added?.length > 0 && (
                        <p className="text-green-400 text-xs">תוספות: {item.selectedOptions.added.join(', ')}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {selectedOrder.customerNote && (
              <div className="bg-gray-800 rounded-xl p-3 mb-4">
                <p className="text-gray-400 text-sm">הערה: {selectedOrder.customerNote}</p>
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold">סה"כ</span>
              <span className="text-orange-400 font-bold text-xl">{selectedOrder.totalAmount} ₪</span>
            </div>
            <div className="flex gap-2">
              {getNextStatus(selectedOrder.status) && (
                <button
                  onClick={() => {
                    updateStatus(selectedOrder.id, getNextStatus(selectedOrder.status)!)
                    setSelectedOrder(null)
                  }}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-bold"
                >
                  {STATUS_LABELS[getNextStatus(selectedOrder.status)!]?.label}
                </button>
              )}
              <button
                onClick={() => {
                  updateStatus(selectedOrder.id, 'CANCELLED')
                  setSelectedOrder(null)
                }}
                className="bg-red-500/20 text-red-400 px-4 py-3 rounded-xl"
              >
                בטל
              </button>
              <button
                onClick={() => deleteOrder(selectedOrder.id)}
                className="bg-gray-700 text-gray-400 px-4 py-3 rounded-xl"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}