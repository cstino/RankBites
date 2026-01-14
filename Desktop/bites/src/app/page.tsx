import { createClient } from '@/lib/supabase/server'
import RestaurantCard from '@/components/public/RestaurantCard'
import CategoryPills from '@/components/public/CategoryPills'
import BottomNav from '@/components/public/BottomNav'
import InstallPWABanner from '@/components/ui/InstallPWABanner'
import Sidebar from '@/components/public/Sidebar'
import SearchBar from '@/components/public/SearchBar'
import OnboardingWrapper from '@/components/public/OnboardingWrapper'
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
    // category is now an array, use contains operator
    query = query.contains('category', [params.category])
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

    restaurants = restaurants
      .filter(r => r.latitude && r.longitude)
      .map(r => ({
        ...r,
        distance: calculateDistance(userLat, userLng, r.latitude, r.longitude)
      }))
      .sort((a, b) => (a.distance || 999) - (b.distance || 999))
  }

  // Get unique categories from all restaurants (category is now an array)
  const { data: allRestaurants } = await supabase
    .from('restaurants')
    .select('category')
    .not('overall_rating', 'is', null)

  // Flatten all category arrays and get unique values
  const allCategories = allRestaurants?.flatMap(r => r.category || []) || []
  const categories = [...new Set(allCategories)]

  return (
    <OnboardingWrapper>
      <div className="min-h-screen bg-white page-with-bottom-nav">
        {/* PWA Install Banner */}
        <InstallPWABanner />

        {/* Clean Header */}
        <header className="header-clean">
          <a href="/" className="flex items-center">
            <img src="/logo.svg" alt="RankBites" className="h-7" />
          </a>
          <Sidebar />
        </header>



        {/* Search Bar */}
        <SearchBar
          currentSearch={params.search}
          currentCity={params.city}
          currentNearMe={params.nearMe}
        />

        {/* Category Pills */}
        <CategoryPills
          categories={categories}
          currentCategory={params.category}
        />

        {/* Active Filters Info */}
        {(params.minRating || params.nearMe) && (
          <div className="px-4 mb-4">
            <div className="flex flex-wrap gap-2">
              {params.minRating && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-600 text-sm font-medium rounded-full">
                  ⭐ {params.minRating}+ stelle
                  <a href={`/?${new URLSearchParams({ ...params, minRating: '' }).toString()}`} className="ml-1 hover:text-orange-800">×</a>
                </span>
              )}
              {params.nearMe && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 text-sm font-medium rounded-full">
                  📍 Vicino a me
                  <a href="/" className="ml-1 hover:text-green-800">×</a>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="px-4 pb-8">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-stone-900">
              {params.category || 'Ristoranti'}
              <span className="text-stone-400 font-normal ml-2">({restaurants?.length || 0})</span>
            </h2>
          </div>

          {/* Restaurant List */}
          {restaurants && restaurants.length > 0 ? (
            <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
              {restaurants.map((restaurant, index) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-100 mb-4">
                <span className="text-3xl">🍽️</span>
              </div>
              <p className="text-stone-500">Nessun ristorante trovato</p>
              {(params.category || params.minRating || params.search) && (
                <a
                  href="/"
                  className="inline-block mt-4 text-orange-500 hover:text-orange-600 font-medium"
                >
                  Rimuovi filtri →
                </a>
              )}
            </div>
          )}
        </main>

        {/* Bottom Navigation (Mobile) */}
        <BottomNav />
      </div>
    </OnboardingWrapper>
  )
}
