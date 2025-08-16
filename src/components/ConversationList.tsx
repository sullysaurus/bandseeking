'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageSquare, Users } from 'lucide-react'
import { conversationService, Conversation } from '@/lib/conversations'
import { supabase } from '@/lib/supabase'

interface ConversationListProps {
  user: User
  selectedConversationId?: string
  selectedIsPublic?: boolean
  onSelectConversation: (conversationId: string, otherParticipant: any) => void
  onSelectPublic: () => void
}

export default function ConversationList({ 
  user, 
  selectedConversationId, 
  selectedIsPublic,
  onSelectConversation, 
  onSelectPublic 
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConversations()
  }, [])

  // Subscribe to conversation updates and new messages
  useEffect(() => {
    const conversationChannel = conversationService.subscribeToConversations(() => {
      loadConversations()
    })

    // Also subscribe to all message updates to refresh conversation list
    const messageChannel = supabase
      .channel('conversation-list-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'conversation_id=not.is.null'
        },
        () => {
          // Refresh conversations when any new message is sent
          loadConversations()
        }
      )
      .subscribe()

    return () => {
      if (conversationChannel) {
        conversationChannel.unsubscribe()
      }
      if (messageChannel) {
        messageChannel.unsubscribe()
      }
    }
  }, [])

  const loadConversations = async () => {
    try {
      const data = await conversationService.getUserConversations()
      setConversations(data)
      
      // Auto-select first conversation if none selected and conversations exist
      if (data.length > 0 && !selectedConversationId && !selectedIsPublic) {
        const firstConversation = data[0]
        const otherParticipant = conversationService.getOtherParticipant(firstConversation, user.id)
        onSelectConversation(firstConversation.id, otherParticipant)
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return ''
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const truncateMessage = (message: string | null, maxLength: number = 40) => {
    if (!message) return 'No messages yet'
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-secondary">Loading conversations...</div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg border border-border h-96">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-white">Messages</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">

          {/* Private Conversations */}
          {conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-8 h-8 text-medium mx-auto mb-2" />
              <p className="text-secondary text-sm">No conversations yet</p>
              <p className="text-medium text-xs">Go to find-musicians and click "Contact" to start chatting</p>
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherParticipant = conversationService.getOtherParticipant(conversation, user.id)
              const isSelected = selectedConversationId === conversation.id

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id, otherParticipant)}
                  className={`w-full p-3 rounded-lg transition-colors mb-2 text-left ${
                    isSelected 
                      ? 'bg-accent-teal/20 border border-accent-teal/30' 
                      : 'hover:bg-background'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={otherParticipant.avatar_url} />
                      <AvatarFallback className="bg-accent-purple text-white text-sm">
                        {otherParticipant.full_name?.charAt(0) || 
                         otherParticipant.username?.charAt(0) || 
                         'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-medium truncate">
                          {otherParticipant.full_name || otherParticipant.username}
                        </h4>
                        {conversation.latest_message_at && (
                          <span className="text-xs text-medium">
                            {formatTime(conversation.latest_message_at)}
                          </span>
                        )}
                      </div>
                      <p className="text-secondary text-sm truncate">
                        {truncateMessage(conversation.latest_message)}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )
}