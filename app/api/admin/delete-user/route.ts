import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { userId, adminEmail } = await request.json()

    // Verify admin access
    if (adminEmail !== 'dsully15@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    console.log('Admin deletion request for user:', userId)

    // Delete user's saved profiles
    console.log('Deleting saved profiles...')
    const { error: savedError } = await supabaseAdmin
      .from('saved_profiles')
      .delete()
      .or(`user_id.eq.${userId},saved_user_id.eq.${userId}`)

    if (savedError) {
      console.error('Error deleting saved profiles:', savedError)
    }

    // Delete user's messages
    console.log('Deleting messages...')
    const { error: messagesError } = await supabaseAdmin
      .from('messages')
      .delete()
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)

    if (messagesError) {
      console.error('Error deleting messages:', messagesError)
    }

    // Delete user's profile
    console.log('Deleting profile...')
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('user_id', userId)

    if (profileError) {
      console.error('Error deleting profile:', profileError)
    }

    // Delete user record using service role (bypasses RLS)
    console.log('Deleting user record...')
    const { error: userError, data: deletedData } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)
      .select()

    console.log('Delete operation result:', { userError, deletedData })

    if (userError) {
      console.error('Error deleting user:', userError)
      return NextResponse.json({ error: `Failed to delete user: ${userError.message}` }, { status: 500 })
    }

    if (!deletedData || deletedData.length === 0) {
      console.error('No rows were deleted - user may not exist')
      return NextResponse.json({ error: 'User deletion failed - no rows affected' }, { status: 500 })
    }

    console.log('User deletion completed successfully')
    return NextResponse.json({ success: true, deletedUser: deletedData[0] })

  } catch (error: any) {
    console.error('Error in admin delete user API:', error)
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}