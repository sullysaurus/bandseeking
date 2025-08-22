'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/layout/Navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { MessageSquare, Search, Trash2, AlertTriangle, ArrowLeft, Clock } from 'lucide-react'
import Link from 'next/link'

interface MessageWithUsers {
  id: string
  content: string
  sender_id: string
  receiver_id: string
  read: boolean
  created_at: string
  sender: {
    full_name: string
    username: string
    email: string
  }
  receiver: {
    full_name: string
    username: string
    email: string
  }
}

export default function AdminMessagesPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [messages, setMessages] = useState<MessageWithUsers[]>([])
  const [filteredMessages, setFilteredMessages] = useState<MessageWithUsers[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  useEffect(() => {
    filterMessages()
  }, [messages, searchQuery])

  const checkAdminAccess = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user || user.email !== 'dsully15@gmail.com') {
        router.push('/dashboard')
        return
      }

      setCurrentUser(user)
      await fetchMessages()
    } catch (error) {
      console.error('Error checking admin access:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(full_name, username, email),
          receiver:users!messages_receiver_id_fkey(full_name, username, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100) // Limit to latest 100 messages for performance

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const filterMessages = () => {
    if (!searchQuery) {
      setFilteredMessages(messages)
      return
    }

    const filtered = messages.filter(message =>
      message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.sender.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.receiver.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.sender.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.receiver.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredMessages(filtered)
  }

  const deleteMessage = async (messageId: string) => {
    if (deleteConfirm !== messageId) {
      setDeleteConfirm(messageId)
      return
    }

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error

      // Update local state
      setMessages(messages.filter(message => message.id !== messageId))
      setDeleteConfirm(null)
      alert('Message deleted successfully')
    } catch (error) {
      console.error('Error deleting message:', error)
      alert('Error deleting message')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading messages...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/admin" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Admin</span>
              </Link>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-8 h-8 text-orange-600" />
              <h1 className="text-3xl font-bold text-black">Message Moderation</h1>
            </div>
            <p className="text-gray-600">Monitor and moderate user conversations</p>
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-gray-600">
                Showing {filteredMessages.length} of {messages.length} messages (latest 100)
              </div>
            </div>
          </div>

          {/* Messages List */}
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <div key={message.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Message Header */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {message.sender.full_name}
                        </span>
                        <span className="text-sm text-gray-500">
                          @{message.sender.username}
                        </span>
                      </div>
                      
                      <div className="text-gray-400">→</div>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {message.receiver.full_name}
                        </span>
                        <span className="text-sm text-gray-500">
                          @{message.receiver.username}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500 ml-auto">
                        <Clock className="w-4 h-4" />
                        {formatDate(message.created_at)}
                      </div>

                      {!message.read && (
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <p className="text-gray-900 whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {/* Message Meta */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>From: {message.sender.email}</span>
                      <span>To: {message.receiver.email}</span>
                      <span>Status: {message.read ? 'Read' : 'Unread'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMessage(message.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deleteConfirm === message.id ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredMessages.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? 'Try adjusting your search criteria' 
                  : 'No messages in the system yet'
                }
              </p>
            </div>
          )}

          {/* Delete Confirmation Notice */}
          {deleteConfirm && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">Confirm Deletion</p>
                  <p className="text-sm text-red-700">
                    Click the delete button again to permanently remove this message.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteConfirm(null)}
                  className="text-red-600 hover:text-red-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}