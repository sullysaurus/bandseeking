'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/layout/Navigation'
import Button from '@/components/ui/Button'
import { ArrowLeft, MessageSquare, Search } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function MessagesPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    setCurrentUser(user)
    await fetchConversations(user.id)
    subscribeToMessages(user.id)
  }

  const fetchConversations = async (userId: string) => {
    try {
      // Get all messages where user is sender or receiver
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(*),
          receiver:users!receiver_id(*)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group messages by conversation
      const conversationMap = new Map()
      
      messages?.forEach(message => {
        const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id
        const otherUser = message.sender_id === userId ? message.receiver : message.sender
        
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            user: otherUser,
            lastMessage: message,
            unreadCount: 0
          })
        }
        
        // Count unread messages
        if (message.receiver_id === userId && !message.read) {
          const conv = conversationMap.get(otherUserId)
          conv.unreadCount++
        }
      })

      setConversations(Array.from(conversationMap.values()))
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToMessages = (userId: string) => {
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${userId},receiver_id.eq.${userId})`
        },
        () => {
          fetchConversations(userId)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-black mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center">
            <MessageSquare className="w-8 h-8 mr-3" />
            <div>
              <h1 className="text-3xl font-bold">Messages</h1>
              <p className="text-gray-600">Your conversations with other musicians</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Conversations List */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-20 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className="space-y-2">
            {filteredConversations.map((conversation) => (
              <Link
                key={conversation.user.id}
                href={`/dashboard/messages/${conversation.user.id}`}
                className="block"
              >
                <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h3 className="font-semibold">{conversation.user.full_name}</h3>
                        {conversation.unreadCount > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-black text-white text-xs rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage.sender_id === currentUser?.id && 'You: '}
                        {conversation.lastMessage.content}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(conversation.lastMessage.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No conversations yet</h2>
            <p className="text-gray-600 mb-6">
              Start a conversation by messaging a musician from their profile
            </p>
            <Link href="/search">
              <Button>Browse Musicians</Button>
            </Link>
          </div>
        )}
      </div>
    </>
  )
}