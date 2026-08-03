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
  const [lang, setLang] = useState<'he' | 'en' | 'fr'>('he')

  useEffect(() => {
    fetch(`/api/menu/${restaurantSlug}`)
      .then(r => r.json())
      .then(data => {
        setRestaurant(data)
        if (data.categories?.length > 0) setSelectedCategory(data.categories[0].id)
        setLoading(false)
      })
  }, [restaurantSlug])

  const getName = (item: any) => {
  if (lang === 'fr') return item.nameFr || item.nameEn || item.nameHe
  if (lang === 'en') return item.nameEn || item.nameHe
  return item.nameHe
}

const getDesc = (item: any) => {
  if (lang === 'fr') return item.descFr || item.descEn || item.descHe
  if (lang === 'en') return item.descEn || item.descHe
  return item.descHe
}

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

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id))
  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const placeOrder = async () => {
    if (cart.length === 0) return
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId: restaurant.id, tableId, items: cart, totalAmount, customerNote }),
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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-yellow-600 font-light tracking-widest text-sm">PRIMO</p>
    </div>
  )

  if (!restaurant || restaurant.error) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-white">מסעדה לא נמצאה</p>
    </div>
  )

  if (showSuccess) return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6" dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <div className="text-center">
        <div className="w-24 h-24 border-2 border-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-yellow-600 text-4xl">✓</span>
        </div>
        <p className="text-yellow-600 tracking-widest text-sm mb-2">PRIMO STEAKHOUSE</p>
        <h2 className="text-3xl font-bold text-white mb-2">
          {lang === 'he' ? 'ההזמנה התקבלה' : 'Order Received'}
        </h2>
        <p className="text-gray-400 mb-2">{lang === 'he' ? 'מספר הזמנה' : 'Order number'}</p>
        <p className="text-yellow-600 font-bold text-6xl mb-8">#{orderNumber}</p>
        <button onClick={() => setShowSuccess(false)} className="border border-yellow-600 text-yellow-600 px-8 py-3 tracking-widest text-sm hover:bg-yellow-600 hover:text-black transition-all">
          {lang === 'he' ? 'הזמן שוב' : 'ORDER AGAIN'}
        </button>
      </div>
    </div>
  )

  const currentCategory = restaurant.categories?.find((c: any) => c.id === selectedCategory)

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative" dir={lang === 'he' ? 'rtl' : 'ltr'}>

      {/* Logo en arrière-plan */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.03]">
        <svg viewBox="0 0 400 400" className="w-96 h-96" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="200" cy="200" r="190" stroke="#B8860B" strokeWidth="2"/>
          <circle cx="200" cy="200" r="170" stroke="#B8860B" strokeWidth="1"/>
          <text x="200" y="180" textAnchor="middle" fill="#B8860B" fontSize="80" fontFamily="Georgia, serif" fontWeight="bold">P</text>
          <text x="200" y="240" textAnchor="middle" fill="#B8860B" fontSize="22" fontFamily="Georgia, serif" letterSpacing="12">PRIMO</text>
          <text x="200" y="270" textAnchor="middle" fill="#B8860B" fontSize="11" fontFamily="Georgia, serif" letterSpacing="8">STEAKHOUSE</text>
          <line x1="80" y1="290" x2="320" y2="290" stroke="#B8860B" strokeWidth="1"/>
          <polygon points="200,310 195,320 205,320" fill="#B8860B"/>
        </svg>
      </div>

      {/* Header */}
      <div className="bg-black border-b border-yellow-900/30 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-600 tracking-widest text-xs mb-1">STEAKHOUSE</p>
            <h1 className="text-2xl font-bold tracking-wide">פרימו</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
  {(['he', 'en', 'fr'] as const).map((l) => (
    <button
      key={l}
      onClick={() => setLang(l)}
      className={`text-xs px-2 py-1 rounded-full border transition-all ${
        lang === l
          ? 'border-yellow-600 text-yellow-600'
          : 'border-gray-700 text-gray-400 hover:border-yellow-600 hover:text-yellow-600'
      }`}
    >
      {l === 'he' ? 'עב' : l === 'en' ? 'EN' : 'FR'}
    </button>
  ))}
