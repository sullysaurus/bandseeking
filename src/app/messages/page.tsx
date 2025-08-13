'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Search, Plus, Send } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import ProtectedRoute from '@/components/ProtectedRoute'
import { messageService, Conversation, Message } from '@/lib/messages'
import { useAuth } from '@/contexts/AuthContext'

export default function MessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  const loadConversations = async () => {
    setLoading(true)
    const data = await messageService.getConversations()
    setConversations(data)
    setLoading(false)
  }

  const loadMessages = async (conversationId: string) => {
    const data = await messageService.getMessages(conversationId)
    setMessages(data)
    // Mark conversation as read
    await messageService.markAsRead(conversationId)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedConversation || !newMessage.trim() || sending) return

    setSending(true)
    const message = await messageService.sendMessage(selectedConversation.id, newMessage.trim())
    
    if (message) {
      setMessages(prev => [...prev, message])
      setNewMessage('')
      // Update conversation list
      loadConversations()
    }
    
    setSending(false)
  }

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants?.find(p => p.user_id !== user?.id)
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        
        <main className="flex-1 flex">
          {/* Conversations List */}
          <div className="w-80 bg-card border-r border-border flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-white">Messages</h1>
                <button className="bg-accent-teal hover:bg-opacity-90 text-black p-2 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medium w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search conversations..." 
                  className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-secondary">Loading conversations...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center">
                  <MessageSquare className="w-12 h-12 text-medium mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No conversations yet</h3>
                  <p className="text-secondary text-sm">Start a conversation with other musicians!</p>
                </div>
              ) : (
                conversations.map((conversation) => {
                  const otherUser = getOtherParticipant(conversation)
                  const isSelected = selectedConversation?.id === conversation.id
                  
                  return (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-4 border-b border-border cursor-pointer transition-colors ${
                        isSelected ? 'bg-accent-teal/10' : 'hover:bg-background/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-accent-teal rounded-full flex items-center justify-center text-black font-bold shrink-0">
                          {otherUser?.user?.avatar_url ? (
                            <img 
                              src={otherUser.user.avatar_url} 
                              alt="Avatar" 
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            otherUser?.user?.email?.charAt(0).toUpperCase() || 'U'
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-white font-medium truncate">
                              {otherUser?.user?.raw_user_meta_data?.username || 
                               otherUser?.user?.email?.split('@')[0] || 
                               'Unknown User'}
                            </h3>
                            {conversation.last_message && (
                              <span className="text-xs text-medium">
                                {formatMessageTime(conversation.last_message.created_at)}
                              </span>
                            )}
                          </div>
                          
                          {conversation.last_message && (
                            <p className="text-sm text-secondary truncate">
                              {conversation.last_message.content}
                            </p>
                          )}
                          
                          {conversation.unread_count > 0 && (
                            <div className="flex items-center justify-between mt-2">
                              <div />
                              <span className="bg-accent-teal text-black text-xs px-2 py-1 rounded-full">
                                {conversation.unread_count}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-card border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent-teal rounded-full flex items-center justify-center text-black font-bold">
                      {(() => {
                        const otherUser = getOtherParticipant(selectedConversation)
                        return otherUser?.user?.avatar_url ? (
                          <img 
                            src={otherUser.user.avatar_url} 
                            alt="Avatar" 
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          otherUser?.user?.email?.charAt(0).toUpperCase() || 'U'
                        )
                      })()}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        {(() => {
                          const otherUser = getOtherParticipant(selectedConversation)
                          return otherUser?.user?.raw_user_meta_data?.username || 
                                 otherUser?.user?.email?.split('@')[0] || 
                                 'Unknown User'
                        })()}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => {
                    const isOwn = message.sender_id === user?.id
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwn 
                            ? 'bg-accent-teal text-black' 
                            : 'bg-card text-white'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isOwn ? 'text-black/70' : 'text-medium'
                          }`}>
                            {formatMessageTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 bg-card border-t border-border">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="bg-accent-teal hover:bg-opacity-90 text-black p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* No Conversation Selected */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-medium mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
                  <p className="text-secondary">Choose a conversation from the sidebar to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}