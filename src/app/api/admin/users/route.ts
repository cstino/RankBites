import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Verify caller is super_admin
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'super_admin') {
            return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
        }

        const { name, email, password, role, groupIds } = await request.json()

        // Create admin client with service role key for user creation
        // Note: This requires SUPABASE_SERVICE_ROLE_KEY env var
        const adminClient = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        )

        // Create auth user
        const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email
        })

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 })
        }

        // Create user profile
        const { error: profileError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email,
                name,
                role,
            })

        if (profileError) {
            // Rollback: delete auth user if profile creation fails
            await adminClient.auth.admin.deleteUser(authData.user.id)
            return NextResponse.json({ error: profileError.message }, { status: 400 })
        }

        // Assign groups if provided
        if (groupIds && groupIds.length > 0) {
            const groupAssignments = groupIds.map((groupId: string) => ({
                user_id: authData.user.id,
                group_id: groupId,
            }))

            await supabase.from('user_groups').insert(groupAssignments)
        }

        return NextResponse.json({ success: true, userId: authData.user.id })
    } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
    }
}
