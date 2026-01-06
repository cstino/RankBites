import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import VoteForm from './VoteForm'

export const dynamic = 'force-dynamic'

export default async function VotePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Get session (simplified)
    const { data: session, error: sessionError } = await supabase
        .from('voting_sessions')
        .select('*')
        .eq('id', id)
        .single()

    console.log('DEBUG - Vote page session error:', sessionError ? JSON.stringify(sessionError) : 'none')

    if (!session || session.status !== 'open') {
        redirect('/admin/sessions')
    }

    // Get restaurant
    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', session.restaurant_id)
        .single()

    // Check if user is invited
    const { data: voter } = await supabase
        .from('session_voters')
        .select('*')
        .eq('session_id', id)
        .eq('user_id', user.id)
        .single()

    if (!voter) {
        redirect('/admin/sessions')
    }

    // Get categories
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('order')

    // Get existing votes for this user
    const { data: existingVotes } = await supabase
        .from('votes')
        .select('category_id, score')
        .eq('session_id', id)
        .eq('user_id', user.id)

    // Get existing photos for this restaurant
    const { data: existingPhotos } = await supabase
        .from('restaurant_photos')
        .select('*')
        .eq('restaurant_id', session.restaurant_id)
        .order('created_at', { ascending: false })

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <a
                    href="/admin/sessions"
                    className="text-stone-500 hover:text-stone-700 text-sm flex items-center gap-1"
                >
                    ← Torna alle sessioni
                </a>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
                <h1 className="text-xl font-bold text-stone-900 mb-1">
                    🗳️ Vota: {restaurant?.name}
                </h1>
                <p className="text-stone-500">
                    {restaurant?.category} • {restaurant?.address}
                </p>
            </div>

            <VoteForm
                sessionId={id}
                restaurantId={session.restaurant_id}
                categories={categories || []}
                existingVotes={existingVotes || []}
                existingPhotos={existingPhotos || []}
                hasVoted={voter.has_voted}
            />
        </div>
    )
}
