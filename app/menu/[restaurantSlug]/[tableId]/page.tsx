'use client'

import { useState, useEffect, type CSSProperties } from 'react'
import { useParams } from 'next/navigation'

const THEME = {
  DARK: {
    bg: 'bg-zinc-950',
    text: 'text-white',
    headerBg: 'bg-black',
    headerBorder: 'border-[var(--accent)]/20',
    cardBg: 'bg-zinc-900',
    cardBorder: 'border-zinc-800',
    cardHoverBorder: 'hover:border-[var(--accent)]/40',
    sheetBg: 'bg-zinc-950',
    sheetBorder: 'border-[var(--accent)]/20',
    subtleBg: 'bg-zinc-900/50',
    divider: 'border-zinc-800',
    inputBg: 'bg-zinc-900',
    inputBorder: 'border-zinc-800',
    muted: 'text-gray-500',
    mutedBorder: 'border-gray-700',
    dividerBg: 'bg-zinc-800',
    watermarkOpacity: 'opacity-[0.035]',
    overlay: 'bg-black/95',
  },
  LIGHT: {
    bg: 'bg-white',
    text: 'text-zinc-900',
    headerBg: 'bg-white',
    headerBorder: 'border-[var(--accent)]/30',
    cardBg: 'bg-gray-50',
    cardBorder: 'border-gray-200',
    cardHoverBorder: 'hover:border-[var(--accent)]/60',
    sheetBg: 'bg-white',
    sheetBorder: 'border-gray-200',
    subtleBg: 'bg-gray-50',
    divider: 'border-gray-200',
    inputBg: 'bg-gray-100',
    inputBorder: 'border-gray-200',
    muted: 'text-gray-500',
    mutedBorder: 'border-gray-300',
    dividerBg: 'bg-gray-200',
    watermarkOpacity: 'opacity-[0.05]',
    overlay: 'bg-black/60',
  },
}

const FONT_CLASS: any = {
  SERIF: 'font-serif',
  SANS: 'font-sans',
  ROUNDED: '',
}
const FONT_STYLE: any = {
  ROUNDED: { fontFamily: 'ui-rounded, "Segoe UI Rounded", system-ui, sans-serif' },
}

