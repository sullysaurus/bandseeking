'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/layout/Navigation'
import Button from '@/components/ui/Button'
import { ArrowLeft, Send, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const receiverId = params.userId as string
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [receiver, setReceiver] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [receiverId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    let cleanup: (() => void) | null = null
    
    if (currentUser) {
      cleanup = subscribeToMessages(currentUser.id)
    }
    
    return () => {
      if (cleanup) cleanup()
    }
  }, [currentUser, receiverId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    setCurrentUser(user)
    await fetchReceiver()
    await fetchMessages(user.id)
    await markMessagesAsRead(user.id)
  }

  const fetchReceiver = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', receiverId)
      .single()

    if (error) {
      console.error('Error fetching receiver:', error)
      return
    }

    setReceiver(data)
  }

  const fetchMessages = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const markMessagesAsRead = async (userId: string) => {
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('receiver_id', userId)
      .eq('sender_id', receiverId)
  }

  const subscribeToMessages = (userId: string) => {
    // Create a unique channel name for this conversation
    // Sort the IDs to ensure both users subscribe to the same channel
    const channelName = [userId, receiverId].sort().join('-')
    
    console.log('Setting up real-time subscription for messages', {
      userId,
      receiverId,
      channel: `messages-${channelName}`
    })
    
    const subscription = supabase
      .channel(`messages-${channelName}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload: any) => {
          console.log('Realtime event received:', {
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old
          })
          
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new
            console.log('Checking message:', {
              sender: newMsg.sender_id,
              receiver: newMsg.receiver_id,
              expectedSender: userId,
              expectedReceiver: receiverId,
              willAdd: (newMsg.sender_id === userId && newMsg.receiver_id === receiverId) ||
                       (newMsg.sender_id === receiverId && newMsg.receiver_id === userId)
            })
            
            // Only add messages that are part of this conversation
            if ((newMsg.sender_id === userId && newMsg.receiver_id === receiverId) ||
                (newMsg.sender_id === receiverId && newMsg.receiver_id === userId)) {
              console.log('Adding message to UI')
              setMessages(prev => {
                console.log('Previous messages:', prev.length)
                return [...prev, newMsg]
              })
              if (newMsg.receiver_id === userId) {
                markMessagesAsRead(userId)
              }
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
        if (status === 'CHANNEL_ERROR') {
          console.error('Subscription error - check Supabase Realtime settings')
        }
      })

    return () => {
      console.log('Cleaning up subscription')
      subscription.unsubscribe()
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !currentUser) return
    
    setSending(true)
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: currentUser.id,
        receiver_id: receiverId,
        content: newMessage.trim()
      })

      if (error) throw error
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse">Loading chat...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-purple-300">
        <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-4rem)] flex flex-col">
          {/* Header */}
          <div className="mb-6">
            <Link href="/dashboard/messages" className="inline-flex items-center font-black text-lg mb-4 hover:text-pink-400 transition-colors">
              ← BACK TO MESSAGES
            </Link>
            {receiver && (
              <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black mb-1">{receiver.full_name.toUpperCase()}</h2>
                    <p className="font-bold text-gray-600">@{receiver.username}</p>
                  </div>
                  <Link 
                    href={`/profile/${receiver.username}`} 
                    className="px-3 py-1 bg-yellow-300 border-2 border-black font-black text-sm hover:bg-yellow-400 transition-colors"
                  >
                    VIEW PROFILE
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-3 bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="font-black text-xl mb-2">START THE CONVERSATION!</h3>
                <p className="font-bold text-gray-600">
                  Send a message to {receiver?.full_name}
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.sender_id === currentUser?.id
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                        isOwn
                          ? 'bg-black text-white'
                          : 'bg-lime-300 text-black'
                      }`}
                    >
                      <p className="font-bold break-words">{message.content}</p>
                      <p className={`text-xs mt-1 font-bold ${isOwn ? 'text-gray-300' : 'text-gray-700'}`}>
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true }).toUpperCase()}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              placeholder="TYPE YOUR MESSAGE..."
              className="flex-1 px-4 py-3 border-4 border-black font-bold placeholder:text-gray-400 focus:outline-none focus:bg-yellow-100 transition-colors"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sending}
            />
            <button 
              type="submit" 
              disabled={sending || !newMessage.trim()}
              className="px-6 py-3 bg-black text-white border-4 border-black font-black hover:bg-pink-400 hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
            >
              {sending ? 'SENDING...' : 'SEND →'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}