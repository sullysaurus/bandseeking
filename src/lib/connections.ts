import { supabase } from './supabase'

export interface Connection {
  id: string
  requester_id: string
  recipient_id: string
  status: 'pending' | 'accepted' | 'rejected' | 'blocked'
  message?: string | null
  created_at: string
  updated_at: string
  accepted_at?: string | null
  requester_username?: string
  requester_name?: string
  requester_avatar?: string
  requester_location?: string
  requester_instruments?: string[]
  requester_genres?: string[]
  recipient_username?: string
  recipient_name?: string
  recipient_avatar?: string
  recipient_location?: string
  recipient_instruments?: string[]
  recipient_genres?: string[]
}

export interface ConnectionRequest {
  recipient_id: string
  message?: string
}

class ConnectionService {
  // Get all connections for the current user
  async getConnections(status?: 'pending' | 'accepted' | 'rejected' | 'blocked'): Promise<Connection[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let query = supabase
        .from('connections_with_profiles')
        .select('*')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching connections:', error)
      return []
    }
  }

  // Get accepted connections (friends)
  async getFriends(): Promise<Connection[]> {
    return this.getConnections('accepted')
  }

  // Get pending connection requests received
  async getReceivedRequests(): Promise<Connection[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('connections_with_profiles')
        .select('*')
        .eq('recipient_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching received requests:', error)
      return []
    }
  }

  // Get pending connection requests sent
  async getSentRequests(): Promise<Connection[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('connections_with_profiles')
        .select('*')
        .eq('requester_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching sent requests:', error)
      return []
    }
  }

  // Send a connection request
  async sendRequest(request: ConnectionRequest): Promise<Connection | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Check if connection already exists
      const { data: existing } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .or(`requester_id.eq.${request.recipient_id},recipient_id.eq.${request.recipient_id}`)
        .single()

      if (existing) {
        throw new Error('Connection request already exists')
      }

      const { data, error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: request.recipient_id,
          message: request.message,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error sending connection request:', error)
      throw error
    }
  }

  // Accept a connection request
  async acceptRequest(connectionId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('connections')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', connectionId)
        .eq('recipient_id', user.id)
        .eq('status', 'pending')

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error accepting connection request:', error)
      return false
    }
  }

  // Reject a connection request
  async rejectRequest(connectionId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('connections')
        .update({ status: 'rejected' })
        .eq('id', connectionId)
        .eq('recipient_id', user.id)
        .eq('status', 'pending')

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error rejecting connection request:', error)
      return false
    }
  }

  // Cancel a sent request
  async cancelRequest(connectionId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId)
        .eq('requester_id', user.id)
        .eq('status', 'pending')

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error canceling connection request:', error)
      return false
    }
  }

  // Remove a connection
  async removeConnection(connectionId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId)
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted')

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error removing connection:', error)
      return false
    }
  }

  // Block a user
  async blockUser(userId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Check if there's an existing connection
      const { data: existing } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
        .single()

      if (existing) {
        // Update existing connection to blocked
        const { error } = await supabase
          .from('connections')
          .update({ status: 'blocked' })
          .eq('id', existing.id)

        if (error) throw error
      } else {
        // Create a new blocked connection
        const { error } = await supabase
          .from('connections')
          .insert({
            requester_id: user.id,
            recipient_id: userId,
            status: 'blocked'
          })

        if (error) throw error
      }

      return true
    } catch (error) {
      console.error('Error blocking user:', error)
      return false
    }
  }

  // Check if connected with a user
  async isConnected(userId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
        .eq('status', 'accepted')
        .single()

      return !!data
    } catch (error) {
      return false
    }
  }

  // Get connection status with a user
  async getConnectionStatus(userId: string): Promise<'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'blocked'> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data } = await supabase
        .from('connections')
        .select('*')
        .or(`and(requester_id.eq.${user.id},recipient_id.eq.${userId}),and(requester_id.eq.${userId},recipient_id.eq.${user.id})`)
        .single()

      if (!data) return 'none'
      
      if (data.status === 'blocked') return 'blocked'
      if (data.status === 'accepted') return 'accepted'
      if (data.status === 'pending') {
        return data.requester_id === user.id ? 'pending_sent' : 'pending_received'
      }
      
      return 'none'
    } catch (error) {
      return 'none'
    }
  }
}

export const connectionService = new ConnectionService()