'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { MessageSquare } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Sidebar from '@/components/Sidebar'
import ProtectedRoute from '@/components/ProtectedRoute'
import MobilePageHeader from '@/components/MobilePageHeader'
import RealtimeChat from '@/components/RealtimeChat'
import ConversationList from '@/components/ConversationList'
import { conversationService } from '@/lib/conversations'

function MessagesContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [selectedIsPublic, setSelectedIsPublic] = useState(false)
  const [otherParticipant, setOtherParticipant] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Check for direct conversation link (from Contact buttons)
  useEffect(() => {
    const userId = searchParams.get('user')
    if (userId && user) {
      startConversationWithUser(userId)
    }
  }, [searchParams, user])

  const startConversationWithUser = async (otherUserId: string) => {
    if (!user || otherUserId === user.id) return

    setLoading(true)
    try {
      // Get or create conversation
      const conversationId = await conversationService.getOrCreateConversation(otherUserId)
      
      // Get user profile for display
      // For now, we'll need to fetch this from profiles table
      // You might want to add a method to conversationService for this
      
      setSelectedConversationId(conversationId)
      setSelectedIsPublic(false)
      setOtherParticipant({ id: otherUserId, username: 'Unknown User', full_name: null, avatar_url: null })
    } catch (error) {
      console.error('Error starting conversation:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectConversation = (conversationId: string, participant: any) => {
    setSelectedConversationId(conversationId)
    setSelectedIsPublic(false)
    setOtherParticipant(participant)
  }


  if (!user) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 flex items-center justify-center">
            <div className="text-white">Please sign in to access messages.</div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <MobilePageHeader 
                title="Messages"
                subtitle="Connect with musicians in real-time"
              />
            </div>

            {/* Chat Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Conversation List */}
              <div className="lg:col-span-1">
                <ConversationList
                  user={user}
                  selectedConversationId={selectedConversationId || undefined}
                  selectedIsPublic={selectedIsPublic}
                  onSelectConversation={handleSelectConversation}
                  onSelectPublic={() => {}}
                />
              </div>

              {/* Chat Area */}
              <div className="lg:col-span-2">
                {loading ? (
                  <div className="flex items-center justify-center h-96 bg-card rounded-lg border border-border">
                    <div className="text-secondary">Starting conversation...</div>
                  </div>
                ) : selectedConversationId ? (
                  <RealtimeChat
                    user={user}
                    conversationId={selectedConversationId}
                    isPublic={false}
                    otherParticipant={otherParticipant}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 bg-card rounded-lg border border-border">
                    <MessageSquare className="w-12 h-12 text-medium mb-4" />
                    <h3 className="text-white font-medium mb-2">Welcome to Messages</h3>
                    <p className="text-secondary text-center max-w-sm">
                      Select a conversation from the sidebar or go to find-musicians and click "Message" to start chatting with other musicians.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-card rounded-lg border border-border">
              <h3 className="text-white font-medium mb-2">How to use messaging:</h3>
              <ul className="text-secondary text-sm space-y-1">
                <li>• <strong>Private Messages:</strong> Click "Message" on any musician profile to start chatting</li>
                <li>• <strong>Real-time:</strong> Messages are delivered instantly</li>
                <li>• <strong>Conversations:</strong> All your chats appear in the sidebar</li>
                <li>• <strong>Keyboard shortcut:</strong> Press Enter to send messages</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <ProtectedRoute>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 flex items-center justify-center">
            <div className="text-white">Loading messages...</div>
          </main>
        </div>
      </ProtectedRoute>
    }>
      <MessagesContent />
    </Suspense>
  )
}