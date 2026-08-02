'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableProduct({ product, isSelected, onClick }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className={`rounded-xl p-3 border transition-all ${isSelected ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
        <div {...listeners} className="cursor-grab active:cursor-grabbing mb-2">
          {product.image ? (
            <img src={product.image} className="w-full h-24 rounded-lg object-cover" />
          ) : (
            <div className="w-full h-24 rounded-lg bg-gray-700 flex items-center justify-center text-3xl">🍽️</div>
          )}
        </div>
        <div onClick={onClick} className="cursor-pointer">
          <p className="font-bold text-sm">{product.nameHe}</p>
          <p className="text-orange-400 text-sm font-bold">{product.price} ₪</p>
        </div>
      </div>
    </div>
  )
}

function SortableCategory({ cat, children, headerActions }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 text-xl px-1 select-none">
            ⠿
          </div>
          {cat.image ? (
            <img src={cat.image} className="w-10 h-10 rounded-xl object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-xl">🍔</div>
          )}
          <span className="font-bold text-orange-400">{cat.nameHe}</span>
        </div>
        {headerActions}
      </div>
      {children}
    </div>
  )
}

export default function MenuPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryImage, setNewCategoryImage] = useState('')
  const [showAddProduct, setShowAddProduct] = useState<string | null>(null)
  const [newProduct, setNewProduct] = useState({ nameHe: '', price: '', image: '', descHe: '' })
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [newIngredient, setNewIngredient] = useState('')
  const [newExtra, setNewExtra] = useState({ nameHe: '', price: '' })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const fetchCategories = async () => {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(Array.isArray(data) ? data : [])
    if (selectedProduct) {
      const allProducts = data.flatMap((c: any) => c.products || [])
      const updated = allProducts.find((p: any) => p.id === selectedProduct.id)
      if (updated) setSelectedProduct(updated)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const uploadImage = async (file: File): Promise<string> => {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    setUploading(false)
    return data.url || ''
  }

  const addCategory = async () => {
    if (!newCategoryName.trim()) return
    setLoading(true)
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nameHe: newCategoryName, image: newCategoryImage }),
    })
    setNewCategoryName('')
    setNewCategoryImage('')
    setShowAddCategory(false)
    fetchCategories()
    setLoading(false)
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('האם למחוק קטגוריה זו?')) return
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    setSelectedProduct(null)
    fetchCategories()
  }

  const addProduct = async (categoryId: string) => {
    if (!newProduct.nameHe.trim() || !newProduct.price) return
    setLoading(true)
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categoryId,
        nameHe: newProduct.nameHe,
        descHe: newProduct.descHe,
        price: parseFloat(newProduct.price),
        image: newProduct.image,
      }),
    })
    setNewProduct({ nameHe: '', price: '', image: '', descHe: '' })
    setShowAddProduct(null)
    fetchCategories()
    setLoading(false)
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('האם למחוק מנה זו?')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    setSelectedProduct(null)
    fetchCategories()
  }

  const addIngredient = async () => {
    if (!newIngredient.trim() || !selectedProduct) return
    await fetch('/api/toppings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: selectedProduct.id, nameHe: newIngredient, price: 0, type: 'INCLUDED' }),
    })
    setNewIngredient('')
    fetchCategories()
  }

  const addExtra = async () => {
    if (!newExtra.nameHe.trim() || !selectedProduct) return
    await fetch('/api/toppings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: selectedProduct.id, nameHe: newExtra.nameHe, price: parseFloat(newExtra.price) || 0, type: 'EXTRA' }),
    })
    setNewExtra({ nameHe: '', price: '' })
    fetchCategories()
  }

  const deleteTopping = async (id: string) => {
    await fetch(`/api/toppings/${id}`, { method: 'DELETE' })
    fetchCategories()
  }

  const handleDragEndProducts = (event: DragEndEvent, categoryId: string) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat
      const oldIndex = cat.products.findIndex((p: any) => p.id === active.id)
      const newIndex = cat.products.findIndex((p: any) => p.id === over.id)
      return { ...cat, products: arrayMove(cat.products, oldIndex, newIndex) }
    }))
  }

  const handleDragEndCategories = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setCategories(prev => {
      const oldIndex = prev.findIndex(c => c.id === active.id)
      const newIndex = prev.findIndex(c => c.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  return (
    <div dir="rtl" className="flex gap-6">

      {/* COLONNE GAUCHE */}
      <div className="flex-1 space-y-4 min-w-0">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">ניהול תפריט</h2>
          <button onClick={() => setShowAddCategory(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm">
            + קטגוריה חדשה
          </button>
        </div>

        {showAddCategory && (
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <p className="font-bold mb-3">קטגוריה חדשה</p>
            <div className="space-y-2">
              <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="שם הקטגוריה" className="w-full bg-gray-800 text-white rounded-xl px-4 py-2 outline-none" />
              <div className="flex items-center gap-2">
                <label className="flex-1 bg-gray-800 text-gray-400 rounded-xl px-4 py-2 cursor-pointer text-center text-sm">
                  {uploading ? 'מעלה...' : newCategoryImage ? '✅ תמונה נבחרה' : '📷 תמונה'}
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => { if (e.target.files?.[0]) { const url = await uploadImage(e.target.files[0]); setNewCategoryImage(url) } }} />
                </label>
                {newCategoryImage && <img src={newCategoryImage} className="w-10 h-10 rounded-lg object-cover" />}
              </div>
              <div className="flex gap-2">
                <button onClick={addCategory} disabled={loading} className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm">שמור</button>
                <button onClick={() => setShowAddCategory(false)} className="bg-gray-700 text-white px-4 py-2 rounded-xl text-sm">ביטול</button>
              </div>
            </div>
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndCategories}>
          <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {categories.map((cat: any) => (
                <SortableCategory
                  key={cat.id}
                  cat={cat}
                  headerActions={
                    <div className="flex gap-2">
                      <button onClick={() => setShowAddProduct(showAddProduct === cat.id ? null : cat.id)} className="text-xs bg-gray-800 text-white px-3 py-1 rounded-lg">+ מנה</button>
                      <button onClick={() => deleteCategory(cat.id)} className="text-red-400 text-sm px-2">🗑️</button>
                    </div>
                  }
                >
                  {showAddProduct === cat.id && (
                    <div className="p-4 bg-gray-800 border-b border-gray-700">
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input type="text" value={newProduct.nameHe} onChange={(e) => setNewProduct({ ...newProduct, nameHe: e.target.value })} placeholder="שם המנה" className="flex-1 bg-gray-700 text-white rounded-xl px-3 py-2 text-sm outline-none" />
                          <input type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="₪" className="w-20 bg-gray-700 text-white rounded-xl px-3 py-2 text-sm outline-none" />
                        </div>
                        <textarea value={newProduct.descHe} onChange={(e) => setNewProduct({ ...newProduct, descHe: e.target.value })} placeholder="תיאור קצר..." className="w-full bg-gray-700 text-white rounded-xl px-3 py-2 text-sm outline-none resize-none h-14" />
                        <div className="flex items-center gap-2">
                          <label className="flex-1 bg-gray-700 text-gray-400 rounded-xl px-3 py-2 cursor-pointer text-center text-sm">
                            {uploading ? 'מעלה...' : newProduct.image ? '✅ תמונה' : '📷 תמונה'}
                            <input type="file" accept="image/*" className="hidden" onChange={async (e) => { if (e.target.files?.[0]) { const url = await uploadImage(e.target.files[0]); setNewProduct({ ...newProduct, image: url }) } }} />
                          </label>
                          {newProduct.image && <img src={newProduct.image} className="w-10 h-10 rounded-lg object-cover" />}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => addProduct(cat.id)} disabled={loading} className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm disabled:opacity-50">שמור</button>
                          <button onClick={() => setShowAddProduct(null)} className="bg-gray-600 text-white px-4 py-2 rounded-xl text-sm">ביטול</button>
                        </div>
                      </div>
                    </div>
                  )}

                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEndProducts(e, cat.id)}>
                    <SortableContext items={cat.products?.map((p: any) => p.id) || []} strategy={rectSortingStrategy}>
                      <div className="grid grid-cols-2 gap-3 p-4">
                        {cat.products?.map((product: any) => (
                          <SortableProduct
                            key={product.id}
                            product={product}
                            isSelected={selectedProduct?.id === product.id}
                            onClick={() => setSelectedProduct(selectedProduct?.id === product.id ? null : product)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </SortableCategory>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* COLONNE DROITE */}
      {selectedProduct && (
        <div className="w-72 flex-shrink-0">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 sticky top-0 overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold">{selectedProduct.nameHe}</h3>
                  <p className="text-orange-400 font-bold text-sm">{selectedProduct.price} ₪</p>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="text-gray-500 hover:text-white text-xl">×</button>
              </div>
              {selectedProduct.image && <img src={selectedProduct.image} className="w-full h-28 rounded-xl object-cover" />}
              {selectedProduct.descHe && <p className="text-gray-400 text-xs mt-2">{selectedProduct.descHe}</p>}
            </div>

            <div className="p-3 border-b border-gray-800">
              <p className="font-bold text-green-400 text-xs mb-2">📋 הרכב הבסיסי</p>
              <div className="space-y-1 mb-2">
                {selectedProduct.options?.filter((o: any) => o.type === 'INCLUDED').map((opt: any) => (
                  <div key={opt.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-2 py-1">
                    <span className="text-xs">✓ {opt.nameHe}</span>
                    <button onClick={() => deleteTopping(opt.id)} className="text-red-400 text-sm">−</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1">
                <input type="text" value={newIngredient} onChange={(e) => setNewIngredient(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addIngredient() }} placeholder="הוסף רכיב..." className="flex-1 bg-gray-800 text-white rounded-lg px-2 py-1 text-xs outline-none" />
                <button onClick={addIngredient} className="bg-green-600 text-white w-7 h-7 rounded-lg text-lg flex items-center justify-center">+</button>
              </div>
            </div>

            <div className="p-3">
              <p className="font-bold text-orange-400 text-xs mb-2">➕ תוספות בתשלום</p>
              <div className="space-y-1 mb-2">
                {selectedProduct.options?.filter((o: any) => o.type === 'EXTRA' || !o.type).map((opt: any) => (
                  <div key={opt.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-2 py-1">
                    <span className="text-xs">+ {opt.nameHe}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-orange-400 text-xs">+{opt.price}₪</span>
                      <button onClick={() => deleteTopping(opt.id)} className="text-red-400 text-sm">−</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-1">
                <input type="text" value={newExtra.nameHe} onChange={(e) => setNewExtra({ ...newExtra, nameHe: e.target.value })} placeholder="תוספת..." className="flex-1 bg-gray-800 text-white rounded-lg px-2 py-1 text-xs outline-none" />
                <input type="number" value={newExtra.price} onChange={(e) => setNewExtra({ ...newExtra, price: e.target.value })} placeholder="₪" className="w-12 bg-gray-800 text-white rounded-lg px-2 py-1 text-xs outline-none" />
                <button onClick={addExtra} className="bg-orange-500 text-white w-7 h-7 rounded-lg text-lg flex items-center justify-center">+</button>
              </div>
            </div>

            <div className="px-3 pb-3">
              <button onClick={() => deleteProduct(selectedProduct.id)} className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-xl text-xs">
                🗑️ מחק מנה
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}