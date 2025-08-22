'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/layout/Navigation'
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

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-cyan-300 flex items-center justify-center">
          <div className="font-black text-2xl">LOADING MESSAGES...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-cyan-300">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center font-black text-lg mb-4 hover:text-pink-400 transition-colors"
            >
              ← BACK TO DASHBOARD
            </Link>
            <h1 className="text-4xl md:text-5xl font-black">MESSAGES</h1>
          </div>

          {/* Search */}
          <div className="bg-white border-4 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <input
              type="text"
              placeholder="SEARCH CONVERSATIONS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border-4 border-black font-bold placeholder:text-gray-400 focus:outline-none focus:bg-yellow-100 transition-colors"
            />
          </div>

          {/* No Messages */}
          {filteredConversations.length === 0 && !searchQuery && (
            <div className="bg-white border-4 border-black p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-black mb-4">NO CONVERSATIONS YET</h2>
              <p className="font-bold mb-6">
                Start messaging musicians to see your conversations here.
              </p>
              <Link 
                href="/search" 
                className="inline-block px-6 py-3 bg-black text-white border-4 border-black font-black hover:bg-yellow-300 hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                FIND MUSICIANS →
              </Link>
            </div>
          )}

          {/* No Search Results */}
          {filteredConversations.length === 0 && searchQuery && (
            <div className="bg-white border-4 border-black p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-black mb-4">NO RESULTS</h2>
              <p className="font-bold">
                No conversations match "{searchQuery}".
              </p>
            </div>
          )}

          {/* Conversations List */}
          {filteredConversations.length > 0 && (
            <div className="space-y-4">
              {filteredConversations.map((conversation) => (
                <Link 
                  key={conversation.user.id} 
                  href={`/dashboard/messages/${conversation.user.id}`}
                  className="block"
                >
                  <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-black text-lg">{conversation.user.full_name.toUpperCase()}</h3>
                          {conversation.unreadCount > 0 && (
                            <span className="px-2 py-1 bg-red-500 text-white font-black text-xs">
                              {conversation.unreadCount} NEW
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-sm text-gray-600 mb-1">
                          @{conversation.user.username}
                        </p>
                        <p className="font-bold text-sm line-clamp-2">
                          {conversation.lastMessage.sender_id === currentUser?.id ? 'YOU: ' : ''}
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-xs text-gray-500">
                          {formatDistanceToNow(new Date(conversation.lastMessage.created_at), { addSuffix: true }).toUpperCase()}
                        </p>
                        <div className="mt-2 px-3 py-1 bg-yellow-300 border-2 border-black font-black text-xs hover:bg-yellow-400 transition-colors">
                          OPEN →
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}