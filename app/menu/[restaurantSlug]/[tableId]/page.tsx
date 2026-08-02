'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function MenuClientPage() {
  const params = useParams()
  const restaurantSlug = params.restaurantSlug as string
  const tableId = params.tableId as string

  const [restaurant, setRestaurant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [productOptions, setProductOptions] = useState<any>({ removed: [], added: [] })
  const [quantity, setQuantity] = useState(1)
  const [showCart, setShowCart] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState<number | null>(null)
  const [customerNote, setCustomerNote] = useState('')

  useEffect(() => {
    fetch(`/api/menu/${restaurantSlug}`)
      .then(r => r.json())
      .then(data => {
        setRestaurant(data)
        if (data.categories?.length > 0) {
          setSelectedCategory(data.categories[0].id)
        }
        setLoading(false)
      })
  }, [restaurantSlug])

  const addToCart = () => {
    if (!selectedProduct) return
    const extrasPrice = productOptions.added.reduce((sum: number, o: any) => sum + o.price, 0)
    const unitPrice = selectedProduct.price + extrasPrice
    const item = {
      id: `${selectedProduct.id}-${Date.now()}`,
      productId: selectedProduct.id,
      productName: selectedProduct.nameHe,
      unitPrice,
      quantity,
      subtotal: unitPrice * quantity,
      selectedOptions: {
        removed: productOptions.removed.map((o: any) => o.nameHe),
        added: productOptions.added.map((o: any) => o.nameHe),
      },
      image: selectedProduct.image,
    }
    setCart(prev => [...prev, item])
    setSelectedProduct(null)
    setProductOptions({ removed: [], added: [] })
    setQuantity(1)
  }

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const placeOrder = async () => {
    if (cart.length === 0) return
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantId: restaurant.id,
        tableId,
        items: cart,
        totalAmount,
        customerNote,
      }),
    })
    const data = await res.json()
    if (data.orderNumber) {
      setOrderNumber(data.orderNumber)
      setShowSuccess(true)
      setCart([])
      setShowCart(false)
      setCustomerNote('')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-400">טוען תפריט...</p>
    </div>
  )

  if (!restaurant || restaurant.error) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-white">מסעדה לא נמצאה</p>
    </div>
  )

  if (showSuccess) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6" dir="rtl">
      <div className="text-center">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">✓</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">ההזמנה התקבלה!</h2>
        <p className="text-gray-400 mb-2">מספר הזמנה</p>
        <p className="text-orange-500 font-bold text-5xl mb-6">#{orderNumber}</p>
        <p className="text-gray-500 text-sm mb-8">המסעדה תכין את ההזמנה שלך בקרוב</p>
        <button
          onClick={() => setShowSuccess(false)}
          className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-bold"
        >
          הזמן שוב
        </button>
      </div>
    </div>
  )

  const currentCategory = restaurant.categories?.find((c: any) => c.id === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-950 text-white" dir="rtl">

      {/* Header */}
      <div className="relative">
        <div className="bg-gradient-to-b from-gray-900 to-gray-950 px-4 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{restaurant.name}</h1>
              <p className="text-gray-400 text-sm mt-1">ברוך הבא! בחר מנה</p>
            </div>
            {restaurant.logo && (
              <img src={restaurant.logo} className="w-14 h-14 rounded-2xl object-cover" />
            )}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-3 overflow-x-auto flex gap-3 sticky top-0 z-30 bg-gray-950 border-b border-gray-800/50">
        {restaurant.categories?.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
              selectedCategory === cat.id
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'bg-gray-800/80 text-gray-400'
            }`}
          >
            {cat.image && (
              <img src={cat.image} className="w-5 h-5 rounded-lg object-cover" />
            )}
            {cat.nameHe}
          </button>
        ))}
      </div>

      {/* Products */}
      <div className="p-4 space-y-3 pb-32">
        {currentCategory?.products?.map((product: any) => (
          <div
            key={product.id}
            onClick={() => {
              setSelectedProduct(product)
              setProductOptions({ removed: [], added: [] })
              setQuantity(1)
            }}
            className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-orange-500/50 transition-all active:scale-98 cursor-pointer"
          >
            <div className="flex gap-4 p-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base mb-1">{product.nameHe}</h3>
                {product.descHe && (
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.descHe}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-orange-500 font-bold text-lg">{product.price} ₪</span>
                  <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">+</span>
                  </div>
                </div>
              </div>
              {product.image ? (
                <img src={product.image} className="w-28 h-28 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-28 h-28 rounded-xl bg-gray-800 flex items-center justify-center text-4xl flex-shrink-0">
                  🍽️
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bouton panier flottant */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-40">
          <button
            onClick={() => setShowCart(true)}
            className="w-full bg-orange-500 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-xl shadow-orange-500/40 flex items-center justify-between"
          >
            <div className="bg-orange-600 rounded-xl w-8 h-8 flex items-center justify-center">
              <span className="text-sm font-bold">{totalItems}</span>
            </div>
            <span>צפה בסל</span>
            <span>{totalAmount} ₪</span>
          </button>
        </div>
      )}

      {/* Modal produit */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end" onClick={() => setSelectedProduct(null)}>
          <div
            className="bg-gray-900 w-full rounded-t-3xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedProduct.image ? (
              <div className="relative">
                <img src={selectedProduct.image} className="w-full h-56 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 left-4 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center p-4 pt-6">
                <button onClick={() => setSelectedProduct(null)} className="text-gray-400 text-2xl">×</button>
              </div>
            )}

            <div className="p-6">
              <h2 className="text-2xl font-bold mb-1">{selectedProduct.nameHe}</h2>
              {selectedProduct.descHe && (
                <p className="text-gray-400 text-sm mb-4">{selectedProduct.descHe}</p>
              )}
              <p className="text-orange-500 font-bold text-2xl mb-6">{selectedProduct.price} ₪</p>

              {/* Ingrédients inclus */}
              {selectedProduct.options?.filter((o: any) => o.type === 'INCLUDED').length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold mb-1">הרכב הבסיסי</h3>
                  <p className="text-gray-500 text-xs mb-3">לחץ להסרה</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.options.filter((o: any) => o.type === 'INCLUDED').map((opt: any) => {
                      const isRemoved = productOptions.removed.find((r: any) => r.id === opt.id)
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            if (isRemoved) {
                              setProductOptions((prev: any) => ({ ...prev, removed: prev.removed.filter((r: any) => r.id !== opt.id) }))
                            } else {
                              setProductOptions((prev: any) => ({ ...prev, removed: [...prev.removed, opt] }))
                            }
                          }}
                          className={`px-3 py-2 rounded-xl text-sm border transition-all ${
                            isRemoved
                              ? 'bg-red-500/20 border-red-500/50 text-red-400 line-through'
                              : 'bg-green-500/10 border-green-500/30 text-green-400'
                          }`}
                        >
                          {isRemoved ? '✗' : '✓'} {opt.nameHe}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Extras */}
              {selectedProduct.options?.filter((o: any) => o.type === 'EXTRA').length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold mb-3">תוספות</h3>
                  <div className="space-y-2">
                    {selectedProduct.options.filter((o: any) => o.type === 'EXTRA').map((opt: any) => {
                      const isAdded = productOptions.added.find((a: any) => a.id === opt.id)
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            if (isAdded) {
                              setProductOptions((prev: any) => ({ ...prev, added: prev.added.filter((a: any) => a.id !== opt.id) }))
                            } else {
                              setProductOptions((prev: any) => ({ ...prev, added: [...prev.added, opt] }))
                            }
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                            isAdded
                              ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                              : 'bg-gray-800 border-gray-700 text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isAdded ? 'border-orange-500 bg-orange-500' : 'border-gray-600'}`}>
                              {isAdded && <span className="text-white text-xs">✓</span>}
                            </div>
                            <span>{opt.nameHe}</span>
                          </div>
                          <span className="text-orange-400 font-bold">+{opt.price} ₪</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Quantité */}
              <div className="flex items-center justify-between mb-6 bg-gray-800 rounded-2xl p-4">
                <span className="font-bold">כמות</span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 bg-gray-700 rounded-xl text-xl flex items-center justify-center font-bold"
                  >
                    −
                  </button>
                  <span className="font-bold text-xl w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-10 bg-orange-500 rounded-xl text-xl flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={addToCart}
                className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/30"
              >
                הוסף לסל — {((selectedProduct.price + productOptions.added.reduce((sum: number, o: any) => sum + o.price, 0)) * quantity).toFixed(0)} ₪
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panier */}
      {showCart && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end">
          <div className="bg-gray-900 w-full rounded-t-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="text-xl font-bold">הסל שלי</h2>
              <button onClick={() => setShowCart(false)} className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400">×</button>
            </div>

            <div className="px-6 space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-gray-800 rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <span className="font-bold">{item.quantity}x {item.productName}</span>
                      {item.selectedOptions?.removed?.length > 0 && (
                        <p className="text-red-400 text-xs mt-1">ללא: {item.selectedOptions.removed.join(', ')}</p>
                      )}
                      {item.selectedOptions?.added?.length > 0 && (
                        <p className="text-green-400 text-xs mt-1">תוספות: {item.selectedOptions.added.join(', ')}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mr-3">
                      <span className="text-orange-400 font-bold">{item.subtotal} ₪</span>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-400 text-lg">×</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 mb-4">
              <textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="הערות להזמנה... (אלרגיות, בקשות מיוחדות)"
                className="w-full bg-gray-800 text-white rounded-2xl px-4 py-3 text-sm outline-none resize-none h-20 border border-gray-700"
              />
            </div>

            <div className="px-6 pb-8">
              <div className="flex justify-between mb-4">
                <span className="font-bold text-lg">סה"כ</span>
                <span className="text-orange-500 font-bold text-2xl">{totalAmount} ₪</span>
              </div>
              <button
                onClick={placeOrder}
                className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/30"
              >
                שלח הזמנה 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}