</div>
            {cart.length > 0 && (
              <button
                onClick={() => setShowCart(true)}
                className="bg-yellow-600 text-black px-4 py-2 rounded-full flex items-center gap-2 font-bold text-sm"
              >
                <span>🛒</span>
                <span>{totalItems}</span>
                <span>{totalAmount}₪</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-black border-b border-yellow-900/20 px-4 py-3 flex gap-3 overflow-x-auto">
        {restaurant.categories?.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex-shrink-0 px-5 py-2 text-sm tracking-widest transition-all ${
              selectedCategory === cat.id
                ? 'bg-yellow-600 text-black font-bold'
                : 'border border-gray-700 text-gray-400 hover:border-yellow-600 hover:text-yellow-600'
            }`}
          >
            {getName(cat).toUpperCase()}
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
            className="bg-zinc-900 border border-zinc-800 hover:border-yellow-900/50 transition-all cursor-pointer group rounded-2xl overflow-hidden"
          >
            <div className="flex gap-4 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-base">{getName(product)}</h3>
                  <span className="text-yellow-600 font-bold text-lg mr-4 flex-shrink-0">{product.price}₪</span>
                </div>
                {getDesc(product) && (
                  <p className="text-gray-500 text-sm line-clamp-2">{getDesc(product)}</p>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-yellow-600/60 text-xs tracking-widest">
                    {lang === 'he' ? 'לחץ לפרטים' : 'TAP FOR DETAILS'}
                  </span>
                  <div className="flex-1 h-px bg-yellow-900/20"></div>
                  <div className="w-7 h-7 border border-yellow-600/40 group-hover:border-yellow-600 group-hover:bg-yellow-600 transition-all flex items-center justify-center">
                    <span className="text-yellow-600 group-hover:text-black font-bold">+</span>
                  </div>
                </div>
              </div>
              {product.image && (
                <img src={product.image} className="w-24 h-24 object-cover flex-shrink-0 grayscale-[20%]" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bouton panier */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-40">
          <button
            onClick={() => setShowCart(true)}
            className="w-full bg-yellow-600 text-black py-4 px-6 font-bold tracking-widest flex items-center justify-between"
          >
            <div className="bg-black/20 w-8 h-8 flex items-center justify-center text-sm font-bold">
              {totalItems}
            </div>
            <span>{lang === 'he' ? 'צפה בסל' : 'VIEW CART'}</span>
            <span>{totalAmount}₪</span>
          </button>
        </div>
      )}

      {/* Modal produit */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-end" onClick={() => setSelectedProduct(null)}>
          <div className="bg-zinc-950 border-t border-yellow-900/30 w-full max-h-[92vh] overflow-y-auto rounded-t-3xl" onClick={(e) => e.stopPropagation()}>
            {selectedProduct.image && (
              <div className="relative">
                <img src={selectedProduct.image} className="w-full h-52 object-cover grayscale-[20%]" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent"></div>
                <button onClick={() => setSelectedProduct(null)} className="absolute top-4 left-4 w-8 h-8 bg-black/70 flex items-center justify-center text-white border border-gray-700">×</button>
              </div>
            )}

            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-2xl font-bold">{getName(selectedProduct)}</h2>
                <span className="text-yellow-600 font-bold text-2xl">{selectedProduct.price}₪</span>
              </div>
              {getDesc(selectedProduct) && (
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">{getDesc(selectedProduct)}</p>
              )}

              {/* Ingrédients inclus */}
              {selectedProduct.options?.filter((o: any) => o.type === 'INCLUDED').length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px flex-1 bg-yellow-900/30"></div>
                    <p className="text-yellow-600 text-xs tracking-widest">
                      {lang === 'he' ? 'הרכב הבסיסי' : 'COMPOSITION'}
                    </p>
                    <div className="h-px flex-1 bg-yellow-900/30"></div>
                  </div>
                  <p className="text-gray-500 text-xs mb-3 text-center">
                    {lang === 'he' ? 'לחץ להסרה' : 'Tap to remove'}
                  </p>
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
                          className={`px-3 py-2 text-sm border transition-all ${
                            isRemoved
                              ? 'border-red-800 bg-red-900/20 text-red-400 line-through'
                              : 'border-zinc-700 text-gray-300 hover:border-yellow-600'
                          }`}
                        >
                          {getName(opt)}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Extras */}
              {selectedProduct.options?.filter((o: any) => o.type === 'EXTRA').length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px flex-1 bg-yellow-900/30"></div>
                    <p className="text-yellow-600 text-xs tracking-widest">
                      {lang === 'he' ? 'תוספות' : 'EXTRAS'}
                    </p>
                    <div className="h-px flex-1 bg-yellow-900/30"></div>
                  </div>
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
                          className={`w-full flex items-center justify-between px-4 py-3 border transition-all ${
                            isAdded
                              ? 'border-yellow-600 bg-yellow-900/20 text-yellow-400'
                              : 'border-zinc-800 text-gray-300 hover:border-yellow-600/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 border flex items-center justify-center transition-all ${isAdded ? 'border-yellow-600 bg-yellow-600' : 'border-gray-600'}`}>
                              {isAdded && <span className="text-black text-xs font-bold">✓</span>}
                            </div>
                            <span className="text-sm">{getName(opt)}</span>
                          </div>
                          <span className="text-yellow-600 text-sm font-bold">+{opt.price}₪</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Quantité */}
              <div className="flex items-center justify-between mb-6 border border-zinc-800 p-4 rounded-xl">
                <span className="text-gray-400 tracking-widest text-sm">
                  {lang === 'he' ? 'כמות' : 'QUANTITY'}
                </span>
                <div className="flex items-center gap-6">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 border border-zinc-700 flex items-center justify-center text-xl hover:border-yellow-600 transition-all">−</button>
                  <span className="font-bold text-xl w-6 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 bg-yellow-600 flex items-center justify-center text-xl text-black font-bold">+</button>
                </div>
              </div>

              <button
                onClick={addToCart}
                className="w-full bg-yellow-600 text-black py-4 font-bold tracking-widest text-sm rounded-xl"
              >
                {lang === 'he' ? 'הוסף לסל' : 'ADD TO CART'} — {((selectedProduct.price + productOptions.added.reduce((sum: number, o: any) => sum + o.price, 0)) * quantity).toFixed(0)}₪
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panier */}
      {showCart && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-end">
          <div className="bg-zinc-950 border-t border-yellow-900/30 w-full max-h-[90vh] overflow-y-auto rounded-t-3xl">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-lg font-bold tracking-widest">
                {lang === 'he' ? 'הסל שלי' : 'MY ORDER'}
              </h2>
              <button onClick={() => setShowCart(false)} className="w-8 h-8 border border-gray-700 flex items-center justify-center text-gray-400">×</button>
            </div>

            <div className="p-6 space-y-3 border-b border-zinc-800">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-start border-b border-zinc-900 pb-3">
                  <div className="flex-1">
                    <span className="font-bold text-sm">{item.quantity}× {item.productName}</span>
                    {item.selectedOptions?.removed?.length > 0 && (
                      <p className="text-red-400 text-xs mt-1">{lang === 'he' ? 'ללא' : 'Without'}: {item.selectedOptions.removed.join(', ')}</p>
                    )}
                    {item.selectedOptions?.added?.length > 0 && (
                      <p className="text-yellow-600 text-xs mt-1">{lang === 'he' ? 'תוספות' : 'Extras'}: {item.selectedOptions.added.join(', ')}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mr-4">
                    <span className="text-yellow-600 font-bold">{item.subtotal}₪</span>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-600 hover:text-red-400 transition-all">×</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6">
              <textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder={lang === 'he' ? 'הערות מיוחדות...' : 'Special requests...'}
                className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 text-sm outline-none resize-none h-16 mb-6 focus:border-yellow-600/50 transition-all"
              />
              <div className="flex justify-between mb-6">
                <span className="tracking-widest text-sm text-gray-400">{lang === 'he' ? 'סה"כ' : 'TOTAL'}</span>
                <span className="text-yellow-600 font-bold text-2xl">{totalAmount}₪</span>
              </div>
              <button
                onClick={placeOrder}
                className="w-full bg-yellow-600 text-black py-4 font-bold tracking-widest text-sm"
              >
                {lang === 'he' ? 'שלח הזמנה' : 'PLACE ORDER'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}