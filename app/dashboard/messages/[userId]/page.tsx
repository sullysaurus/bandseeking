'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/layout/Navigation'
import { ArrowLeft, Send, Check, CheckCheck, Clock, Wifi, WifiOff, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Message {
  id: string
  content: string
  sender_id: string
  receiver_id: string
  created_at: string
  read: boolean
  delivered: boolean
}

interface MessageStatus {
  id: string
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
}

export default function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const receiverId = params.userId as string
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<any>(null)
  
  const [messages, setMessages] = useState<Message[]>([])
  const [messageStatuses, setMessageStatuses] = useState<Map<string, MessageStatus>>(new Map())
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [receiver, setReceiver] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [shouldScrollSmooth, setShouldScrollSmooth] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [receiverId])

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(shouldScrollSmooth)
      // Reset smooth scroll flag
      setShouldScrollSmooth(false)
    }
  }, [messages, shouldScrollSmooth])

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Set up real-time subscription
  useEffect(() => {
    if (currentUser) {
      setupRealtimeSubscription()
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
    }
  }, [currentUser, receiverId])

  const scrollToBottom = (smooth = false) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
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

  const setupRealtimeSubscription = () => {
    if (channelRef.current) {
      channelRef.current.unsubscribe()
    }

    const channelName = `messages:${[currentUser.id, receiverId].sort().join('-')}`
    
    channelRef.current = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: true },
          presence: { key: currentUser.id }
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${currentUser.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${currentUser.id}))`
        },
        handleNewMessage
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${currentUser.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${currentUser.id}))`
        },
        handleMessageUpdate
      )
      .on('broadcast', { event: 'message-status' }, handleMessageStatusUpdate)
      .subscribe((status, error) => {
        if (error) {
          console.error('Subscription error:', error)
          setConnectionStatus('disconnected')
          return
        }

        switch (status) {
          case 'SUBSCRIBED':
            setConnectionStatus('connected')
            break
          case 'CHANNEL_ERROR':
          case 'TIMED_OUT':
          case 'CLOSED':
            setConnectionStatus('disconnected')
            break
          default:
            setConnectionStatus('connecting')
        }
      })
  }

  const handleNewMessage = (payload: any) => {
    const newMessage = payload.new as Message
    
    setMessages(prev => {
      if (prev.some(msg => msg.id === newMessage.id)) {
        return prev
      }
      // Enable smooth scrolling for real-time messages
      setShouldScrollSmooth(true)
      return [...prev, newMessage]
    })

    // Mark as read if it's for the current user
    if (newMessage.receiver_id === currentUser?.id && newMessage.sender_id === receiverId) {
      markMessageAsRead(newMessage.id)
    }

    // Update message status for sender
    if (newMessage.sender_id === currentUser?.id) {
      updateMessageStatus(newMessage.id, 'delivered')
    }
  }

  const handleMessageUpdate = (payload: any) => {
    const updatedMessage = payload.new as Message
    
    setMessages(prev => 
      prev.map(msg => 
        msg.id === updatedMessage.id ? updatedMessage : msg
      )
    )

    // Update status if message was read
    if (updatedMessage.read && updatedMessage.sender_id === currentUser?.id) {
      updateMessageStatus(updatedMessage.id, 'read')
    }
  }

  const handleMessageStatusUpdate = (payload: any) => {
    const { messageId, status } = payload.payload
    updateMessageStatus(messageId, status)
  }

  const updateMessageStatus = (messageId: string, status: MessageStatus['status']) => {
    setMessageStatuses(prev => {
      const newStatuses = new Map(prev)
      newStatuses.set(messageId, { id: messageId, status })
      return newStatuses
    })
  }

  const markMessageAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId)
      
      // Broadcast status update
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'message-status',
          payload: { messageId, status: 'read' }
        })
      }
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !currentUser || sending) return

    const messageContent = newMessage.trim()
    const tempId = `temp_${Date.now()}`
    
    // Optimistically add message to UI
    const optimisticMessage: Message = {
      id: tempId,
      content: messageContent,
      sender_id: currentUser.id,
      receiver_id: receiverId,
      created_at: new Date().toISOString(),
      read: false,
      delivered: false
    }

    setMessages(prev => [...prev, optimisticMessage])
    setMessageStatuses(prev => {
      const newStatuses = new Map(prev)
      newStatuses.set(tempId, { id: tempId, status: 'sending' })
      return newStatuses
    })
    
    // Enable smooth scrolling for user's own messages
    setShouldScrollSmooth(true)
    setNewMessage('')
    setSending(true)

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUser.id,
          receiver_id: receiverId,
          content: messageContent
        })
        .select()
        .single()

      if (error) throw error

      // Replace optimistic message with real one
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId ? { ...data, delivered: false, read: false } : msg
        )
      )
      
      updateMessageStatus(data.id, 'sent')
      
      // Remove temp status
      setMessageStatuses(prev => {
        const newStatuses = new Map(prev)
        newStatuses.delete(tempId)
        return newStatuses
      })
      
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Remove optimistic message and show error
      setMessages(prev => prev.filter(msg => msg.id !== tempId))
      updateMessageStatus(tempId, 'failed')
      
      // Show retry option for offline users
      if (!isOnline) {
        alert('You are offline. Message will be sent when connection is restored.')
      } else {
        alert('Failed to send message. Please try again.')
      }
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
                      
                      {/* Connection Status */}
                      <div className="flex items-center gap-1">
                        {!isOnline ? (
                          <>
                            <WifiOff className="w-4 h-4 text-red-500" />
                            <span className="text-xs font-bold text-red-600">OFFLINE</span>
                          </>
                        ) : connectionStatus === 'connected' ? (
                          <>
                            <Wifi className="w-4 h-4 text-green-500" />
                            <span className="text-xs font-bold text-green-600">CONNECTED</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                            <span className="text-xs font-bold text-yellow-600">
                              {connectionStatus === 'connecting' ? 'CONNECTING...' : 'RECONNECTING...'}
                            </span>
                          </>
                        )}
                      </div>
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
                const messageStatus = messageStatuses.get(message.id)
                
                const getStatusIcon = () => {
                  if (!isOwn) return null
                  
                  switch (messageStatus?.status) {
                    case 'sending':
                      return <Clock className="w-3 h-3 text-gray-400 animate-pulse" />
                    case 'sent':
                      return <Check className="w-3 h-3 text-gray-400" />
                    case 'delivered':
                      return <CheckCheck className="w-3 h-3 text-gray-400" />
                    case 'read':
                      return <CheckCheck className="w-3 h-3 text-blue-400" />
                    case 'failed':
                      return <X className="w-3 h-3 text-red-400" />
                    default:
                      if (message.read) return <CheckCheck className="w-3 h-3 text-blue-400" />
                      if (message.delivered) return <CheckCheck className="w-3 h-3 text-gray-400" />
                      return <Check className="w-3 h-3 text-gray-400" />
                  }
                }

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
                      <div className={`flex items-center justify-between mt-1 text-xs font-bold ${isOwn ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span>
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true }).toUpperCase()}
                        </span>
                        {getStatusIcon()}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="space-y-2">
            {!isOnline && (
              <div className="bg-red-400 border-2 border-black p-2 text-center">
                <p className="font-black text-sm">YOU ARE OFFLINE - MESSAGES WILL SEND WHEN RECONNECTED</p>
              </div>
            )}
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={
                  !isOnline ? "OFFLINE - TYPE MESSAGE..." :
                  connectionStatus !== 'connected' ? "CONNECTING - TYPE MESSAGE..." :
                  "TYPE YOUR MESSAGE..."
                }
                className={`flex-1 px-4 py-3 border-4 border-black font-bold placeholder:text-gray-400 focus:outline-none transition-colors ${
                  !isOnline ? 'bg-red-100 focus:bg-red-200' :
                  connectionStatus !== 'connected' ? 'bg-yellow-100 focus:bg-yellow-200' :
                  'focus:bg-yellow-100'
                }`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sending}
              />
              <button 
                type="submit" 
                disabled={sending || !newMessage.trim() || (!isOnline && connectionStatus !== 'connected')}
                className={`px-6 py-3 border-4 border-black font-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 ${
                  !isOnline ? 'bg-red-400 text-white' :
                  connectionStatus !== 'connected' ? 'bg-yellow-400 text-black' :
                  'bg-black text-white hover:bg-pink-400 hover:text-black'
                }`}
              >
                {sending ? 'SENDING...' : 
                 !isOnline ? 'OFFLINE' :
                 connectionStatus !== 'connected' ? 'CONNECTING...' :
                 'SEND →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}