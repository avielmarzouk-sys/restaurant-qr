'use client'

import { useState, useEffect } from 'react'

type Product = {
  id: string
  categoryId: string
  nameHe: string
  nameEn?: string | null
  nameFr?: string | null
  descHe?: string | null
  price: number
  image?: string | null
  isAvailable: boolean
  position: number
}

type Category = {
  id: string
  nameHe: string
  nameEn?: string | null
  nameFr?: string | null
  isActive: boolean
  position: number
  products: Product[]
}

const emptyProductForm = {
  categoryId: '',
  nameHe: '',
  nameEn: '',
  nameFr: '',
  descHe: '',
  price: '',
  image: '',
}

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [showAddCategory, setShowAddCategory] = useState(false)
  const [categoryForm, setCategoryForm] = useState({ nameHe: '', nameEn: '', nameFr: '' })
  const [savingCategory, setSavingCategory] = useState(false)
  const [categoryError, setCategoryError] = useState('')
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)
  const [confirmingCategoryId, setConfirmingCategoryId] = useState<string | null>(null)

  const [showProductForm, setShowProductForm] = useState(false)
  const [productForm, setProductForm] = useState<any>(emptyProductForm)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [savingProduct, setSavingProduct] = useState(false)
  const [productError, setProductError] = useState('')
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)
  const [confirmingProductId, setConfirmingProductId] = useState<string | null>(null)
  const [togglingProductId, setTogglingProductId] = useState<string | null>(null)

  const fetchCategories = async () => {
    setLoadError('')
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (!res.ok) {
        setLoadError(typeof data?.error === 'string' ? data.error : `שגיאת שרת (${res.status})`)
        setLoading(false)
        return
      }
      setCategories(Array.isArray(data) ? data : [])
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoadError('לא ניתן להתחבר לשרת. בדוק את הקונסול (F12) לפרטים.')
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const createCategory = async () => {
    setCategoryError('')
    if (!categoryForm.nameHe.trim()) {
      setCategoryError('שם הקטגוריה בעברית חובה')
      return
    }
    setSavingCategory(true)
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryForm),
    })
    const data = await res.json()
    setSavingCategory(false)
    if (!res.ok) {
      setCategoryError(data.error || 'שגיאה ביצירת הקטגוריה')
      return
    }
    setCategoryForm({ nameHe: '', nameEn: '', nameFr: '' })
    setShowAddCategory(false)
    fetchCategories()
  }

  const deleteCategory = async (id: string) => {
    setDeletingCategoryId(id)
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    setDeletingCategoryId(null)
    setConfirmingCategoryId(null)
    if (res.ok) fetchCategories()
  }

  const openAddProduct = (categoryId: string) => {
    setEditingProductId(null)
    setProductForm({ ...emptyProductForm, categoryId })
    setProductError('')
    setShowProductForm(true)
  }

  const openEditProduct = (product: Product) => {
    setEditingProductId(product.id)
    setProductForm({
      categoryId: product.categoryId,
      nameHe: product.nameHe,
      nameEn: product.nameEn || '',
      nameFr: product.nameFr || '',
      descHe: product.descHe || '',
      price: String(product.price),
      image: product.image || '',
    })
    setProductError('')
    setShowProductForm(true)
  }

  const saveProduct = async () => {
    setProductError('')
    if (!productForm.nameHe.trim() || !productForm.price) {
      setProductError('שם בעברית ומחיר הם שדות חובה')
      return
    }
    setSavingProduct(true)
    const url = editingProductId ? `/api/products/${editingProductId}` : '/api/products'
    const method = editingProductId ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productForm),
    })
    const data = await res.json()
    setSavingProduct(false)
    if (!res.ok) {
      setProductError(data.error || 'שגיאה בשמירת המנה')
      return
    }
    setShowProductForm(false)
    setEditingProductId(null)
    setProductForm(emptyProductForm)
    fetchCategories()
  }

  const deleteProduct = async (id: string) => {
    setDeletingProductId(id)
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    setDeletingProductId(null)
    setConfirmingProductId(null)
    if (res.ok) fetchCategories()
  }

  const toggleAvailable = async (product: Product) => {
    setTogglingProductId(product.id)
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: !product.isAvailable }),
    })
    setTogglingProductId(null)
    if (res.ok) fetchCategories()
  }

  if (loading) return <div dir="rtl" className="text-gray-400">טוען...</div>

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">ניהול תפריט</h2>
        <button onClick={() => setShowAddCategory(true)} className="bg-orange-500 text-white px-4 py-2 rounded-xl">
          + קטגוריה חדשה
        </button>
      </div>

      {loadError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm mb-6 text-center">
          {loadError}
        </div>
      )}

      {showAddCategory && (
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="שם הקטגוריה (עברית) *"
              value={categoryForm.nameHe}
              onChange={(e) => setCategoryForm(f => ({ ...f, nameHe: e.target.value }))}
              className="bg-gray-800 text-white rounded-xl px-4 py-2 outline-none"
            />
            <input
              type="text"
              placeholder="שם באנגלית (אופציונלי)"
              value={categoryForm.nameEn}
              onChange={(e) => setCategoryForm(f => ({ ...f, nameEn: e.target.value }))}
              className="bg-gray-800 text-white rounded-xl px-4 py-2 outline-none"
            />
            <input
              type="text"
              placeholder="שם בצרפתית (אופציונלי)"
              value={categoryForm.nameFr}
              onChange={(e) => setCategoryForm(f => ({ ...f, nameFr: e.target.value }))}
              className="bg-gray-800 text-white rounded-xl px-4 py-2 outline-none"
            />
          </div>
          {categoryError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm text-center">
              {categoryError}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={createCategory} disabled={savingCategory} className="bg-orange-500 text-white px-4 py-2 rounded-xl disabled:opacity-50">
              {savingCategory ? 'שומר...' : 'צור קטגוריה'}
            </button>
            <button onClick={() => { setShowAddCategory(false); setCategoryError('') }} className="bg-gray-700 text-white px-4 py-2 rounded-xl">
              ביטול
            </button>
          </div>
        </div>
      )}

      {showProductForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowProductForm(false)}>
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 w-full max-w-lg space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg">{editingProductId ? 'עריכת מנה' : 'מנה חדשה'}</h3>

            <select
              value={productForm.categoryId}
              onChange={(e) => setProductForm((f: any) => ({ ...f, categoryId: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-2 outline-none"
            >
              <option value="" disabled>בחר קטגוריה</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.nameHe}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="שם המנה (עברית) *"
              value={productForm.nameHe}
              onChange={(e) => setProductForm((f: any) => ({ ...f, nameHe: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-2 outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="שם באנגלית"
                value={productForm.nameEn}
                onChange={(e) => setProductForm((f: any) => ({ ...f, nameEn: e.target.value }))}
                className="bg-gray-800 text-white rounded-xl px-4 py-2 outline-none"
              />
              <input
                type="text"
                placeholder="שם בצרפתית"
                value={productForm.nameFr}
                onChange={(e) => setProductForm((f: any) => ({ ...f, nameFr: e.target.value }))}
                className="bg-gray-800 text-white rounded-xl px-4 py-2 outline-none"
              />
            </div>
            <textarea
              placeholder="תיאור (עברית, אופציונלי)"
              value={productForm.descHe}
              onChange={(e) => setProductForm((f: any) => ({ ...f, descHe: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-2 outline-none resize-none"
              rows={2}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="מחיר (₪) *"
                value={productForm.price}
                onChange={(e) => setProductForm((f: any) => ({ ...f, price: e.target.value }))}
                className="bg-gray-800 text-white rounded-xl px-4 py-2 outline-none"
              />
              <input
                type="text"
                placeholder="קישור לתמונה (אופציונלי)"
                value={productForm.image}
                onChange={(e) => setProductForm((f: any) => ({ ...f, image: e.target.value }))}
                className="bg-gray-800 text-white rounded-xl px-4 py-2 outline-none"
              />
            </div>

            {productError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm text-center">
                {productError}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={saveProduct} disabled={savingProduct} className="bg-orange-500 text-white px-4 py-2 rounded-xl disabled:opacity-50">
                {savingProduct ? 'שומר...' : 'שמור'}
              </button>
              <button onClick={() => setShowProductForm(false)} className="bg-gray-700 text-white px-4 py-2 rounded-xl">
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl p-12 border border-gray-800 text-center text-gray-500">
          <p className="text-4xl mb-3">🍔</p>
          <p>אין קטגוריות עדיין. התחל בהוספת קטגוריה ראשונה (למשל: "עיקריות", "שתייה").</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-gray-800">
                <div>
                  <h3 className="font-bold text-lg">{cat.nameHe}</h3>
                  <p className="text-gray-500 text-xs">{cat.products.length} מנות</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => openAddProduct(cat.id)} className="bg-orange-500/10 text-orange-400 text-sm px-3 py-1.5 rounded-lg hover:bg-orange-500/20">
                    + מנה
                  </button>
                  {confirmingCategoryId === cat.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 text-xs">למחוק את הקטגוריה וכל מנותיה?</span>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        disabled={deletingCategoryId === cat.id}
                        className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-50"
                      >
                        {deletingCategoryId === cat.id ? '...' : 'כן, מחק'}
                      </button>
                      <button onClick={() => setConfirmingCategoryId(null)} className="bg-gray-700 text-white text-xs px-3 py-1.5 rounded-lg">
                        ביטול
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmingCategoryId(cat.id)} className="text-red-400 text-xs hover:text-red-300">
                      🗑
                    </button>
                  )}
                </div>
              </div>

              {cat.products.length === 0 ? (
                <p className="text-gray-600 text-sm p-5">אין מנות בקטגוריה זו עדיין.</p>
              ) : (
                <div className="divide-y divide-gray-800">
                  {cat.products.map((p) => (
                    <div key={p.id} className="flex items-center gap-4 p-4">
                      {p.image ? (
                        <img src={p.image} alt={p.nameHe} className="w-14 h-14 object-cover rounded-xl flex-shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">🍽️</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${p.isAvailable ? '' : 'text-gray-500 line-through'}`}>{p.nameHe}</p>
                        <p className="text-gray-500 text-sm">{p.price}₪</p>
                      </div>
                      <button
                        onClick={() => toggleAvailable(p)}
                        disabled={togglingProductId === p.id}
                        className={`text-xs px-3 py-1.5 rounded-lg disabled:opacity-50 flex-shrink-0 ${
                          p.isAvailable
                            ? 'bg-green-600/10 text-green-400 hover:bg-green-600/20'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {p.isAvailable ? '✓ זמין' : 'לא זמין'}
                      </button>
                      <button onClick={() => openEditProduct(p)} className="text-gray-400 hover:text-white text-sm flex-shrink-0">
                        ✏️
                      </button>
                      {confirmingProductId === p.id ? (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => deleteProduct(p.id)}
                            disabled={deletingProductId === p.id}
                            className="bg-red-600 text-white text-xs px-2 py-1.5 rounded-lg disabled:opacity-50"
                          >
                            {deletingProductId === p.id ? '...' : 'אישור'}
                          </button>
                          <button onClick={() => setConfirmingProductId(null)} className="bg-gray-700 text-white text-xs px-2 py-1.5 rounded-lg">
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmingProductId(p.id)} className="text-red-400 hover:text-red-300 text-sm flex-shrink-0">
                          🗑
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
