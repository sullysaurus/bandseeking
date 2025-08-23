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
  const [connectionStatus, setConnectionStatus] = useState<string>('connecting')
  const reconnectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    checkAuth()
  }, [receiverId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle page visibility changes - reconnect when user returns
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && connectionStatus === 'disconnected' && currentUser) {
        console.log('Page became visible, checking connection...')
        // Force a reconnection attempt
        const cleanup = subscribeToMessages(currentUser.id)
        return cleanup
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [connectionStatus, currentUser, receiverId])

  useEffect(() => {
    let cleanup: (() => void) | null = null
    
    if (currentUser) {
      cleanup = subscribeToMessages(currentUser.id)
    }
    
    return () => {
      if (cleanup) cleanup()
      if (reconnectionTimeoutRef.current) {
        clearTimeout(reconnectionTimeoutRef.current)
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
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
    let subscription: any = null
    let isCleanedUp = false
    
    const createSubscription = () => {
      if (isCleanedUp) return
      
      // Create a unique channel name for this conversation
      const channelName = [userId, receiverId].sort().join('-')
      
      console.log('Setting up real-time subscription for messages', {
        userId,
        receiverId,
        channel: `messages-${channelName}`
      })
      
      setConnectionStatus('connecting')
      
      subscription = supabase
        .channel(`messages-${channelName}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          },
          (payload: any) => {
            console.log('Realtime event received:', payload)
            
            if (payload.eventType === 'INSERT') {
              const newMsg = payload.new
              
              // Only add messages that are part of this conversation
              if ((newMsg.sender_id === userId && newMsg.receiver_id === receiverId) ||
                  (newMsg.sender_id === receiverId && newMsg.receiver_id === userId)) {
                console.log('Adding message to UI')
                setMessages(prev => {
                  // Prevent duplicates
                  if (prev.some(msg => msg.id === newMsg.id)) {
                    return prev
                  }
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
          setConnectionStatus(status)
          
          if (status === 'SUBSCRIBED') {
            setConnectionStatus('connected')
            // Start heartbeat to keep connection alive
            if (heartbeatIntervalRef.current) {
              clearInterval(heartbeatIntervalRef.current)
            }
            heartbeatIntervalRef.current = setInterval(() => {
              // Send a presence update to keep connection alive
              if (!isCleanedUp && subscription) {
                console.log('Sending heartbeat to maintain connection')
                subscription.send({
                  type: 'heartbeat',
                  event: 'ping',
                  payload: { timestamp: Date.now() }
                })
              }
            }, 60000) // Every 60 seconds
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            setConnectionStatus('disconnected')
            console.log('Real-time connection lost, attempting to reconnect in 3 seconds...')
            
            // Attempt to reconnect after a delay
            if (!isCleanedUp && reconnectionTimeoutRef.current === null) {
              reconnectionTimeoutRef.current = setTimeout(() => {
                reconnectionTimeoutRef.current = null
                if (subscription) {
                  subscription.unsubscribe()
                }
                console.log('Attempting to reconnect to real-time messaging...')
                createSubscription()
              }, 3000)
            }
          }
        })
    }
    
    createSubscription()

    return () => {
      console.log('Cleaning up subscription')
      isCleanedUp = true
      if (subscription) {
        subscription.unsubscribe()
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
        heartbeatIntervalRef.current = null
      }
      if (reconnectionTimeoutRef.current) {
        clearTimeout(reconnectionTimeoutRef.current)
        reconnectionTimeoutRef.current = null
      }
    }
  }

  const sendMessage = async (e: React.FormEvent, retryCount = 0) => {
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
      
      // Retry up to 2 times if connection seems to be the issue
      if (retryCount < 2 && (connectionStatus === 'disconnected' || connectionStatus === 'connecting')) {
        console.log(`Retrying message send (attempt ${retryCount + 1}/2)`)
        setTimeout(() => {
          const fakeEvent = { preventDefault: () => {} } as React.FormEvent
          sendMessage(fakeEvent, retryCount + 1)
        }, 2000)
        return // Don't reset sending state yet
      }
      
      // Show user-friendly error after retries fail
      alert('Failed to send message. Please check your connection and try again.')
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
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-gray-600">@{receiver.username}</p>
                      {/* Connection Status Indicator - only show when not connected */}
                      {connectionStatus !== 'connected' && (
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${
                            connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                            'bg-red-400'
                          }`}></div>
                          <span className={`text-xs font-bold ${
                            connectionStatus === 'connecting' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {connectionStatus === 'connecting' ? 'CONNECTING...' : 'RECONNECTING...'}
                          </span>
                        </div>
                      )}
                    </div>
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