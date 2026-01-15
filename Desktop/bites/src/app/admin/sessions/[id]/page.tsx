import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import SessionDetail from './SessionDetail'

export const dynamic = 'force-dynamic'

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    console.log('DEBUG - Session detail for ID:', id)

    // Get session (simplified)
    const { data: session, error: sessionError } = await supabase
        .from('voting_sessions')
        .select('*')
        .eq('id', id)
        .single()

    console.log('DEBUG - Session error:', sessionError ? JSON.stringify(sessionError) : 'none')
    console.log('DEBUG - Session data:', session ? 'found' : 'null')

    if (!session) {
        console.log('DEBUG - Session not found, returning 404')
        notFound()
    }

    // Get restaurant
    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', session.restaurant_id)
        .single()

    // Get voters
    const { data: voters } = await supabase
        .from('session_voters')
        .select('*')
        .eq('session_id', id)

    // Get voter user names
    const voterIds = voters?.map(v => v.user_id) || []
    const { data: voterUsers } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', voterIds.length > 0 ? voterIds : ['00000000-0000-0000-0000-000000000000'])

    // Combine voters with user info
    const votersWithUsers = voters?.map(v => ({
        ...v,
        user: voterUsers?.find(u => u.id === v.user_id)
    })) || []

    // Get owner
    const { data: owner } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', session.owner_id)
        .single()

    // Combine session with related data
    const fullSession = {
        ...session,
        restaurant,
        owner,
        session_voters: votersWithUsers
    }

    // Check if current user is owner
    const isOwner = session.owner_id === user.id

    // Get votes if session is closed
    let votes = null
    let categoryAverages = null
    if (session.status === 'closed') {
        const { data: voteData } = await supabase
            .from('votes')
            .select('*')
            .eq('session_id', id)

        // Get categories
        const { data: categories } = await supabase
            .from('categories')
            .select('*')

        votes = voteData?.map(v => ({
            ...v,
            category: categories?.find(c => c.id === v.category_id)
        }))

        // Calculate averages
        if (votes && votes.length > 0) {
            const grouped: Record<string, { name: string; total: number; count: number }> = {}
            votes.forEach((vote: any) => {
                const catId = vote.category_id
                if (!grouped[catId]) {
                    grouped[catId] = { name: vote.category?.name || 'Unknown', total: 0, count: 0 }
                }
                grouped[catId].total += vote.score
                grouped[catId].count += 1
            })
            categoryAverages = Object.entries(grouped).map(([id, data]) => ({
                id,
                name: data.name,
                average: data.total / data.count,
            }))
        }
    }

    return (
        <SessionDetail
            session={fullSession}
            isOwner={isOwner}
            currentUserId={user.id}
            votes={votes ?? null}
            categoryAverages={categoryAverages}
        />
    )
}
