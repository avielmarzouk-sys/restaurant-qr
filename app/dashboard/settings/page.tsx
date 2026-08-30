'use client'

import { useState, useEffect } from 'react'

const FONT_OPTIONS = [
  { value: 'SERIF', label: 'קלאסי (Serif)', sample: 'Aa', style: { fontFamily: 'Georgia, serif' } },
  { value: 'SANS', label: 'מודרני (Sans)', sample: 'Aa', style: { fontFamily: 'system-ui, sans-serif' } },
  { value: 'ROUNDED', label: 'ידידותי (Rounded)', sample: 'Aa', style: { fontFamily: 'ui-rounded, "Segoe UI Rounded", system-ui, sans-serif' } },
  { value: 'ELEGANT', label: 'אלגנטי', sample: 'Aa', style: { fontFamily: 'Didot, "Bodoni MT", Georgia, serif' } },
  { value: 'BOLD', label: 'נועז', sample: 'Aa', style: { fontFamily: '"Arial Black", Impact, sans-serif' } },
]

const LAYOUT_OPTIONS = [
  { value: 'COMPACT', label: 'קומפקטי', desc: 'רשימה, תמונה קטנה בצד' },
  { value: 'GRID', label: 'רשת', desc: 'רשת עם תמונות גדולות' },
  { value: 'MAGAZINE', label: 'מגזין', desc: 'תמונה רחבה לכל מנה' },
  { value: 'MINIMAL', label: 'מינימלי', desc: 'רשימה עדינה ללא מסגרות' },
]

const CORNER_OPTIONS = [
  { value: 'ROUNDED', label: 'עגול', radius: '12px' },
  { value: 'SHARP', label: 'חד', radius: '0px' },
]

const SECTION_TOGGLES = [
  { key: 'showWaiterCall', label: '🛎️ קריאה למלצר', desc: 'כפתור קריאת מלצר בראש התפריט' },
  { key: 'showSearch', label: '🔍 חיפוש ומיון', desc: 'שורת חיפוש ומיון לפי מחיר' },
  { key: 'showFeatured', label: '⭐ מומלצים', desc: 'רצועת "מומלצים על ידינו"' },
  { key: 'showWaitTime', label: '⏱️ זמן המתנה', desc: 'תג זמן המתנה משוער' },
]

const getThemeDefaults = (theme: string) =>
  theme === 'LIGHT'
    ? { bgColor: '#ffffff', textColor: '#18181b', cardBgColor: '#f9fafb', cardBorderColor: '#e5e7eb', buttonTextColor: '#000000' }
    : { bgColor: '#09090b', textColor: '#ffffff', cardBgColor: '#18181b', cardBorderColor: '#27272a', buttonTextColor: '#000000' }

