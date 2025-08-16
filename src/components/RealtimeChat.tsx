'use client'

import { useEffect, useState, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send } from 'lucide-react'
import { conversationService, ConversationMessage } from '@/lib/conversations'

interface RealtimeChatProps {
  user: User
  conversationId?: string
  isPublic?: boolean
  otherParticipant?: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
  }
}

export default function RealtimeChat({ user, conversationId, isPublic = false, otherParticipant }: RealtimeChatProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Load existing messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        let data: ConversationMessage[]
        
        if (isPublic) {
          data = await conversationService.getPublicMessages()
        } else if (conversationId) {
          data = await conversationService.getConversationMessages(conversationId)
        } else {
          data = []
        }
        
        setMessages(data)
      } catch (error) {
        console.error('Error loading messages:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [conversationId, isPublic])

  // Set up realtime subscription
  useEffect(() => {
    let channel: any

    const handleNewMessage = async (payload: any) => {
      try {
        let newMessageData: ConversationMessage
        
        if (isPublic) {
          const data = await conversationService.getPublicMessages()
          newMessageData = data.find(msg => msg.id === payload.new.id)!
        } else if (conversationId) {
          const data = await conversationService.getConversationMessages(conversationId)
          newMessageData = data.find(msg => msg.id === payload.new.id)!
        } else {
          return
        }

        if (newMessageData) {
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(msg => msg.id === newMessageData.id)) {
              return prev
            }
            return [...prev, newMessageData]
          })
        }
      } catch (error) {
        console.error('Error handling new message:', error)
      }
    }

    if (isPublic) {
      channel = conversationService.subscribeToPublicMessages(handleNewMessage)
    } else if (conversationId) {
      channel = conversationService.subscribeToConversationMessages(conversationId, handleNewMessage)
    }

    return () => {
      if (channel) {
        channel.unsubscribe()
      }
    }
  }, [conversationId, isPublic])

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return


    setSending(true)
    try {
      if (isPublic) {
        await conversationService.sendPublicMessage(newMessage.trim())
      } else if (conversationId) {
        await conversationService.sendMessage(conversationId, newMessage.trim())
      } else {
        console.error('No conversation ID provided for private message')
        return
      }
      
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-secondary">Loading messages...</div>
      </div>
    )
  }

  const getHeaderTitle = () => {
    if (isPublic) {
      return 'General Chat'
    } else if (otherParticipant) {
      return `Chat with ${otherParticipant.full_name || otherParticipant.username}`
    } else {
      return 'Private Chat'
    }
  }

  return (
    <div className="flex flex-col h-96 bg-card rounded-lg border border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-white">
          {getHeaderTitle()}
        </h3>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div ref={scrollRef} className="space-y-4">
          {messages.map((message) => {
            const isOwn = message.user_id === user.id
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={message.avatar_url} />
                  <AvatarFallback className="bg-accent-teal text-black text-sm">
                    {message.full_name?.charAt(0) || 
                     message.username?.charAt(0) || 
                     'U'}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex flex-col max-w-xs ${isOwn ? 'items-end' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-secondary">
                      {message.full_name || message.username || 'Anonymous'}
                    </span>
                    <span className="text-xs text-medium">
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      isOwn
                        ? 'bg-accent-teal text-black'
                        : 'bg-background text-white'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal"
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className="bg-accent-teal hover:bg-opacity-90 text-black p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}