const RADIUS = {
  ROUNDED: { sm: 'rounded-lg', md: 'rounded-xl', lg: 'rounded-2xl', full: 'rounded-full', top: 'rounded-t-3xl' },
  SHARP: { sm: 'rounded-none', md: 'rounded-none', lg: 'rounded-none', full: 'rounded-md', top: 'rounded-none' },
}

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.2" cy="6.8" r="1"/>
  </svg>
)
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
    <path d="M15 3h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h3V3z"/>
  </svg>
)

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
  const [waiterCallLoading, setWaiterCallLoading] = useState(false)
  const [waiterCallSent, setWaiterCallSent] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'default' | 'asc' | 'desc'>('default')

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

  const callWaiter = async () => {
    if (waiterCallSent || waiterCallLoading || !restaurant?.id) return
    setWaiterCallLoading(true)
    try {
      await fetch('/api/waiter-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId: restaurant.id, tableId }),
      })
      setWaiterCallSent(true)
      setTimeout(() => setWaiterCallSent(false), 120000)
    } catch (err) {
      console.error(err)
    } finally {
      setWaiterCallLoading(false)
    }
  }

  const themeKey = restaurant?.theme === 'LIGHT' ? 'LIGHT' : 'DARK'
  const T = THEME[themeKey]
  const cornerKey = restaurant?.cornerStyle === 'SHARP' ? 'SHARP' : 'ROUNDED'
  const R = RADIUS[cornerKey]
  const layout = restaurant?.layoutStyle === 'GRID' || restaurant?.layoutStyle === 'MAGAZINE' ? restaurant.layoutStyle : 'COMPACT'
  const accent = restaurant?.primaryColor || '#B8860B'
  const fontClass = FONT_CLASS[restaurant?.fontStyle] || 'font-serif'
  const fontStyle = FONT_STYLE[restaurant?.fontStyle] || {}
  const cssVars = { '--accent': accent } as CSSProperties

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  if (!restaurant || restaurant.error) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-white">מסעדה לא נמצאה</p>
    </div>
  )

  if (sending) return (
    <div className={`min-h-screen ${T.bg} ${T.text} flex items-center justify-center`} style={cssVars} dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes spinRing { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulseText { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .spin-ring { animation: spinRing 1s linear infinite; }
        .pulse-text { animation: pulseText 1.5s ease-in-out infinite; }
      `}</style>
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <svg className="w-24 h-24 spin-ring" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" strokeWidth="3" strokeDasharray="70 210" strokeLinecap="round"/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl">🍽️</span>
          </div>
        </div>
        <p className="tracking-widest text-sm pulse-text" style={{ color: 'var(--accent)' }}>
          {lang === 'he' ? 'שולח הזמנה...' : lang === 'fr' ? 'Envoi en cours...' : 'Sending order...'}
        </p>
      </div>
    </div>
  )

  if (showSuccess) return (
    <div className={`min-h-screen ${T.bg} ${T.text} flex items-center justify-center p-6`} style={cssVars} dir={lang === 'he' ? 'rtl' : 'ltr'}>
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
            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.5"/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-24 h-24 border-2 ${R.full} flex items-center justify-center scale-in`} style={{ borderColor: 'var(--accent)' }}>
              <svg className="w-10 h-10" style={{ color: 'var(--accent)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
        </div>

        <p className="tracking-widest text-xs mb-3 slide-up-1" style={{ color: 'var(--accent)' }}>{restaurant.name}</p>
        <h2 className={`text-2xl font-bold mb-2 slide-up-1 ${T.text}`}>
          {lang === 'he' ? 'ההזמנה בדרך!' : lang === 'fr' ? 'Commande envoyée !' : 'Order on its way!'}
        </h2>

        <div className={`border ${T.sheetBorder} ${T.subtleBg} ${R.lg} p-4 mb-6 slide-up-2`}>
          <p className={`${T.muted} text-xs tracking-widest mb-1`}>
            {lang === 'he' ? 'מספר הזמנה' : lang === 'fr' ? 'N° de commande' : 'Order number'}
          </p>
          <p className="font-bold text-5xl" style={{ color: 'var(--accent)' }}>#{orderNumber}</p>
        </div>

        <div className={`border ${T.divider} ${T.subtleBg} ${R.lg} p-5 mb-6 slide-up-3`}>
          <p className={`${T.muted} text-xs tracking-widest mb-4`}>
            {lang === 'he' ? 'סטטוס הזמנה' : lang === 'fr' ? 'STATUT' : 'STATUS'}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 ${R.full} flex items-center justify-center text-black font-bold`} style={{ backgroundColor: 'var(--accent)' }}>✓</div>
              <span className="text-xs" style={{ color: 'var(--accent)' }}>{lang === 'he' ? 'התקבל' : lang === 'fr' ? 'Reçu' : 'Received'}</span>
            </div>
            <div className={`flex-1 h-px mx-2 transition-all duration-500 ${['ACCEPTED', 'PREPARING', 'READY', 'DONE'].includes(orderStatus) ? '' : T.dividerBg}`} style={{ backgroundColor: ['ACCEPTED', 'PREPARING', 'READY', 'DONE'].includes(orderStatus) ? 'var(--accent)' : undefined }}></div>
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 ${R.full} flex items-center justify-center transition-all duration-500 ${['ACCEPTED', 'PREPARING', 'READY', 'DONE'].includes(orderStatus) ? 'text-black font-bold' : `border ${T.mutedBorder} text-zinc-500`}`}
                style={['ACCEPTED', 'PREPARING', 'READY', 'DONE'].includes(orderStatus) ? { backgroundColor: 'var(--accent)' } : {}}
              >
                {['ACCEPTED', 'PREPARING', 'READY', 'DONE'].includes(orderStatus) ? '✓' : '2'}
              </div>
              <span className={`text-xs ${['ACCEPTED', 'PREPARING', 'READY', 'DONE'].includes(orderStatus) ? '' : T.muted}`} style={['ACCEPTED', 'PREPARING', 'READY', 'DONE'].includes(orderStatus) ? { color: 'var(--accent)' } : {}}>{lang === 'he' ? 'אושר' : lang === 'fr' ? 'Accepté' : 'Accepted'}</span>
            </div>
            <div className={`flex-1 h-px mx-2 transition-all duration-500 ${['PREPARING', 'READY', 'DONE'].includes(orderStatus) ? '' : T.dividerBg}`} style={{ backgroundColor: ['PREPARING', 'READY', 'DONE'].includes(orderStatus) ? 'var(--accent)' : undefined }}></div>
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 ${R.full} flex items-center justify-center transition-all duration-500 ${['PREPARING', 'READY', 'DONE'].includes(orderStatus) ? 'text-black pulse-anim' : `border ${T.mutedBorder} text-zinc-500`}`}
                style={['PREPARING', 'READY', 'DONE'].includes(orderStatus) ? { backgroundColor: 'var(--accent)' } : {}}
              >
                {['PREPARING', 'READY', 'DONE'].includes(orderStatus) ? '🔥' : '3'}
              </div>
              <span className={`text-xs ${['PREPARING', 'READY', 'DONE'].includes(orderStatus) ? '' : T.muted}`} style={['PREPARING', 'READY', 'DONE'].includes(orderStatus) ? { color: 'var(--accent)' } : {}}>{lang === 'he' ? 'בהכנה' : lang === 'fr' ? 'En prépa' : 'Preparing'}</span>
            </div>
            <div className={`flex-1 h-px mx-2 transition-all duration-500 ${['READY', 'DONE'].includes(orderStatus) ? 'bg-green-600' : T.dividerBg}`}></div>
            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 ${R.full} flex items-center justify-center transition-all duration-500 ${['READY', 'DONE'].includes(orderStatus) ? 'bg-green-600 text-white pulse-anim' : `border ${T.mutedBorder} text-zinc-500`}`}>
                {['READY', 'DONE'].includes(orderStatus) ? '🍽️' : '4'}
              </div>
              <span className={`text-xs ${['READY', 'DONE'].includes(orderStatus) ? 'text-green-500' : T.muted}`}>{lang === 'he' ? 'מוכן!' : lang === 'fr' ? 'Prêt!' : 'Ready!'}</span>
            </div>
          </div>

          <div className="mt-4 text-center">
            {orderStatus === 'NEW' && <p className={`${T.muted} text-xs animate-pulse`}>{lang === 'he' ? 'ממתין לאישור...' : lang === 'fr' ? 'En attente...' : 'Waiting for confirmation...'}</p>}
            {orderStatus === 'ACCEPTED' && <p className="text-xs" style={{ color: 'var(--accent)' }}>{lang === 'he' ? '✓ ההזמנה אושרה!' : lang === 'fr' ? '✓ Commande acceptée !' : '✓ Order accepted!'}</p>}
            {orderStatus === 'PREPARING' && <p className="text-xs animate-pulse" style={{ color: 'var(--accent)' }}>{lang === 'he' ? '🔥 המנות שלך בהכנה...' : lang === 'fr' ? '🔥 En préparation...' : '🔥 Preparing your dishes...'}</p>}
            {orderStatus === 'READY' && <p className="text-green-400 text-sm font-bold animate-pulse">{lang === 'he' ? '🍽️ ההזמנה מוכנה!' : lang === 'fr' ? '🍽️ Commande prête !' : '🍽️ Order is ready!'}</p>}
            {orderStatus === 'DONE' && <p className="text-green-400 text-xs">{lang === 'he' ? '✓ תיאבון!' : lang === 'fr' ? '✓ Bon appétit !' : '✓ Enjoy your meal!'}</p>}
          </div>
        </div>

        <button
          onClick={() => { setShowSuccess(false); setOrderId(null); setOrderStatus('NEW') }}
          className={`border px-8 py-3 tracking-widest text-xs transition-all ${R.md} slide-up-3`}
          style={{ borderColor: 'var(--accent)', color: 'var(--accent)', opacity: 0.7 }}
        >
          {lang === 'he' ? '+ הזמן עוד' : lang === 'fr' ? '+ COMMANDER ENCORE' : '+ ORDER MORE'}
        </button>
      </div>
    </div>
  )

  const currentCategory = restaurant.categories?.find((c: any) => c.id === selectedCategory)
  const isSearching = searchQuery.trim().length > 0

  const allProductsFlat = (restaurant.categories || []).flatMap((cat: any) =>
    (cat.products || []).map((p: any) => ({ ...p, categoryName: getName(cat) }))
  )

  const sortProducts = (list: any[]) => {
    if (sortBy === 'asc') return [...list].sort((a, b) => a.price - b.price)
    if (sortBy === 'desc') return [...list].sort((a, b) => b.price - a.price)
    return list
  }

  const searchResults = isSearching
    ? allProductsFlat.filter((p: any) => {
        const q = searchQuery.trim().toLowerCase()
        return (
          getName(p)?.toLowerCase().includes(q) ||
          getDesc(p)?.toLowerCase().includes(q)
        )
      })
    : []

  const productsToShow = isSearching ? sortProducts(searchResults) : sortProducts(currentCategory?.products || [])

  return (
    <div className={`min-h-screen ${T.bg} ${T.text} ${fontClass} relative`} style={{ ...cssVars, ...fontStyle }} dir={lang === 'he' ? 'rtl' : 'ltr'}>

      {!restaurant.coverImage && (
        <div className={`fixed inset-0 flex items-center justify-center pointer-events-none z-0 ${T.watermarkOpacity}`}>
          <svg viewBox="0 0 400 400" className="w-96 h-96" fill="none">
            <circle cx="200" cy="200" r="190" stroke="var(--accent)" strokeWidth="2"/>
            <circle cx="200" cy="200" r="170" stroke="var(--accent)" strokeWidth="1"/>
            <text x="200" y="180" textAnchor="middle" fill="var(--accent)" fontSize="80" fontFamily="Georgia, serif" fontWeight="bold">{restaurant.name?.charAt(0)}</text>
            <text x="200" y="240" textAnchor="middle" fill="var(--accent)" fontSize="22" fontFamily="Georgia, serif" letterSpacing="12">{restaurant.name?.toUpperCase()}</text>
            <line x1="80" y1="290" x2="320" y2="290" stroke="var(--accent)" strokeWidth="1"/>
          </svg>
        </div>
      )}

      {restaurant.coverImage && (
        <div className="relative h-40 md:h-56 w-full overflow-hidden">
          <img src={restaurant.coverImage} alt={restaurant.name} className="w-full h-full object-cover" />
          <div className={`absolute inset-0 bg-gradient-to-t ${themeKey === 'LIGHT' ? 'from-white via-white/20' : 'from-zinc-950 via-zinc-950/20'} to-transparent`}></div>
        </div>
      )}

      <div className={`${T.headerBg} border-b ${T.headerBorder} px-6 py-5 relative z-10`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {restaurant.logo && (
              <img src={restaurant.logo} alt={restaurant.name} className={`w-10 h-10 ${R.sm} object-cover flex-shrink-0`} />
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-wide">{restaurant.name}</h1>
              {restaurant.tagline && <p className={`text-xs ${T.muted}`}>{restaurant.tagline}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={callWaiter}
              disabled={waiterCallSent || waiterCallLoading}
              className={`text-xs px-3 py-2 ${R.full} border transition-all flex items-center gap-1 disabled:opacity-70`}
              style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
            >
              <span>🛎️</span>
              <span className="hidden sm:inline">
                {waiterCallSent
                  ? (lang === 'he' ? 'נשלח!' : lang === 'fr' ? 'Envoyé !' : 'Sent!')
                  : (lang === 'he' ? 'קרא למלצר' : lang === 'fr' ? 'Appeler le serveur' : 'Call waiter')}
              </span>
            </button>
            <div className="flex gap-1">
              {(['he', 'en', 'fr'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`text-xs px-2 py-1 ${R.full} border transition-all ${T.mutedBorder} ${T.muted}`}
                  style={lang === l ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}
                >
                  {l === 'he' ? 'עב' : l === 'en' ? 'EN' : 'FR'}
                </button>
              ))}
            </div>
            {cart.length > 0 && (
              <button onClick={() => setShowCart(true)} className={`text-black px-4 py-2 ${R.full} flex items-center gap-2 font-bold text-sm`} style={{ backgroundColor: 'var(--accent)' }}>
                <span>🛒</span>
                <span>{totalItems}</span>
                <span>{totalAmount}₪</span>
              </button>
            )}
          </div>
        </div>

        {(restaurant.openingHours || restaurant.instagramUrl || restaurant.facebookUrl) && (
          <div className={`flex items-center justify-between mt-3 pt-3 border-t ${T.divider}`}>
            {restaurant.openingHours ? (
              <p className={`text-xs ${T.muted}`}>🕒 {restaurant.openingHours}</p>
            ) : <span />}
            {(restaurant.instagramUrl || restaurant.facebookUrl) && (
              <div className="flex items-center gap-3">
                {restaurant.instagramUrl && (
                  <a href={restaurant.instagramUrl} target="_blank" rel="noopener noreferrer" className={T.muted}>
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                )}
                {restaurant.facebookUrl && (
                  <a href={restaurant.facebookUrl} target="_blank" rel="noopener noreferrer" className={T.muted}>
                    <FacebookIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={`${T.headerBg} border-b ${T.headerBorder} px-4 py-3 flex gap-3 overflow-x-auto relative z-10`}>
        {restaurant.categories?.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => { setSelectedCategory(cat.id); setSearchQuery('') }}
            className={`flex-shrink-0 px-5 py-2 text-sm tracking-widest transition-all ${R.md} ${!isSearching && selectedCategory === cat.id ? 'text-black font-bold' : `border ${T.mutedBorder} ${T.muted}`}`}
            style={!isSearching && selectedCategory === cat.id ? { backgroundColor: 'var(--accent)' } : {}}
          >
            {getName(cat).toUpperCase()}
          </button>
        ))}
      </div>

      <div className={`${T.headerBg} border-b ${T.headerBorder} px-4 py-3 flex gap-2 relative z-10`}>
        <div className={`flex-1 flex items-center gap-2 ${T.inputBg} border ${T.inputBorder} px-3 ${R.md}`}>
          <span className={T.muted}>🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'he' ? 'חיפוש מנה...' : lang === 'fr' ? 'Rechercher un plat...' : 'Search a dish...'}
            className={`flex-1 bg-transparent ${T.text} py-2 text-sm outline-none`}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className={T.muted}>×</button>
          )}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'default' | 'asc' | 'desc')}
          className={`${T.inputBg} border ${T.inputBorder} ${T.text} text-xs px-2 ${R.md} outline-none`}
        >
          <option value="default">{lang === 'he' ? 'מיון' : lang === 'fr' ? 'Trier' : 'Sort'}</option>
          <option value="asc">{lang === 'he' ? 'מחיר: נמוך לגבוה' : lang === 'fr' ? 'Prix croissant' : 'Price: low to high'}</option>
          <option value="desc">{lang === 'he' ? 'מחיר: גבוה לנמוך' : lang === 'fr' ? 'Prix décroissant' : 'Price: high to low'}</option>
        </select>
      </div>

      <div className="p-4 pb-32 relative z-10">
        {isSearching && (
          <p className={`${T.muted} text-xs mb-3`}>
            {productsToShow.length === 0
              ? (lang === 'he' ? 'לא נמצאו תוצאות' : lang === 'fr' ? 'Aucun résultat trouvé' : 'No results found')
              : (lang === 'he' ? `${productsToShow.length} תוצאות` : lang === 'fr' ? `${productsToShow.length} résultat(s)` : `${productsToShow.length} result(s)`)}
          </p>
        )}
        <div className={layout === 'GRID' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
          {productsToShow.map((product: any) => {
            const openProduct = () => { setSelectedProduct(product); setProductOptions({ removed: [], added: [] }); setQuantity(1) }

            if (layout === 'GRID') {
              return (
                <div
                  key={product.id}
                  onClick={openProduct}
                  className={`${T.cardBg} border ${T.cardBorder} ${T.cardHoverBorder} transition-all cursor-pointer group ${R.lg} overflow-hidden`}
                >
                  <div className="aspect-square w-full overflow-hidden">
                    {product.image ? (
                      <img src={product.image} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-3xl ${T.subtleBg}`}>🍽️</div>
                    )}
                  </div>
                  <div className="p-3">
                    {isSearching && product.categoryName && (
                      <p className="text-[9px] tracking-widest mb-1" style={{ color: 'var(--accent)', opacity: 0.7 }}>{product.categoryName.toUpperCase()}</p>
                    )}
                    <h3 className="font-bold text-sm truncate">{getName(product)}</h3>
                    <span className="font-bold text-sm" style={{ color: 'var(--accent)' }}>{product.price}₪</span>
                  </div>
                </div>
              )
            }

            if (layout === 'MAGAZINE') {
              return (
                <div
                  key={product.id}
                  onClick={openProduct}
                  className={`${T.cardBg} border ${T.cardBorder} ${T.cardHoverBorder} transition-all cursor-pointer group ${R.lg} overflow-hidden mb-4`}
                >
                  <div className="w-full aspect-[16/9] overflow-hidden">
                    {product.image ? (
                      <img src={product.image} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-4xl ${T.subtleBg}`}>🍽️</div>
                    )}
                  </div>
                  <div className="p-4">
                    {isSearching && product.categoryName && (
                      <p className="text-[10px] tracking-widest mb-1" style={{ color: 'var(--accent)', opacity: 0.7 }}>{product.categoryName.toUpperCase()}</p>
                    )}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg">{getName(product)}</h3>
                      <span className="font-bold text-lg mr-4 flex-shrink-0" style={{ color: 'var(--accent)' }}>{product.price}₪</span>
                    </div>
                    {getDesc(product) && <p className={`${T.muted} text-sm line-clamp-2`}>{getDesc(product)}</p>}
                  </div>
                </div>
              )
            }

            return (
              <div
                key={product.id}
                onClick={openProduct}
                className={`${T.cardBg} border ${T.cardBorder} ${T.cardHoverBorder} transition-all cursor-pointer group ${R.lg} overflow-hidden`}
              >
                <div className="flex gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    {isSearching && product.categoryName && (
                      <p className="text-[10px] tracking-widest mb-1" style={{ color: 'var(--accent)', opacity: 0.7 }}>{product.categoryName.toUpperCase()}</p>
                    )}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-base">{getName(product)}</h3>
                      <span className="font-bold text-lg mr-4 flex-shrink-0" style={{ color: 'var(--accent)' }}>{product.price}₪</span>
                    </div>
                    {getDesc(product) && <p className={`${T.muted} text-sm line-clamp-2`}>{getDesc(product)}</p>}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs tracking-widest" style={{ color: 'var(--accent)', opacity: 0.7 }}>{lang === 'he' ? 'לחץ לפרטים' : lang === 'fr' ? 'Appuyer pour détails' : 'TAP FOR DETAILS'}</span>
                      <div className="flex-1 h-px" style={{ backgroundColor: 'var(--accent)', opacity: 0.2 }}></div>
                      <div className={`w-7 h-7 border group-hover:text-black transition-all flex items-center justify-center ${R.sm}`} style={{ borderColor: 'var(--accent)' }}>
                        <span className="font-bold group-hover:text-black" style={{ color: 'var(--accent)' }}>+</span>
                      </div>
                    </div>
                  </div>
                  {product.image && <img src={product.image} className={`w-24 h-24 object-cover flex-shrink-0 ${R.md}`} />}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-center gap-1.5 pt-4 pb-1 opacity-50">
          <img src="/logo.png" alt="Click2Eat" className="w-4 h-4 rounded" />
          <span className={`text-[11px] tracking-widest ${T.muted}`}>
            {lang === 'he' ? 'מופעל על ידי Click2Eat' : lang === 'fr' ? 'Propulsé par Click2Eat' : 'Powered by Click2Eat'}
          </span>
        </div>
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-40">
          <button onClick={() => setShowCart(true)} className={`w-full text-black py-4 px-6 font-bold tracking-widest flex items-center justify-between ${R.md}`} style={{ backgroundColor: 'var(--accent)' }}>
            <div className={`bg-black/20 w-8 h-8 flex items-center justify-center text-sm font-bold ${R.sm}`}>{totalItems}</div>
            <span>{lang === 'he' ? 'צפה בסל' : lang === 'fr' ? 'VOIR LE PANIER' : 'VIEW CART'}</span>
            <span>{totalAmount}₪</span>
          </button>
        </div>
      )}

      {selectedProduct && (
        <div className={`fixed inset-0 ${T.overlay} z-50 flex items-end`} onClick={() => setSelectedProduct(null)}>
          <div className={`${T.sheetBg} border-t ${T.sheetBorder} w-full max-h-[92vh] overflow-y-auto ${R.top}`} onClick={(e) => e.stopPropagation()}>
            {selectedProduct.image && (
              <div className="relative">
                <img src={selectedProduct.image} className="w-full h-52 object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-t ${themeKey === 'LIGHT' ? 'from-white via-white/50' : 'from-zinc-950 via-zinc-950/50'} to-transparent`}></div>
                <button onClick={() => setSelectedProduct(null)} className={`absolute top-4 left-4 w-8 h-8 ${T.overlay} flex items-center justify-center text-white border ${T.mutedBorder} ${R.sm}`}>×</button>
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-2xl font-bold">{getName(selectedProduct)}</h2>
                <span className="font-bold text-2xl" style={{ color: 'var(--accent)' }}>{selectedProduct.price}₪</span>
              </div>
              {getDesc(selectedProduct) && <p className={`${T.muted} text-sm mb-6 leading-relaxed`}>{getDesc(selectedProduct)}</p>}

              {selectedProduct.options?.filter((o: any) => o.type === 'INCLUDED').length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px flex-1" style={{ backgroundColor: 'var(--accent)', opacity: 0.3 }}></div>
                    <p className="text-xs tracking-widest" style={{ color: 'var(--accent)' }}>{lang === 'he' ? 'הרכב הבסיסי' : lang === 'fr' ? 'COMPOSITION' : 'COMPOSITION'}</p>
                    <div className="h-px flex-1" style={{ backgroundColor: 'var(--accent)', opacity: 0.3 }}></div>
                  </div>
                  <p className={`${T.muted} text-xs mb-3 text-center`}>{lang === 'he' ? 'לחץ להסרה' : lang === 'fr' ? 'Appuyer pour retirer' : 'Tap to remove'}</p>
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
                          className={`px-3 py-2 text-sm border transition-all ${R.md} ${isRemoved ? 'border-red-800 bg-red-900/20 text-red-400 line-through' : `${T.cardBorder} ${T.muted}`}`}
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
                    <div className="h-px flex-1" style={{ backgroundColor: 'var(--accent)', opacity: 0.3 }}></div>
                    <p className="text-xs tracking-widest" style={{ color: 'var(--accent)' }}>{lang === 'he' ? 'תוספות' : 'EXTRAS'}</p>
                    <div className="h-px flex-1" style={{ backgroundColor: 'var(--accent)', opacity: 0.3 }}></div>
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
                          className={`w-full flex items-center justify-between px-4 py-3 border transition-all ${R.md} ${isAdded ? '' : `${T.cardBorder} ${T.muted}`}`}
                          style={isAdded ? { borderColor: 'var(--accent)', backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' } : {}}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 border flex items-center justify-center transition-all ${R.sm} ${isAdded ? '' : T.mutedBorder}`} style={isAdded ? { borderColor: 'var(--accent)', backgroundColor: 'var(--accent)' } : {}}>
                              {isAdded && <span className="text-black text-xs font-bold">✓</span>}
                            </div>
                            <span className="text-sm">{getName(opt)}</span>
                          </div>
                          <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>+{opt.price}₪</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className={`flex items-center justify-between mb-6 border ${T.cardBorder} p-4 ${R.md}`}>
                <span className={`${T.muted} tracking-widest text-sm`}>{lang === 'he' ? 'כמות' : 'QUANTITY'}</span>
                <div className="flex items-center gap-6">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className={`w-10 h-10 border ${T.cardBorder} flex items-center justify-center text-xl transition-all ${R.md}`}>−</button>
                  <span className="font-bold text-xl w-6 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className={`w-10 h-10 flex items-center justify-center text-xl text-black font-bold ${R.md}`} style={{ backgroundColor: 'var(--accent)' }}>+</button>
                </div>
              </div>

              <button onClick={addToCart} className={`w-full text-black py-4 font-bold tracking-widest text-sm ${R.md}`} style={{ backgroundColor: 'var(--accent)' }}>
                {lang === 'he' ? 'הוסף לסל' : lang === 'fr' ? 'AJOUTER AU PANIER' : 'ADD TO CART'} — {((selectedProduct.price + productOptions.added.reduce((sum: number, o: any) => sum + o.price, 0)) * quantity).toFixed(0)}₪
              </button>
            </div>
          </div>
        </div>
      )}

      {showCart && (
        <div className={`fixed inset-0 ${T.overlay} z-50 flex items-end`}>
          <div className={`${T.sheetBg} border-t ${T.sheetBorder} w-full max-h-[90vh] overflow-y-auto ${R.top}`}>
            <div className={`flex items-center justify-between p-6 border-b ${T.divider}`}>
              <h2 className="text-lg font-bold tracking-widest">{lang === 'he' ? 'הסל שלי' : lang === 'fr' ? 'MON PANIER' : 'MY ORDER'}</h2>
              <button onClick={() => setShowCart(false)} className={`w-8 h-8 border ${T.mutedBorder} flex items-center justify-center ${T.muted} ${R.sm}`}>×</button>
            </div>
            <div className={`p-6 space-y-3 border-b ${T.divider}`}>
              {cart.map((item) => (
                <div key={item.id} className={`flex justify-between items-start border-b ${T.divider} pb-3`}>
                  <div className="flex-1">
                    <span className="font-bold text-sm">{item.quantity}× {item.productName}</span>
                    {item.selectedOptions?.removed?.length > 0 && <p className="text-red-400 text-xs mt-1">{lang === 'he' ? 'ללא' : 'Sans'}: {item.selectedOptions.removed.join(', ')}</p>}
                    {item.selectedOptions?.added?.length > 0 && <p className="text-xs mt-1" style={{ color: 'var(--accent)' }}>{lang === 'he' ? 'תוספות' : 'Extras'}: {item.selectedOptions.added.join(', ')}</p>}
                  </div>
                  <div className="flex items-center gap-3 mr-4">
                    <span className="font-bold" style={{ color: 'var(--accent)' }}>{item.subtotal}₪</span>
                    <button onClick={() => removeFromCart(item.id)} className={`${T.muted} hover:text-red-400 transition-all`}>×</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6">
              <textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder={lang === 'he' ? 'הערות מיוחדות...' : lang === 'fr' ? 'Remarques spéciales...' : 'Special requests...'}
                className={`w-full ${T.inputBg} border ${T.inputBorder} ${T.text} px-4 py-3 text-sm outline-none resize-none h-16 mb-6 transition-all ${R.md}`}
              />
              <div className="flex justify-between mb-6">
                <span className={`tracking-widest text-sm ${T.muted}`}>{lang === 'he' ? 'סה"כ' : 'TOTAL'}</span>
                <span className="font-bold text-2xl" style={{ color: 'var(--accent)' }}>{totalAmount}₪</span>
              </div>
              {orderError && (
                <div className={`bg-red-500/10 border border-red-500/20 ${R.md} p-3 text-red-400 text-sm text-center mb-4`}>
                  {orderError}
                </div>
              )}
              <button onClick={placeOrder} className={`w-full text-black py-4 font-bold tracking-widest text-sm ${R.md}`} style={{ backgroundColor: 'var(--accent)' }}>
                {lang === 'he' ? 'שלח הזמנה' : lang === 'fr' ? 'ENVOYER LA COMMANDE' : 'PLACE ORDER'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}