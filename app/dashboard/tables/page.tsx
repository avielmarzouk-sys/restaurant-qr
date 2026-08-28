'use client'

import { useState, useEffect } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

export default function TablesPage() {
  const [tables, setTables] = useState<any[]>([])
  const [restaurantSlug, setRestaurantSlug] = useState('')
  const [newTableName, setNewTableName] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedQR, setSelectedQR] = useState<any>(null)
  const [loadError, setLoadError] = useState('')
  const [addError, setAddError] = useState('')

  const fetchTables = async () => {
    setLoadError('')
    try {
      const res = await fetch('/api/tables')
      const data = await res.json()
      if (!res.ok) {
        setLoadError(typeof data?.error === 'string' ? data.error : `שגיאת שרת (${res.status})`)
        setTables([])
        return
      }
      // Le serveur peut renvoyer soit un tableau simple [...], soit un objet { tables: [...], restaurantSlug }
      const list = Array.isArray(data) ? data : Array.isArray(data?.tables) ? data.tables : []
      setTables(list)
      if (typeof data?.restaurantSlug === 'string' && data.restaurantSlug) {
        setRestaurantSlug(data.restaurantSlug)
      }
    } catch (err) {
      console.error(err)
      setLoadError('לא ניתן להתחבר לשרת. בדוק את הקונסול (F12) לפרטים.')
    }
  }

  const fetchRestaurant = async () => {
    const res = await fetch('/api/restaurant')
    if (!res.ok) return
    const data = await res.json()
    if (data?.slug) setRestaurantSlug(data.slug)
  }

  useEffect(() => { fetchTables(); fetchRestaurant() }, [])

  const addTable = async () => {
    setAddError('')
    if (!newTableName.trim()) {
      setAddError('יש להזין שם לשולחן')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTableName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAddError(typeof data?.error === 'string' ? data.error : `שגיאת שרת (${res.status})`)
        setLoading(false)
        return
      }
      setNewTableName('')
      setShowAdd(false)
      await fetchTables()
    } catch (err) {
      console.error(err)
      setAddError('לא ניתן להתחבר לשרת. בדוק את הקונסול (F12) לפרטים.')
    } finally {
      setLoading(false)
    }
  }

  const deleteTable = async (id: string) => {
    if (!confirm('למחוק?')) return
    const res = await fetch(`/api/tables/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(typeof data?.error === 'string' ? data.error : `שגיאה במחיקה (${res.status})`)
      return
    }
    fetchTables()
  }

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">ניהול שולחנות</h2>
        <button onClick={() => { setShowAdd(true); setAddError('') }} className="bg-orange-500 text-white px-4 py-2 rounded-xl">
          + שולחן חדש
        </button>
      </div>

      {loadError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm mb-6 text-center">
          {loadError}
        </div>
      )}

      {showAdd && (
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              placeholder="שם השולחן"
              className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-2 outline-none"
            />
            <button onClick={addTable} disabled={loading} className="bg-orange-500 text-white px-4 py-2 rounded-xl disabled:opacity-50">
              {loading ? 'שומר...' : 'שמור'}
            </button>
            <button onClick={() => { setShowAdd(false); setAddError('') }} className="bg-gray-700 text-white px-4 py-2 rounded-xl">
              ביטול
            </button>
          </div>
          {addError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm text-center mt-3">
              {addError}
            </div>
          )}
        </div>
      )}

      {selectedQR && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setSelectedQR(null)}>
          <div className="bg-white rounded-2xl p-8 text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-gray-800 font-bold text-xl mb-6">{selectedQR.name}</h3>
            <div className="flex justify-center mb-4">
              <QRCodeCanvas value={selectedQR.url} size={250} />
            </div>
            <p className="text-gray-500 text-xs mb-6 break-all">{selectedQR.url}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => window.print()} className="bg-orange-500 text-white px-6 py-2 rounded-xl">
                הדפס
              </button>
              <button onClick={() => setSelectedQR(null)} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl">
                סגור
              </button>
            </div>
          </div>
        </div>
      )}

      {tables.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl p-12 border border-gray-800 text-center text-gray-500">
          <p className="text-4xl mb-3">🪑</p>
          <p>אין שולחנות עדיין</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tables.map((table: any) => (
            <div key={table.id} className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{table.name}</h3>
                <button onClick={() => deleteTable(table.id)} className="text-red-400">🗑️</button>
              </div>
              <button
                onClick={() => setSelectedQR({
                  name: table.name,
                  url: `${window.location.origin}/menu/${restaurantSlug}/${table.id}`
                })}
                className="w-full bg-gray-800 text-white py-2 rounded-xl text-sm"
              >
                📱 QR Code
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}