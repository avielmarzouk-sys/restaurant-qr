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
  const [sending, setSending] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [orderStatus, setOrderStatus] = useState<string>('NEW')

  useEffect(() => {
    fetch(`/api/menu/${restaurantSlug}`)
      .then(r => r.json())
      .then(data => {
        setRestaurant(data)
        if (data.categories?.length > 0) setSelectedCategory(data.categories[0].id)
        setLoading(false)
      })
      .catch(() => {
        setRestaurant({ error: true })
        setLoading(false)
      })
  }, [restaurantSlug])

  useEffect(() => {
    if (!orderId || !showSuccess) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/status?orderId=${orderId}`)
        const data = await res.json()
        if (data.status) setOrderStatus(data.status)
      } catch {
        // network hiccup, will retry on the next tick
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [orderId, showSuccess])

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
    setSending(true)
    setOrderError('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId: restaurant.id, tableId, items: cart, totalAmount, customerNote }),
      })
      const data = await res.json()
      if (!res.ok || !data.orderNumber) {
        throw new Error(data?.error || 'Order failed')
      }
      setOrderNumber(data.orderNumber)
      setOrderId(data.id)
      setOrderStatus('NEW')
      setShowSuccess(true)
      setCart([])
      setShowCart(false)
      setCustomerNote('')
    } catch (err) {
      setOrderError(
        lang === 'he' ? 'שליחת ההזמנה נכשלה, נסה שוב' :
        lang === 'fr' ? "Échec de l'envoi de la commande, réessayez" :
        'Failed to send the order, please try again'
      )
    } finally {
      setSending(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  if (!restaurant || restaurant.error) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-white">מסעדה לא נמצאה</p>
    </div>
  )

  if (sending) return (
    <div className="min-h-screen bg-black flex items-center justify-center" dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes spinRing { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulseText { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .spin-ring { animation: spinRing 1s linear infinite; }
        .pulse-text { animation: pulseText 1.5s ease-in-out infinite; }
      `}</style>
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <svg className="w-24 h-24 spin-ring" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#B8860B" strokeWidth="3" strokeDasharray="70 210" strokeLinecap="round"/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl">🥩</span>
          </div>
        </div>
        <p className="text-yellow-600 tracking-widest text-sm pulse-text">
          {lang === 'he' ? 'שולח הזמנה...' : lang === 'fr' ? 'Envoi en cours...' : 'Sending order...'}
        </p>
      </div>
    </div>
  )

  if (showSuccess) return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6" dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes scaleIn { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulseAnim { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.05); } }
        .scale-in { animation: scaleIn 0.6s ease-out forwards; }
        .slide-up-1 { animation: slideUp 0.5s ease-out 0.3s forwards; opacity: 0; }
        .slide-up-2 { animation: slideUp 0.5s ease-out 0.5s forwards; opacity: 0; }
        .slide-up-3 { animation: slideUp 0.5s ease-out 0.7s forwards; opacity: 0; }
        .spin-slow { animation: spinSlow 8s linear infinite; }
        .pulse-anim { animation: pulseAnim 2s ease-in-out infinite; }
      `}</style>

      <div className="text-center w-full max-w-sm">
        <div className="relative w-36 h-36 mx-auto mb-8">
          <svg className="w-36 h-36 spin-slow absolute inset-0" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#B8860B" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.5"/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 border-2 border-yellow-600 rounded-full flex items-center justify-center scale-in">
              <svg className="w-10 h-10 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
        </div>

        <p className="text-yellow-600 tracking-widest text-xs mb-3 slide-up-1">{restaurant.name}</p>
        <h2 className="text-2xl font-bold text-white mb-2 slide-up-1">
          {lang === 'he' ? 'ההזמנה בדרך!' : lang === 'fr' ? 'Commande envoyée !' : 'Order on its way!'}
        </h2>

        <div className="border border-yellow-900/30 bg-zinc-900/50 rounded-2xl p-4 mb-6 slide-up-2">
          <p className="text-gray-500 text-xs tracking-widest mb-1">
            {lang === 'he' ? 'מספר הזמנה' : lang === 'fr' ? 'N° de commande' : 'Order number'}
          </p>
          <p className="text-yellow-600 font-bold text-5xl">#{orderNumber}</p>
        </div>

        <div className="border border-zinc-800 bg-zinc-900/50 rounded-2xl p-5 mb-6 slide-up-3">
          <p className="text-gray-500 text-xs tracking-widest mb-4">
            {lang === 'he' ? 'סטטוס הזמנה' : lang === 'fr' ? 'STATUT' : 'STATUS'}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center text-black font-bold">✓</div>
              <span className="text-yellow-600 text-xs">{lang === 'he' ? 'התקבל' : lang === 'fr' ? 'Reçu' : 'Received'}</span>
            </div>
            <div className={`flex-1 h-px mx-2 transition-all duration-500 ${['ACCEPTED', 'PREPARING', 'READY', 'DONE'].includes(orderStatus) ? 'bg-yellow-600' : 'bg-zinc-800'}`}></div>
            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${['ACCEPTED', 'PREPARING', 'READY', 'DONE'].includes(orderStatus) ? 'bg-yellow-600 text-black font-bold' : 'border border-zinc-700 text-zinc-600'}`}>
                {['ACCEPTED', 'PREPARING', 'READY', 'DONE'].includes(orderStatus) ? '✓' : '2'}
              </div>
              <span className={`text-xs ${['ACCEPTED', 'PREPARING', 'READY', 'DONE'].includes(orderStatus) ? 'text-yellow-600' : 'text-gray-600'}`}>{lang === 'he' ? 'אושר' : lang === 'fr' ? 'Accepté' : 'Accepted'}</span>
            </div>
            <div className={`flex-1 h-px mx-2 transition-all duration-500 ${['PREPARING', 'READY', 'DONE'].includes(orderStatus) ? 'bg-yellow-600' : 'bg-zinc-800'}`}></div>
            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${['PREPARING', 'READY', 'DONE'].includes(orderStatus) ? 'bg-yellow-600 text-black pulse-anim' : 'border border-zinc-700 text-zinc-600'}`}>
                {['PREPARING', 'READY', 'DONE'].includes(orderStatus) ? '🔥' : '3'}
              </div>
              <span className={`text-xs ${['PREPARING', 'READY', 'DONE'].includes(orderStatus) ? 'text-yellow-600' : 'text-gray-600'}`}>{lang === 'he' ? 'בהכנה' : lang === 'fr' ? 'En prépa' : 'Preparing'}</span>
            </div>
            <div className={`flex-1 h-px mx-2 transition-all duration-500 ${['READY', 'DONE'].includes(orderStatus) ? 'bg-green-600' : 'bg-zinc-800'}`}></div>
            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${['READY', 'DONE'].includes(orderStatus) ? 'bg-green-600 text-white pulse-anim' : 'border border-zinc-700 text-zinc-600'}`}>
                {['READY', 'DONE'].includes(orderStatus) ? '🍽️' : '4'}
              </div>
              <span className={`text-xs ${['READY', 'DONE'].includes(orderStatus) ? 'text-green-500' : 'text-gray-600'}`}>{lang === 'he' ? 'מוכן!' : lang === 'fr' ? 'Prêt!' : 'Ready!'}</span>
            </div>
          </div>

          <div className="mt-4 text-center">
            {orderStatus === 'NEW' && <p className="text-gray-400 text-xs animate-pulse">{lang === 'he' ? 'ממתין לאישור...' : lang === 'fr' ? 'En attente...' : 'Waiting for confirmation...'}</p>}
            {orderStatus === 'ACCEPTED' && <p className="text-yellow-600 text-xs">{lang === 'he' ? '✓ ההזמנה אושרה!' : lang === 'fr' ? '✓ Commande acceptée !' : '✓ Order accepted!'}</p>}
            {orderStatus === 'PREPARING' && <p className="text-yellow-600 text-xs animate-pulse">{lang === 'he' ? '🔥 המנות שלך בהכנה...' : lang === 'fr' ? '🔥 En préparation...' : '🔥 Preparing your dishes...'}</p>}
            {orderStatus === 'READY' && <p className="text-green-400 text-sm font-bold animate-pulse">{lang === 'he' ? '🍽️ ההזמנה מוכנה!' : lang === 'fr' ? '🍽️ Commande prête !' : '🍽️ Order is ready!'}</p>}
            {orderStatus === 'DONE' && <p className="text-green-400 text-xs">{lang === 'he' ? '✓ תיאבון!' : lang === 'fr' ? '✓ Bon appétit !' : '✓ Enjoy your meal!'}</p>}
          </div>
        </div>

        <button
          onClick={() => { setShowSuccess(false); setOrderId(null); setOrderStatus('NEW') }}
          className="border border-yellow-600/40 text-yellow-600/60 px-8 py-3 tracking-widest text-xs hover:border-yellow-600 hover:text-yellow-600 transition-all rounded-xl slide-up-3"
        >
          {lang === 'he' ? '+ הזמן עוד' : lang === 'fr' ? '+ COMMANDER ENCORE' : '+ ORDER MORE'}
        </button>
      </div>
    </div>
  )

  const currentCategory = restaurant.categories?.find((c: any) => c.id === selectedCategory)

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative" dir={lang === 'he' ? 'rtl' : 'ltr'}>

      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.03]">
        <svg viewBox="0 0 400 400" className="w-96 h-96" fill="none">
          <circle cx="200" cy="200" r="190" stroke="#B8860B" strokeWidth="2"/>
          <circle cx="200" cy="200" r="170" stroke="#B8860B" strokeWidth="1"/>
          <text x="200" y="180" textAnchor="middle" fill="#B8860B" fontSize="80" fontFamily="Georgia, serif" fontWeight="bold">{restaurant.name?.charAt(0)}</text>
          <text x="200" y="240" textAnchor="middle" fill="#B8860B" fontSize="22" fontFamily="Georgia, serif" letterSpacing="12">{restaurant.name?.toUpperCase()}</text>
          <line x1="80" y1="290" x2="320" y2="290" stroke="#B8860B" strokeWidth="1"/>
        </svg>
      </div>

      <div className="bg-black border-b border-yellow-900/30 px-6 py-5 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-wide">{restaurant.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {(['he', 'en', 'fr'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`text-xs px-2 py-1 rounded-full border transition-all ${lang === l ? 'border-yellow-600 text-yellow-600' : 'border-gray-700 text-gray-400 hover:border-yellow-600 hover:text-yellow-600'}`}
                >
                  {l === 'he' ? 'עב' : l === 'en' ? 'EN' : 'FR'}
                </button>
              ))}
            </div>
            {cart.length > 0 && (
              <button onClick={() => setShowCart(true)} className="bg-yellow-600 text-black px-4 py-2 rounded-full flex items-center gap-2 font-bold text-sm">
                <span>🛒</span>
                <span>{totalItems}</span>
                <span>{totalAmount}₪</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-black border-b border-yellow-900/20 px-4 py-3 flex gap-3 overflow-x-auto relative z-10">
        {restaurant.categories?.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex-shrink-0 px-5 py-2 text-sm tracking-widest transition-all ${selectedCategory === cat.id ? 'bg-yellow-600 text-black font-bold' : 'border border-gray-700 text-gray-400 hover:border-yellow-600 hover:text-yellow-600'}`}
          >
            {getName(cat).toUpperCase()}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3 pb-32 relative z-10">
        {currentCategory?.products?.map((product: any) => (
          <div
            key={product.id}
            onClick={() => { setSelectedProduct(product); setProductOptions({ removed: [], added: [] }); setQuantity(1) }}
            className="bg-zinc-900 border border-zinc-800 hover:border-yellow-900/50 transition-all cursor-pointer group rounded-2xl overflow-hidden"
          >
            <div className="flex gap-4 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-base">{getName(product)}</h3>
                  <span className="text-yellow-600 font-bold text-lg mr-4 flex-shrink-0">{product.price}₪</span>
                </div>
                {getDesc(product) && <p className="text-gray-500 text-sm line-clamp-2">{getDesc(product)}</p>}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-yellow-600/60 text-xs tracking-widest">{lang === 'he' ? 'לחץ לפרטים' : lang === 'fr' ? 'Appuyer pour détails' : 'TAP FOR DETAILS'}</span>
                  <div className="flex-1 h-px bg-yellow-900/20"></div>
                  <div className="w-7 h-7 border border-yellow-600/40 group-hover:border-yellow-600 group-hover:bg-yellow-600 transition-all flex items-center justify-center rounded-lg">
                    <span className="text-yellow-600 group-hover:text-black font-bold">+</span>
                  </div>
                </div>
              </div>
              {product.image && <img src={product.image} className="w-24 h-24 object-cover flex-shrink-0 rounded-xl" />}
            </div>
          </div>
        ))}

        <div className="flex items-center justify-center gap-1.5 pt-4 pb-1 opacity-50">
          <img src="/logo.png" alt="Click2Eat" className="w-4 h-4 rounded" />
          <span className="text-[11px] tracking-widest text-gray-400">
            {lang === 'he' ? 'מופעל על ידי Click2Eat' : lang === 'fr' ? 'Propulsé par Click2Eat' : 'Powered by Click2Eat'}
          </span>
        </div>
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-40">
          <button onClick={() => setShowCart(true)} className="w-full bg-yellow-600 text-black py-4 px-6 font-bold tracking-widest flex items-center justify-between rounded-xl">
            <div className="bg-black/20 w-8 h-8 flex items-center justify-center text-sm font-bold rounded-lg">{totalItems}</div>
            <span>{lang === 'he' ? 'צפה בסל' : lang === 'fr' ? 'VOIR LE PANIER' : 'VIEW CART'}</span>
            <span>{totalAmount}₪</span>
          </button>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-end" onClick={() => setSelectedProduct(null)}>
          <div className="bg-zinc-950 border-t border-yellow-900/30 w-full max-h-[92vh] overflow-y-auto rounded-t-3xl" onClick={(e) => e.stopPropagation()}>
            {selectedProduct.image && (
              <div className="relative">
                <img src={selectedProduct.image} className="w-full h-52 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent"></div>
                <button onClick={() => setSelectedProduct(null)} className="absolute top-4 left-4 w-8 h-8 bg-black/70 flex items-center justify-center text-white border border-gray-700 rounded-lg">×</button>
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-2xl font-bold">{getName(selectedProduct)}</h2>
                <span className="text-yellow-600 font-bold text-2xl">{selectedProduct.price}₪</span>
              </div>
              {getDesc(selectedProduct) && <p className="text-gray-400 text-sm mb-6 leading-relaxed">{getDesc(selectedProduct)}</p>}

              {selectedProduct.options?.filter((o: any) => o.type === 'INCLUDED').length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px flex-1 bg-yellow-900/30"></div>
                    <p className="text-yellow-600 text-xs tracking-widest">{lang === 'he' ? 'הרכב הבסיסי' : lang === 'fr' ? 'COMPOSITION' : 'COMPOSITION'}</p>
                    <div className="h-px flex-1 bg-yellow-900/30"></div>
                  </div>
                  <p className="text-gray-500 text-xs mb-3 text-center">{lang === 'he' ? 'לחץ להסרה' : lang === 'fr' ? 'Appuyer pour retirer' : 'Tap to remove'}</p>
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
                          className={`px-3 py-2 text-sm border transition-all rounded-xl ${isRemoved ? 'border-red-800 bg-red-900/20 text-red-400 line-through' : 'border-zinc-700 text-gray-300 hover:border-yellow-600'}`}
                        >
                          {getName(opt)}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {selectedProduct.options?.filter((o: any) => o.type === 'EXTRA').length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px flex-1 bg-yellow-900/30"></div>
                    <p className="text-yellow-600 text-xs tracking-widest">{lang === 'he' ? 'תוספות' : 'EXTRAS'}</p>
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
                          className={`w-full flex items-center justify-between px-4 py-3 border transition-all rounded-xl ${isAdded ? 'border-yellow-600 bg-yellow-900/20 text-yellow-400' : 'border-zinc-800 text-gray-300 hover:border-yellow-600/50'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 border flex items-center justify-center transition-all rounded ${isAdded ? 'border-yellow-600 bg-yellow-600' : 'border-gray-600'}`}>
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

              <div className="flex items-center justify-between mb-6 border border-zinc-800 p-4 rounded-xl">
                <span className="text-gray-400 tracking-widest text-sm">{lang === 'he' ? 'כמות' : 'QUANTITY'}</span>
                <div className="flex items-center gap-6">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 border border-zinc-700 flex items-center justify-center text-xl hover:border-yellow-600 transition-all rounded-xl">−</button>
                  <span className="font-bold text-xl w-6 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 bg-yellow-600 flex items-center justify-center text-xl text-black font-bold rounded-xl">+</button>
                </div>
              </div>

              <button onClick={addToCart} className="w-full bg-yellow-600 text-black py-4 font-bold tracking-widest text-sm rounded-xl">
                {lang === 'he' ? 'הוסף לסל' : lang === 'fr' ? 'AJOUTER AU PANIER' : 'ADD TO CART'} — {((selectedProduct.price + productOptions.added.reduce((sum: number, o: any) => sum + o.price, 0)) * quantity).toFixed(0)}₪
              </button>
            </div>
          </div>
        </div>
      )}

      {showCart && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-end">
          <div className="bg-zinc-950 border-t border-yellow-900/30 w-full max-h-[90vh] overflow-y-auto rounded-t-3xl">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-lg font-bold tracking-widest">{lang === 'he' ? 'הסל שלי' : lang === 'fr' ? 'MON PANIER' : 'MY ORDER'}</h2>
              <button onClick={() => setShowCart(false)} className="w-8 h-8 border border-gray-700 flex items-center justify-center text-gray-400 rounded-lg">×</button>
            </div>
            <div className="p-6 space-y-3 border-b border-zinc-800">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-start border-b border-zinc-900 pb-3">
                  <div className="flex-1">
                    <span className="font-bold text-sm">{item.quantity}× {item.productName}</span>
                    {item.selectedOptions?.removed?.length > 0 && <p className="text-red-400 text-xs mt-1">{lang === 'he' ? 'ללא' : 'Sans'}: {item.selectedOptions.removed.join(', ')}</p>}
                    {item.selectedOptions?.added?.length > 0 && <p className="text-yellow-600 text-xs mt-1">{lang === 'he' ? 'תוספות' : 'Extras'}: {item.selectedOptions.added.join(', ')}</p>}
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
                placeholder={lang === 'he' ? 'הערות מיוחדות...' : lang === 'fr' ? 'Remarques spéciales...' : 'Special requests...'}
                className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 text-sm outline-none resize-none h-16 mb-6 focus:border-yellow-600/50 transition-all rounded-xl"
              />
              <div className="flex justify-between mb-6">
                <span className="tracking-widest text-sm text-gray-400">{lang === 'he' ? 'סה"כ' : 'TOTAL'}</span>
                <span className="text-yellow-600 font-bold text-2xl">{totalAmount}₪</span>
              </div>
              {orderError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm text-center mb-4">
                  {orderError}
                </div>
              )}
              <button onClick={placeOrder} className="w-full bg-yellow-600 text-black py-4 font-bold tracking-widest text-sm rounded-xl">
                {lang === 'he' ? 'שלח הזמנה' : lang === 'fr' ? 'ENVOYER LA COMMANDE' : 'PLACE ORDER'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}