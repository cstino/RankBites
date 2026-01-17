import { createClient } from '@/lib/supabase/server'
import RestaurantCard from '@/components/public/RestaurantCard'
import HorizontalSection from '@/components/public/HorizontalSection'
import CategoryPills from '@/components/public/CategoryPills'
import InstallPWABanner from '@/components/ui/InstallPWABanner'
import Sidebar from '@/components/public/Sidebar'
import SearchBar from '@/components/public/SearchBar'
import OnboardingWrapper from '@/components/public/OnboardingWrapper'

export const dynamic = 'force-dynamic'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; preferiti?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Top Rated (by overall_rating)
  const { data: topRated } = await supabase
    .from('restaurants')
    .select('*')
    .not('overall_rating', 'is', null)
    .order('overall_rating', { ascending: false })
    .limit(10)

  // Nuovi (by created_at)
  const { data: newest } = await supabase
    .from('restaurants')
    .select('*')
    .not('overall_rating', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10)

  // Best Location (by category_ratings->Location)
  const { data: bestLocation } = await supabase
    .from('restaurants')
    .select('*')
    .not('category_ratings', 'is', null)
    .order('category_ratings->Location', { ascending: false })
    .limit(10)

  // Best Menu (by category_ratings->Menu)
  const { data: bestMenu } = await supabase
    .from('restaurants')
    .select('*')
    .not('category_ratings', 'is', null)
    .order('category_ratings->Menu', { ascending: false })
    .limit(10)

  // User-specific data (only if logged in)
  let visitedRestaurants: any[] = []
  let favoriteRestaurants: any[] = []
  let userFavoriteIds: string[] = []

  if (user) {
    // Visited: restaurants where user has voted
    const { data: userVotes } = await supabase
      .from('votes')
      .select('session_id')
      .eq('user_id', user.id)

    if (userVotes && userVotes.length > 0) {
      const sessionIds = [...new Set(userVotes.map(v => v.session_id))]

      const { data: sessions } = await supabase
        .from('voting_sessions')
        .select('restaurant_id')
        .in('id', sessionIds)

      if (sessions && sessions.length > 0) {
        const restaurantIds = [...new Set(sessions.map(s => s.restaurant_id))]

        const { data: visited } = await supabase
          .from('restaurants')
          .select('*')
          .in('id', restaurantIds)
          .not('overall_rating', 'is', null)

        visitedRestaurants = visited || []
      }
    }

    // Favorites
    const { data: favorites } = await supabase
      .from('user_favorites')
      .select('restaurant_id')
      .eq('user_id', user.id)

    if (favorites && favorites.length > 0) {
      const favIds = favorites.map(f => f.restaurant_id)
      userFavoriteIds = favIds

      const { data: favRestaurants } = await supabase
        .from('restaurants')
        .select('*')
        .in('id', favIds)
        .not('overall_rating', 'is', null)

      favoriteRestaurants = favRestaurants || []
    }
  }

  // Get unique categories for pills
  const { data: allRestaurants } = await supabase
    .from('restaurants')
    .select('category')
    .not('overall_rating', 'is', null)

  const allCategories = allRestaurants?.flatMap(r => r.category || []) || []
  const categories = [...new Set(allCategories)]

  // Check for favorites view
  const showFavorites = params.preferiti === 'true'

  // If search or category filter, show filtered results
  const hasFilters = params.search || params.category
  let filteredRestaurants: any[] = []

  if (hasFilters) {
    let query = supabase
      .from('restaurants')
      .select('*')
      .not('overall_rating', 'is', null)

    if (params.category) {
      const selectedCategories = params.category.split(',')
      query = query.overlaps('category', selectedCategories)
    }
    if (params.search) {
      query = query.ilike('name', `%${params.search}%`)
    }

    query = query.order('overall_rating', { ascending: false })
    const { data } = await query
    filteredRestaurants = data || []
  }

  return (
    <OnboardingWrapper>
      <div className="min-h-screen bg-white">
        <InstallPWABanner />

        {/* Header */}
        <header className="header-clean">
          <a href="/" className="flex items-center">
            <img src="/logo.svg" alt="RankBites" className="h-7" />
          </a>
          <Sidebar />
        </header>

        {/* Search Bar - Hide on favorites view */}
        {!showFavorites && <SearchBar currentSearch={params.search} />}

        {/* Category Pills - Hide on favorites view */}
        {!showFavorites && <CategoryPills categories={categories} currentCategory={params.category} />}

        {/* Content */}
        <main className="pb-24">
          {showFavorites ? (
            // Favorites View
            <div className="px-4">
              <h2 className="text-2xl font-bold text-stone-900 mb-6">
                ❤️ I tuoi Preferiti
              </h2>
              {user ? (
                favoriteRestaurants.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {favoriteRestaurants.map((restaurant, index) => (
                      <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        index={index}
                        userId={user.id}
                        isFavorite={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <span className="text-6xl mb-4 block">💔</span>
                    <p className="text-stone-500 text-lg">Nessun ristorante nei preferiti</p>
                    <p className="text-stone-400 text-sm mt-2">Aggiungi ristoranti ai preferiti cliccando sul cuore ❤️</p>
                    <a href="/" className="inline-block mt-6 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors">
                      Esplora Ristoranti
                    </a>
                  </div>
                )
              ) : (
                <div className="text-center py-20">
                  <span className="text-6xl mb-4 block">🔒</span>
                  <p className="text-stone-500 text-lg mb-4">Effettua il login per vedere i tuoi preferiti</p>
                  <a href="/login" className="inline-block px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors">
                    Accedi
                  </a>
                </div>
              )}
            </div>
          ) : hasFilters ? (
            // Filtered Results
            <div className="px-4">
              <h2 className="text-lg font-bold text-stone-900 mb-4">
                Risultati <span className="text-stone-400 font-normal">({filteredRestaurants.length})</span>
              </h2>
              {filteredRestaurants.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {filteredRestaurants.map((restaurant, index) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                      index={index}
                      userId={user?.id}
                      isFavorite={userFavoriteIds.includes(restaurant.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-4xl">🍽️</span>
                  <p className="text-stone-500 mt-2">Nessun ristorante trovato</p>
                  <a href="/" className="text-orange-500 hover:text-orange-600 mt-2 inline-block">
                    Rimuovi filtri →
                  </a>
                </div>
              )}
            </div>
          ) : (
            // Homepage Sections
            <>
              {/* Top Rated */}
              <HorizontalSection
                title="Top Rated"
                promoGradient="linear-gradient(135deg, #ea580c 0%, #dc2626 100%)"
              >
                {topRated?.map((r, i) => (
                  <RestaurantCard
                    key={r.id}
                    restaurant={r}
                    index={i}
                    userId={user?.id}
                    isFavorite={userFavoriteIds.includes(r.id)}
                  />
                ))}
              </HorizontalSection>

              {/* Nuovi */}
              <HorizontalSection
                title="Nuovi"
                promoGradient="linear-gradient(135deg, #059669 0%, #14b8a6 100%)"
              >
                {newest?.map((r, i) => (
                  <RestaurantCard
                    key={r.id}
                    restaurant={r}
                    index={i}
                    userId={user?.id}
                    isFavorite={userFavoriteIds.includes(r.id)}
                  />
                ))}
              </HorizontalSection>

              {/* Migliori Location */}
              <HorizontalSection
                title="Migliori Location"
                promoGradient="linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)"
              >
                {bestLocation?.map((r, i) => (
                  <RestaurantCard
                    key={r.id}
                    restaurant={r}
                    index={i}
                    userId={user?.id}
                    isFavorite={userFavoriteIds.includes(r.id)}
                  />
                ))}
              </HorizontalSection>

              {/* Migliori Menu */}
              <HorizontalSection
                title="Migliori Menu"
                promoGradient="linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)"
              >
                {bestMenu?.map((r, i) => (
                  <RestaurantCard
                    key={r.id}
                    restaurant={r}
                    index={i}
                    userId={user?.id}
                    isFavorite={userFavoriteIds.includes(r.id)}
                  />
                ))}
              </HorizontalSection>

              {/* Visitati (solo utenti loggati) */}
              {user && visitedRestaurants.length > 0 && (
                <HorizontalSection
                  title="Visitati"
                  promoGradient="linear-gradient(135deg, #64748b 0%, #475569 100%)"
                >
                  {visitedRestaurants.map((r, i) => (
                    <RestaurantCard
                      key={r.id}
                      restaurant={r}
                      index={i}
                      userId={user?.id}
                      isFavorite={userFavoriteIds.includes(r.id)}
                    />
                  ))}
                </HorizontalSection>
              )}

              {/* Preferiti (solo utenti loggati) */}
              {user && favoriteRestaurants.length > 0 && (
                <HorizontalSection
                  title="I tuoi Preferiti"
                  promoGradient="linear-gradient(135deg, #ec4899 0%, #dc2626 100%)"
                >
                  {favoriteRestaurants.map((r, i) => (
                    <RestaurantCard
                      key={r.id}
                      restaurant={r}
                      index={i}
                      userId={user?.id}
                      isFavorite={true}
                    />
                  ))}
                </HorizontalSection>
              )}
            </>
          )}
        </main>
      </div>
    </OnboardingWrapper>
  )
}
