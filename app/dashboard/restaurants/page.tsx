'use client'

import { useState, useEffect } from 'react'
import { SUBSCRIPTION_PRICE } from '@/app/lib/subscription'

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loadError, setLoadError] = useState('')
  const [form, setForm] = useState({ name: '', ownerName: '', ownerEmail: '', ownerPassword: '', primaryColor: '#FF6B35' })
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchRestaurants = async () => {
    setLoadError('')
    try {
      const res = await fetch('/api/admin/restaurants')
      if (res.status === 403) {
        setForbidden(true)
        setLoading(false)
        return
      }
      const data = await res.json()
      if (!res.ok) {
        setLoadError(typeof data?.error === 'string' ? data.error : `Erreur serveur (${res.status})`)
        setLoading(false)
        return
      }
      setRestaurants(Array.isArray(data) ? data : [])
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoadError('Impossible de contacter le serveur. Regarde la console du navigateur (F12) pour le détail.')
      setLoading(false)
    }
  }

  useEffect(() => { fetchRestaurants() }, [])

  const createRestaurant = async () => {
    setError('')
    if (!form.name || !form.ownerEmail || !form.ownerPassword) {
      setError('Nom, email et mot de passe sont obligatoires')
      return
    }
    setSaving(true)
    const res = await fetch('/api/admin/restaurants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      setError(data.error || 'Erreur lors de la création')
      return
    }
    setForm({ name: '', ownerName: '', ownerEmail: '', ownerPassword: '', primaryColor: '#FF6B35' })
    setShowAdd(false)
    fetchRestaurants()
  }

  const deleteRestaurant = async (id: string) => {
    setDeletingId(id)
    const res = await fetch(`/api/admin/restaurants/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    setConfirmingId(null)
    if (res.ok) {
      fetchRestaurants()
    }
  }

  const toggleActive = async (id: string, currentActive: boolean) => {
    setTogglingId(id)
    const res = await fetch(`/api/admin/restaurants/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !currentActive }),
    })
    setTogglingId(null)
    if (res.ok) {
      fetchRestaurants()
    }
  }

  if (loading) return <div dir="rtl" className="text-gray-400">טוען...</div>

  if (forbidden) {
    return (
      <div dir="rtl" className="bg-gray-900 rounded-2xl p-12 border border-gray-800 text-center text-gray-500">
        <p className="text-4xl mb-3">🔒</p>
        <p>אין לך הרשאה לגשת לעמוד זה</p>
      </div>
    )
  }

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">ניהול מסעדות</h2>
        <button onClick={() => setShowAdd(true)} className="bg-orange-500 text-white px-4 py-2 rounded-xl">
          + מסעדה חדשה
        </button>
      </div>

      {loadError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm mb-6 text-center">
          {loadError}
        </div>
      )}

      {showAdd && (
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="שם המסעדה"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              className="bg-gray-800 text-white rounded-xl px-4 py-2 outline-none"
            />
            <input
              type="color"
              value={form.primaryColor}
              onChange={(e) => setForm(f => ({ ...f, primaryColor: e.target.value }))}
              className="bg-gray-800 rounded-xl h-10 w-full"
            />
            <input
              type="text"
              placeholder="שם בעל המסעדה"
              value={form.ownerName}
              onChange={(e) => setForm(f => ({ ...f, ownerName: e.target.value }))}
              className="bg-gray-800 text-white rounded-xl px-4 py-2 outline-none"
            />
            <input
              type="email"
              placeholder="אימייל להתחברות"
              value={form.ownerEmail}
              onChange={(e) => setForm(f => ({ ...f, ownerEmail: e.target.value }))}
              className="bg-gray-800 text-white rounded-xl px-4 py-2 outline-none"
            />
            <input
              type="password"
              placeholder="סיסמה זמנית"
              value={form.ownerPassword}
              onChange={(e) => setForm(f => ({ ...f, ownerPassword: e.target.value }))}
              className="bg-gray-800 text-white rounded-xl px-4 py-2 outline-none"
            />
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={createRestaurant} disabled={saving} className="bg-orange-500 text-white px-4 py-2 rounded-xl disabled:opacity-50">
              {saving ? 'שומר...' : 'צור מסעדה'}
            </button>
            <button onClick={() => { setShowAdd(false); setError('') }} className="bg-gray-700 text-white px-4 py-2 rounded-xl">
              ביטול
            </button>
          </div>
        </div>
      )}

      {restaurants.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl p-12 border border-gray-800 text-center text-gray-500">
          <p className="text-4xl mb-3">🏢</p>
          <p>אין מסעדות עדיין</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {restaurants.map((r: any) => (
            <div key={r.id} className={`bg-gray-900 rounded-2xl p-6 border ${r.isActive ? 'border-gray-800' : 'border-red-900/50'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">{r.name}</h3>
                <span className="w-5 h-5 rounded-full border border-gray-700" style={{ backgroundColor: r.primaryColor }}></span>
              </div>
              <p className="text-gray-500 text-sm mb-1">/{r.slug}</p>
              <p className="text-gray-500 text-xs">{r.users?.[0]?.user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <p className={`text-xs ${r.isActive ? 'text-green-500' : 'text-red-400'}`}>
                  {r.isActive ? '● פעיל' : '● מושהה'}
                </p>
                <span className="text-gray-600">•</span>
                <p className="text-xs text-gray-400">
                  מנוי: {r.isActive ? `${SUBSCRIPTION_PRICE}₪/חודש` : 'לא בתשלום'}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => toggleActive(r.id, r.isActive)}
                  disabled={togglingId === r.id}
                  className={`text-xs px-3 py-1.5 rounded-lg disabled:opacity-50 ${
                    r.isActive
                      ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                      : 'bg-green-600 text-white hover:bg-green-500'
                  }`}
                >
                  {togglingId === r.id ? '...' : r.isActive ? '⏸ השהה מנוי' : '▶ הפעל מחדש'}
                </button>

                {confirmingId === r.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 text-xs">למחוק לצמיתות?</span>
                    <button
                      onClick={() => deleteRestaurant(r.id)}
                      disabled={deletingId === r.id}
                      className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-50"
                    >
                      {deletingId === r.id ? '...' : 'כן, מחק'}
                    </button>
                    <button
                      onClick={() => setConfirmingId(null)}
                      className="bg-gray-700 text-white text-xs px-3 py-1.5 rounded-lg"
                    >
                      ביטול
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmingId(r.id)}
                    className="text-red-400 text-xs hover:text-red-300 transition-all"
                  >
                    🗑 מחק
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}