const COLOR_FIELDS = [
  { key: 'bgColor', label: 'רקע הדף' },
  { key: 'textColor', label: 'טקסט ראשי' },
  { key: 'cardBgColor', label: 'רקע הכרטיסים (המנות)' },
  { key: 'cardBorderColor', label: 'מסגרת הכרטיסים (המנות)' },
  { key: 'buttonTextColor', label: 'טקסט על כפתורים' },
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

  const themeDefaults = getThemeDefaults(form.theme || 'DARK')

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
          <label className="block text-gray-400 text-sm mb-2">משפט תיאור קצר (אופציונלי)</label>
          <input
            type="text"
            placeholder='למשל: "מטבח ים תיכוני אותנטי מאז 1998"'
            value={form.tagline || ''}
            onChange={(e) => setForm((f: any) => ({ ...f, tagline: e.target.value }))}
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

        <div className="pt-4 border-t border-gray-800">
          <p className="text-gray-300 font-bold text-sm mb-1">🎨 צבעים מתקדמים</p>
          <p className="text-gray-500 text-xs mb-4">שליטה מלאה על צבעי הדף. ריק = הצבע הרגיל של מצב התצוגה (כהה/בהיר) שנבחר למעלה.</p>
          <div className="space-y-3">
            {COLOR_FIELDS.map((field) => (
              <div key={field.key} className="flex items-center justify-between gap-3">
                <span className="text-gray-300 text-sm">{field.label}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form[field.key] || (themeDefaults as any)[field.key]}
                    onChange={(e) => setForm((f: any) => ({ ...f, [field.key]: e.target.value }))}
                    className="bg-gray-800 rounded-lg h-9 w-14"
                  />
                  {form[field.key] && (
                    <button
                      onClick={() => setForm((f: any) => ({ ...f, [field.key]: null }))}
                      className="text-gray-500 hover:text-gray-300 text-xs underline"
                    >
                      איפוס
                    </button>
                  )}
                </div>
              </div>
            ))}
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
          <label className="block text-gray-400 text-sm mb-2">מבנה תצוגת המנות</label>
          <div className="grid grid-cols-2 gap-3">
            {LAYOUT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setForm((f: any) => ({ ...f, layoutStyle: opt.value }))}
                className={`rounded-xl p-4 border text-center ${(form.layoutStyle || 'COMPACT') === opt.value ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700 bg-gray-800'}`}
              >
                {opt.value === 'COMPACT' && (
                  <div className="flex flex-col gap-1 mb-2">
                    <div className="h-4 bg-gray-600 rounded flex items-center px-1"><div className="w-2 h-2 bg-gray-400 rounded-sm mr-auto"></div></div>
                    <div className="h-4 bg-gray-600 rounded flex items-center px-1"><div className="w-2 h-2 bg-gray-400 rounded-sm mr-auto"></div></div>
                  </div>
                )}
                {opt.value === 'GRID' && (
                  <div className="grid grid-cols-2 gap-1 mb-2">
                    <div className="h-8 bg-gray-600 rounded"></div>
                    <div className="h-8 bg-gray-600 rounded"></div>
                  </div>
                )}
                {opt.value === 'MAGAZINE' && (
                  <div className="flex flex-col gap-1 mb-2">
                    <div className="h-9 bg-gray-600 rounded"></div>
                  </div>
                )}
                {opt.value === 'MINIMAL' && (
                  <div className="flex flex-col gap-1 mb-2">
                    <div className="h-1.5 bg-gray-600 rounded w-3/4"></div>
                    <div className="h-1.5 bg-gray-600 rounded w-1/2"></div>
                    <div className="h-1.5 bg-gray-600 rounded w-2/3"></div>
                  </div>
                )}
                <p className="text-gray-300 text-xs font-bold">{opt.label}</p>
                <p className="text-gray-500 text-[10px]">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">סגנון פינות</label>
          <div className="flex gap-3">
            {CORNER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setForm((f: any) => ({ ...f, cornerStyle: opt.value }))}
                className={`flex-1 rounded-xl p-4 border flex items-center justify-center gap-3 ${(form.cornerStyle || 'ROUNDED') === opt.value ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700 bg-gray-800'}`}
              >
                <div className="w-8 h-8 bg-gray-500" style={{ borderRadius: opt.radius }}></div>
                <span className="text-gray-300 text-sm font-bold">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-800">
          <p className="text-gray-300 font-bold text-sm mb-1">👁️ מקטעים בתפריט הלקוח</p>
          <p className="text-gray-500 text-xs mb-4">בחר אילו מקטעים יופיעו בעמוד ההזמנה של הלקוחות.</p>
          <div className="grid grid-cols-2 gap-3">
            {SECTION_TOGGLES.map((s) => {
              const active = form[s.key] !== false
              return (
                <button
                  key={s.key}
                  onClick={() => setForm((f: any) => ({ ...f, [s.key]: !active }))}
                  className={`rounded-xl p-3 border text-right ${active ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700 bg-gray-800 opacity-60'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-200">{s.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-orange-500 text-black' : 'bg-gray-700 text-gray-400'}`}>
                      {active ? 'פעיל' : 'כבוי'}
                    </span>
                  </div>
                  <p className="text-gray-500 text-[11px]">{s.desc}</p>
                </button>
              )
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-800">
          <p className="text-gray-300 font-bold text-sm mb-1">💬 הודעת ברוכים הבאים (אופציונלי)</p>
          <p className="text-gray-500 text-xs mb-4">מוצגת ללקוח מתחת לשם המסעדה. השאר ריק כדי לא להציג הודעה.</p>
          <div className="space-y-3">
            <div>
              <label className="block text-gray-500 text-xs mb-1">עברית</label>
              <input
                type="text"
                value={form.welcomeMessageHe || ''}
                onChange={(e) => setForm((f: any) => ({ ...f, welcomeMessageHe: e.target.value }))}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-2 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-500 text-xs mb-1">English</label>
              <input
                type="text"
                value={form.welcomeMessageEn || ''}
                onChange={(e) => setForm((f: any) => ({ ...f, welcomeMessageEn: e.target.value }))}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-2 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-500 text-xs mb-1">Français</label>
              <input
                type="text"
                value={form.welcomeMessageFr || ''}
                onChange={(e) => setForm((f: any) => ({ ...f, welcomeMessageFr: e.target.value }))}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-2 outline-none text-sm"
              />
            </div>
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

        <div className="pt-4 border-t border-gray-800">
          <p className="text-gray-300 font-bold text-sm mb-4">רשתות חברתיות ושעות פתיחה</p>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">קישור לאינסטגרם (אופציונלי)</label>
              <input
                type="text"
                placeholder="https://instagram.com/..."
                value={form.instagramUrl || ''}
                onChange={(e) => setForm((f: any) => ({ ...f, instagramUrl: e.target.value }))}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-2 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">קישור לפייסבוק (אופציונלי)</label>
              <input
                type="text"
                placeholder="https://facebook.com/..."
                value={form.facebookUrl || ''}
                onChange={(e) => setForm((f: any) => ({ ...f, facebookUrl: e.target.value }))}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-2 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">שעות פתיחה (אופציונלי)</label>
              <input
                type="text"
                placeholder='למשל: "א׳-ה׳ 12:00-23:00, ו׳ 12:00-15:00"'
                value={form.openingHours || ''}
                onChange={(e) => setForm((f: any) => ({ ...f, openingHours: e.target.value }))}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-2 outline-none"
              />
            </div>
          </div>
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