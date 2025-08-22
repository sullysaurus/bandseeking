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
    console.log('Setting up real-time subscription for messages')
    
    const subscription = supabase
      .channel(`chat:${userId}:${receiverId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${userId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${userId}))`
        },
        (payload) => {
          console.log('Received new message via realtime:', payload.new)
          setMessages(prev => [...prev, payload.new])
          if (payload.new.receiver_id === userId) {
            markMessagesAsRead(userId)
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
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
      <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <Link href="/dashboard/messages" className="inline-flex items-center text-gray-600 hover:text-black mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Messages
          </Link>
          {receiver && (
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{receiver.full_name}</h2>
                <Link href={`/profile/${receiver.username}`} className="text-sm text-gray-600 hover:text-black">
                  View Profile
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Start a conversation with {receiver?.full_name}
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
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwn
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-black'
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-gray-300' : 'text-gray-500'}`}>
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
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
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
          />
          <Button type="submit" disabled={sending || !newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </>
  )
}