import { createClient } from '@/lib/supabase/server'
import { generateMiniReview } from '@/lib/ai'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: sessionId } = await params
        const supabase = await createClient()

        console.log('DEBUG - Closing session:', sessionId)

        // Verify user is authenticated
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
        }

        // Get session (simplified - no JOIN)
        const { data: session, error: sessionError } = await supabase
            .from('voting_sessions')
            .select('*')
            .eq('id', sessionId)
            .single()

        console.log('DEBUG - Session error:', sessionError ? JSON.stringify(sessionError) : 'none')
        console.log('DEBUG - Session found:', session ? 'yes' : 'no')

        if (!session) {
            return NextResponse.json({ error: 'Sessione non trovata' }, { status: 404 })
        }

        if (session.owner_id !== user.id) {
            return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
        }

        if (session.status === 'closed') {
            return NextResponse.json({ error: 'Sessione già chiusa' }, { status: 400 })
        }

        // Get restaurant
        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('*')
            .eq('id', session.restaurant_id)
            .single()

        // Get votes and calculate averages manually
        const { data: votes } = await supabase
            .from('votes')
            .select('*, category:categories(name)')
            .eq('session_id', sessionId)

        // Calculate category averages
        const categoryScores: Record<string, { total: number; count: number; name: string }> = {}

        if (votes && votes.length > 0) {
            for (const vote of votes) {
                const catId = vote.category_id
                const catName = vote.category?.name || 'Unknown'
                if (!categoryScores[catId]) {
                    categoryScores[catId] = { total: 0, count: 0, name: catName }
                }
                categoryScores[catId].total += vote.score
                categoryScores[catId].count += 1
            }
        }

        const categoryRatings: Record<string, number> = {}
        let overallTotal = 0
        let overallCount = 0

        for (const [catId, data] of Object.entries(categoryScores)) {
            const avg = Math.round((data.total / data.count) * 10) / 10
            categoryRatings[data.name] = avg
            overallTotal += avg
            overallCount += 1
        }

        const overallRating = overallCount > 0
            ? Math.round((overallTotal / overallCount) * 10) / 10
            : null

        // Update session to closed
        await supabase
            .from('voting_sessions')
            .update({ status: 'closed', closed_at: new Date().toISOString() })
            .eq('id', sessionId)

        // Update restaurant with ratings
        await supabase
            .from('restaurants')
            .update({
                category_ratings: categoryRatings,
                overall_rating: overallRating,
                current_session_id: sessionId
            })
            .eq('id', session.restaurant_id)

        // Generate AI review
        let aiReview = null
        try {
            console.log('DEBUG - Generating AI review for:', restaurant?.name)
            console.log('DEBUG - Category ratings:', JSON.stringify(categoryRatings))
            console.log('DEBUG - GEMINI_API_KEY set:', !!process.env.GEMINI_API_KEY)

            aiReview = await generateMiniReview(
                restaurant?.name || 'Ristorante',
                categoryRatings
            )

            console.log('DEBUG - AI review result:', aiReview)

            if (aiReview) {
                const { error: aiUpdateError } = await supabase
                    .from('restaurants')
                    .update({ ai_review: aiReview })
                    .eq('id', session.restaurant_id)

                console.log('DEBUG - AI review update error:', aiUpdateError ? JSON.stringify(aiUpdateError) : 'none')
            }
        } catch (aiError) {
            console.error('AI review error:', aiError)
            // Continue without AI review
        }

        return NextResponse.json({
            success: true,
            category_ratings: categoryRatings,
            overall_rating: overallRating,
            ai_review: aiReview,
        })
    } catch (error) {
        console.error('Error closing session:', error)
        return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
    }
}
