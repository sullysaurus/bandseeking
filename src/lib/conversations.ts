import { supabase } from './supabase'

export interface Conversation {
  id: string
  participant1_id: string
  participant2_id: string
  created_at: string
  updated_at: string
  participant1_username: string
  participant1_name: string | null
  participant1_avatar: string | null
  participant2_username: string
  participant2_name: string | null
  participant2_avatar: string | null
  latest_message: string | null
  latest_message_at: string | null
}

export interface ConversationMessage {
  id: string
  content: string
  user_id: string
  conversation_id: string | null
  room_id: string
  created_at: string
  username: string
  full_name: string | null
  avatar_url: string | null
}

export const conversationService = {
  // Get or create a conversation between current user and another user
  async getOrCreateConversation(otherUserId: string): Promise<string> {
    const { data, error } = await supabase.rpc('get_or_create_conversation', {
      other_user_id: otherUserId
    })

    if (error) {
      console.error('Error getting/creating conversation:', error)
      throw error
    }

    return data
  },

  // Get all conversations for the current user
  async getUserConversations(): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversation_details')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching conversations:', error)
      throw error
    }

    return data || []
  },

  // Get messages for a specific conversation
  async getConversationMessages(conversationId: string): Promise<ConversationMessage[]> {
    const { data, error } = await supabase
      .from('message_profiles')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching conversation messages:', error)
      throw error
    }

    return data || []
  },

  // Send a message in a conversation
  async sendMessage(conversationId: string, content: string): Promise<void> {
    // First check if conversation exists
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single()

    if (convError) {
      console.error('Conversation not found:', {
        conversationId,
        error: convError,
        message: convError.message
      })
      throw new Error(`Conversation not found: ${convError.message}`)
    }


    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('User not authenticated:', userError)
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        content,
        user_id: user.id,
        conversation_id: conversationId,
        room_id: `conversation-${conversationId}` // For realtime subscriptions
      })
      .select()

    if (error) {
      console.error('Error sending message:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw error
    }

  },

  // Get public/general chat messages
  async getPublicMessages(): Promise<ConversationMessage[]> {
    const { data, error } = await supabase
      .from('message_profiles')
      .select('*')
      .eq('room_id', 'general')
      .is('conversation_id', null)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching public messages:', error)
      throw error
    }

    return data || []
  },

  // Send a message in public chat
  async sendPublicMessage(content: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .insert({
        content,
        room_id: 'general'
      })

    if (error) {
      console.error('Error sending public message:', error)
      throw error
    }
  },

  // Get the other participant in a conversation
  getOtherParticipant(conversation: Conversation, currentUserId: string) {
    if (conversation.participant1_id === currentUserId) {
      return {
        id: conversation.participant2_id,
        username: conversation.participant2_username,
        full_name: conversation.participant2_name,
        avatar_url: conversation.participant2_avatar
      }
    } else {
      return {
        id: conversation.participant1_id,
        username: conversation.participant1_username,
        full_name: conversation.participant1_name,
        avatar_url: conversation.participant1_avatar
      }
    }
  },

  // Subscribe to conversation updates
  subscribeToConversations(callback: (payload: any) => void) {
    return supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        callback
      )
      .subscribe()
  },

  // Subscribe to messages in a specific conversation
  subscribeToConversationMessages(conversationId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        callback
      )
      .subscribe()
  },

  // Subscribe to public chat messages
  subscribeToPublicMessages(callback: (payload: any) => void) {
    return supabase
      .channel('public-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'room_id=eq.general'
        },
        callback
      )
      .subscribe()
  }
}