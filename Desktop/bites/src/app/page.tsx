import { createClient } from '@/lib/supabase/server'
import RestaurantCard from '@/components/public/RestaurantCard'
import RestaurantFilters from '@/components/public/RestaurantFilters'
import InstallPWABanner from '@/components/ui/InstallPWABanner'
import { calculateDistance } from '@/hooks/useGeolocation'

export const dynamic = 'force-dynamic'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; minRating?: string; search?: string; city?: string; nearMe?: string; lat?: string; lng?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query
  let query = supabase
    .from('restaurants')
    .select('*')
    .not('overall_rating', 'is', null)

  if (params.category) {
    query = query.eq('category', params.category)
  }
  if (params.minRating) {
    query = query.gte('overall_rating', parseFloat(params.minRating))
  }
  if (params.search) {
    query = query.ilike('name', `%${params.search}%`)
  }
  if (params.city) {
    query = query.ilike('city', `%${params.city}%`)
  }

  // Default order by rating
  query = query.order('overall_rating', { ascending: false })

  let { data: restaurants } = await query

  // If nearMe, calculate and sort by distance
  if (params.nearMe && params.lat && params.lng && restaurants) {
    const userLat = parseFloat(params.lat)
    const userLng = parseFloat(params.lng)

    // Calculate distance for each restaurant and sort
    restaurants = restaurants
      .filter(r => r.latitude && r.longitude)
      .map(r => ({
        ...r,
        distance: calculateDistance(userLat, userLng, r.latitude, r.longitude)
      }))
      .sort((a, b) => (a.distance || 999) - (b.distance || 999))
  }

  // Get unique categories
  const { data: allRestaurants } = await supabase
    .from('restaurants')
    .select('category')
    .not('overall_rating', 'is', null)

  const categories = [...new Set(allRestaurants?.map((r) => r.category) || [])]


  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
      {/* PWA Install Banner */}
      <InstallPWABanner />

      {/* Hero - Modern Gradient (includes header) */}
      <section className="relative overflow-hidden -mt-[env(safe-area-inset-top)] pt-[env(safe-area-inset-top)]">
        {/* Animated background */}
        <div className="absolute inset-0 -top-20 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500" />
        <div className="absolute inset-0 -top-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

        {/* Floating elements */}
        <div className="absolute top-24 left-10 text-6xl animate-bounce opacity-20">🍕</div>
        <div className="absolute top-32 right-20 text-5xl animate-pulse opacity-20">🍜</div>
        <div className="absolute bottom-10 left-1/4 text-4xl animate-bounce opacity-20" style={{ animationDelay: '0.5s' }}>🍣</div>
        <div className="absolute bottom-20 right-1/4 text-5xl animate-pulse opacity-20" style={{ animationDelay: '1s' }}>🍝</div>

        {/* Header inside gradient */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-[env(safe-area-inset-top,16px)] pb-2 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2 group">
            <img src="/logo.svg" alt="RankBites" className="h-8 brightness-0 invert group-hover:scale-105 transition-transform" />
          </a>
          <a
            href="/login"
            className="text-sm text-white/80 hover:text-white transition-colors font-medium"
          >
            Admin
          </a>
        </div>

        {/* Hero content */}
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Scopri i<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-white">
              Migliori Ristoranti
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-medium">
            Recensioni reali basate su voti di gruppo.<br className="hidden md:block" />
            <span className="text-white/70">Trasparenti, affidabili, senza trucchi.</span>
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-10">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{restaurants?.length || 0}</p>
              <p className="text-sm text-white/70">Ristoranti</p>
            </div>
            <div className="w-px bg-white/30" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{categories.length}</p>
              <p className="text-sm text-white/70">Categorie</p>
            </div>
            <div className="w-px bg-white/30" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white">4+</p>
              <p className="text-sm text-white/70">Categorie Voto</p>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(250 250 249)" />
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 -mt-4 relative z-10">
        {/* Filters */}
        <RestaurantFilters
          categories={categories}
          currentCategory={params.category}
          currentMinRating={params.minRating}
          currentSearch={params.search}
          currentCity={params.city}
          currentNearMe={params.nearMe}
        />

        {/* Restaurant Grid */}
        {restaurants && restaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant, index) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-stone-100 mb-4">
              <span className="text-4xl">🍽️</span>
            </div>
            <p className="text-stone-500 text-lg">Nessun ristorante trovato</p>
            {(params.category || params.minRating || params.search) && (
              <a
                href="/"
                className="inline-block mt-4 text-orange-500 hover:text-orange-600 font-medium bg-orange-50 px-4 py-2 rounded-full transition-colors"
              >
                Rimuovi filtri →
              </a>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <a href="/" className="flex items-center justify-center gap-2 text-lg">
            <img src="/logo.svg" alt="RankBites" className="h-6 brightness-0 invert" />
          </a>
          <p className="text-sm mt-3 text-stone-500">
            Recensioni basate su dati reali di gruppo
          </p>
          <div className="flex justify-center gap-4 mt-6 text-sm">
            <a href="/login" className="hover:text-white transition-colors">Admin</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
