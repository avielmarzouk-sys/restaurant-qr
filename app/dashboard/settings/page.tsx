'use client'

import { useState, useEffect } from 'react'

const FONT_OPTIONS = [
  { value: 'SERIF', label: 'קלאסי (Serif)', sample: 'Aa', style: { fontFamily: 'Georgia, serif' } },
  { value: 'SANS', label: 'מודרני (Sans)', sample: 'Aa', style: { fontFamily: 'system-ui, sans-serif' } },
  { value: 'ROUNDED', label: 'ידידותי (Rounded)', sample: 'Aa', style: { fontFamily: 'ui-rounded, "Segoe UI Rounded", system-ui, sans-serif' } },
]

export default function SettingsPage() {
  const [form, setForm] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)

  const fetchRestaurant = async () => {
    setLoadError('')
    try {
      const res = await fetch('/api/restaurant')
      const data = await res.json()
      if (!res.ok) {
        setLoadError(typeof data?.error === 'string' ? data.error : `שגיאת שרת (${res.status})`)
        setLoading(false)
        return
      }
      setForm(data)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoadError('לא ניתן להתחבר לשרת. בדוק את הקונסול (F12) לפרטים.')
      setLoading(false)
    }
  }

  useEffect(() => { fetchRestaurant() }, [])

  const save = async () => {
    setSaving(true)
    setSaveError('')
    setSaved(false)
    const res = await fetch('/api/restaurant', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      setSaveError(data.error || 'שגיאה בשמירה')
      return
    }
    setForm(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <div dir="rtl" className="text-gray-400">טוען...</div>

  if (loadError) {
    return (
      <div dir="rtl" className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm text-center">
        {loadError}
      </div>
    )
  }

  if (!form) return null

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">עיצוב ומיתוג</h2>
      </div>

      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-6 max-w-2xl">
        <div>
          <label className="block text-gray-400 text-sm mb-2">שם המסעדה (מוצג ללקוחות)</label>
          <input
            type="text"
            value={form.name || ''}
            onChange={(e) => setForm((f: any) => ({ ...f, name: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded-xl px-4 py-2 outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">צבע ראשי</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.primaryColor || '#FF6B35'}
              onChange={(e) => setForm((f: any) => ({ ...f, primaryColor: e.target.value }))}
              className="bg-gray-800 rounded-xl h-12 w-20"
            />
            <span className="text-gray-500 text-sm">{form.primaryColor}</span>
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">מצב תצוגה</label>
          <div className="flex gap-3">
            <button
              onClick={() => setForm((f: any) => ({ ...f, theme: 'DARK' }))}
              className={`flex-1 rounded-xl p-4 border text-sm font-bold ${form.theme === 'DARK' ? 'border-orange-500' : 'border-gray-700'} bg-black text-white`}
            >
              🌙 כהה
            </button>
            <button
              onClick={() => setForm((f: any) => ({ ...f, theme: 'LIGHT' }))}
              className={`flex-1 rounded-xl p-4 border text-sm font-bold ${form.theme === 'LIGHT' ? 'border-orange-500' : 'border-gray-700'} bg-white text-gray-900`}
            >
              ☀️ בהיר
            </button>
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">פונט</label>
          <div className="grid grid-cols-3 gap-3">
            {FONT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setForm((f: any) => ({ ...f, fontStyle: opt.value }))}
                className={`rounded-xl p-4 border text-center ${form.fontStyle === opt.value ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700 bg-gray-800'}`}
              >
                <p className="text-2xl text-white mb-1" style={opt.style}>{opt.sample}</p>
                <p className="text-gray-400 text-xs">{opt.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">קישור ללוגו (אופציונלי)</label>
          <input
            type="text"
            placeholder="https://..."
            value={form.logo || ''}
            onChange={(e) => setForm((f: any) => ({ ...f, logo: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded-xl px-4 py-2 outline-none"
          />
          {form.logo && <img src={form.logo} alt="לוגו" className="w-14 h-14 rounded-xl object-cover mt-3 border border-gray-700" />}
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">קישור לתמונת רקע / באנר (אופציונלי)</label>
          <input
            type="text"
            placeholder="https://..."
            value={form.coverImage || ''}
            onChange={(e) => setForm((f: any) => ({ ...f, coverImage: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded-xl px-4 py-2 outline-none"
          />
          {form.coverImage && <img src={form.coverImage} alt="באנר" className="w-full h-32 rounded-xl object-cover mt-3 border border-gray-700" />}
        </div>

        {saveError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm text-center">
            {saveError}
          </div>
        )}
        {saved && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-green-400 text-sm text-center">
            ✓ נשמר בהצלחה
          </div>
        )}

        <button onClick={save} disabled={saving} className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50">
          {saving ? 'שומר...' : 'שמור שינויים'}
        </button>
      </div>
    </div>
  )
}