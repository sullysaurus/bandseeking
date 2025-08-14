import { supabase } from './supabase'

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: string
  created_at: string
  updated_at: string
  is_read: boolean
  sender?: {
    id: string
    username?: string
    email?: string
    avatar_url?: string
  }
}

export interface Conversation {
  id: string
  created_at: string
  updated_at: string
  participants: ConversationParticipant[]
  last_message?: Message
  unread_count: number
}

export interface ConversationParticipant {
  id: string
  conversation_id: string
  user_id: string
  joined_at: string
  last_read_at: string
  user?: {
    id: string
    username?: string
    email?: string
    avatar_url?: string
  }
}

export interface ConversationCreate {
  participant_ids: string[]
  initial_message?: string
}

class MessageService {
  async getConversations(): Promise<Conversation[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants(
            *,
            user:auth.users(id, email, raw_user_meta_data)
          ),
          messages:messages(*)
        `)
        .order('updated_at', { ascending: false })

      if (error) {
        // Handle case where table doesn't exist yet
        if (error.code === '42P01') {
          console.warn('Messages tables do not exist yet. Please run database migrations.')
          return []
        }
        throw error
      }

      // Process conversations to add unread count and last message
      const processedConversations = conversations?.map(conv => {
        const messages = conv.messages || []
        const lastMessage = messages.length > 0 
          ? messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
          : undefined

        // Count unread messages
        const userParticipant = conv.participants?.find(p => p.user_id === user.id)
        const lastReadAt = userParticipant?.last_read_at
        const unreadCount = messages.filter(msg => 
          msg.sender_id !== user.id && 
          (!lastReadAt || new Date(msg.created_at) > new Date(lastReadAt))
        ).length

        return {
          ...conv,
          last_message: lastMessage,
          unread_count: unreadCount
        }
      }) || []

      return processedConversations
    } catch (error: any) {
      // Don't log table missing errors as they're expected
      if (error && error.code !== '42P01' && !error.message?.includes('does not exist')) {
        console.error('Error fetching conversations:', error)
      }
      return []
    }
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const { data: conversation, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants(
            *,
            user:auth.users(id, email, raw_user_meta_data)
          )
        `)
        .eq('id', conversationId)
        .single()

      if (error) throw error
      return { ...conversation, unread_count: 0 }
    } catch (error) {
      console.error('Error fetching conversation:', error)
      return null
    }
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:auth.users(id, email, raw_user_meta_data)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) {
        // Handle case where table doesn't exist yet
        if (error.code === '42P01') {
          console.warn('Messages tables do not exist yet. Please run database migrations.')
          return []
        }
        throw error
      }
      return messages || []
    } catch (error: any) {
      // Don't log table missing errors as they're expected
      if (error.code !== '42P01' && !error.message?.includes('does not exist')) {
        console.error('Error fetching messages:', error)
      }
      return []
    }
  }

  async sendMessage(conversationId: string, content: string): Promise<Message | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: 'text'
        })
        .select(`
          *,
          sender:auth.users(id, email, raw_user_meta_data)
        `)
        .single()

      if (error) {
        // Handle case where table doesn't exist yet
        if (error.code === '42P01') {
          console.warn('Messages tables do not exist yet. Please run database migrations.')
          throw new Error('Database not set up yet. Please run migrations when Docker is available.')
        }
        throw error
      }
      return message
    } catch (error: any) {
      // Don't log table missing errors as they're expected
      if (error.code !== '42P01' && !error.message?.includes('does not exist')) {
        console.error('Error sending message:', error)
      }
      return null
    }
  }

  async createConversation(participantIds: string[], initialMessage?: string): Promise<Conversation | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single()

      if (convError) throw convError

      // Add participants (including current user)
      const allParticipants = [...new Set([user.id, ...participantIds])]
      const { error: participantError } = await supabase
        .from('conversation_participants')
        .insert(
          allParticipants.map(userId => ({
            conversation_id: conversation.id,
            user_id: userId
          }))
        )

      if (participantError) throw participantError

      // Send initial message if provided
      if (initialMessage) {
        await this.sendMessage(conversation.id, initialMessage)
      }

      return await this.getConversation(conversation.id)
    } catch (error) {
      console.error('Error creating conversation:', error)
      return null
    }
  }

  async markAsRead(conversationId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error marking conversation as read:', error)
      return false
    }
  }

  async findOrCreateConversation(otherUserId: string): Promise<Conversation | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Look for existing conversation between these two users
      const { data: existingConversations, error: searchError } = await supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants(user_id)
        `)

      if (searchError) throw searchError

      // Find conversation with exactly these two participants
      const existingConv = existingConversations?.find(conv => {
        const participantIds = conv.participants.map(p => p.user_id).sort()
        const targetIds = [user.id, otherUserId].sort()
        return participantIds.length === 2 && 
               participantIds[0] === targetIds[0] && 
               participantIds[1] === targetIds[1]
      })

      if (existingConv) {
        return await this.getConversation(existingConv.id)
      }

      // Create new conversation
      return await this.createConversation([otherUserId])
    } catch (error) {
      console.error('Error finding or creating conversation:', error)
      return null
    }
  }
}

export const messageService = new MessageService()