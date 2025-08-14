'use client'

import { useState, useEffect } from 'react'
import { Users, UserPlus, UserCheck, UserX, Clock, Search, Music, MapPin, X, Check, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import ProtectedRoute from '@/components/ProtectedRoute'
import { connectionService, Connection } from '@/lib/connections'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

type TabType = 'connections' | 'received' | 'sent'

export default function ConnectionsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('connections')
  const [connections, setConnections] = useState<Connection[]>([])
  const [receivedRequests, setReceivedRequests] = useState<Connection[]>([])
  const [sentRequests, setSentRequests] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadConnections()
  }, [])

  const loadConnections = async () => {
    setLoading(true)
    try {
      const [friends, received, sent] = await Promise.all([
        connectionService.getFriends(),
        connectionService.getReceivedRequests(),
        connectionService.getSentRequests()
      ])
      
      setConnections(friends)
      setReceivedRequests(received)
      setSentRequests(sent)
    } catch (error) {
      console.error('Error loading connections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (connectionId: string) => {
    const success = await connectionService.acceptRequest(connectionId)
    if (success) {
      await loadConnections()
    }
  }

  const handleReject = async (connectionId: string) => {
    const success = await connectionService.rejectRequest(connectionId)
    if (success) {
      await loadConnections()
    }
  }

  const handleCancel = async (connectionId: string) => {
    const success = await connectionService.cancelRequest(connectionId)
    if (success) {
      await loadConnections()
    }
  }

  const handleRemove = async (connectionId: string) => {
    if (confirm('Are you sure you want to remove this connection?')) {
      const success = await connectionService.removeConnection(connectionId)
      if (success) {
        await loadConnections()
      }
    }
  }

  const handleMessage = (connection: Connection) => {
    const otherUserId = connection.requester_id === user?.id 
      ? connection.recipient_id 
      : connection.requester_id
    router.push(`/messages?user=${otherUserId}`)
  }

  const filterConnections = (items: Connection[]) => {
    if (!searchTerm) return items
    
    const search = searchTerm.toLowerCase()
    return items.filter(item => {
      const name = item.requester_id === user?.id 
        ? item.recipient_name 
        : item.requester_name
      const username = item.requester_id === user?.id 
        ? item.recipient_username 
        : item.requester_username
      
      return name?.toLowerCase().includes(search) || 
             username?.toLowerCase().includes(search)
    })
  }

  const ConnectionCard = ({ connection, type }: { connection: Connection; type: 'connection' | 'received' | 'sent' }) => {
    const isRequester = connection.requester_id === user?.id
    const profile = {
      id: isRequester ? connection.recipient_id : connection.requester_id,
      name: isRequester ? connection.recipient_name : connection.requester_name,
      username: isRequester ? connection.recipient_username : connection.requester_username,
      avatar: isRequester ? connection.recipient_avatar : connection.requester_avatar,
      location: isRequester ? connection.recipient_location : connection.requester_location,
      instruments: isRequester ? connection.recipient_instruments : connection.requester_instruments,
      genres: isRequester ? connection.recipient_genres : connection.requester_genres,
    }

    return (
      <div className="bg-card rounded-lg p-6 hover:bg-opacity-80 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <Link href={`/profile/${profile.username}`}>
              {profile.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt={profile.name || ''} 
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-button-secondary rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-medium">
                    {(profile.name || profile.username || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </Link>

            {/* Info */}
            <div className="flex-1">
              <Link 
                href={`/profile/${profile.username}`}
                className="text-white font-medium hover:text-accent-teal transition-colors"
              >
                {profile.name || profile.username}
              </Link>
              <p className="text-secondary text-sm">@{profile.username}</p>
              
              {profile.location && (
                <div className="flex items-center gap-1 text-medium text-sm mt-1">
                  <MapPin className="w-3 h-3" />
                  {profile.location}
                </div>
              )}

              {/* Instruments & Genres */}
              <div className="mt-3 space-y-2">
                {profile.instruments && profile.instruments.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {profile.instruments.slice(0, 3).map((instrument) => (
                      <span 
                        key={instrument}
                        className="bg-accent-teal/20 text-accent-teal px-2 py-0.5 rounded text-xs"
                      >
                        {instrument}
                      </span>
                    ))}
                    {profile.instruments.length > 3 && (
                      <span className="text-medium text-xs">
                        +{profile.instruments.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                
                {profile.genres && profile.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {profile.genres.slice(0, 3).map((genre) => (
                      <span 
                        key={genre}
                        className="bg-accent-purple/20 text-accent-purple px-2 py-0.5 rounded text-xs"
                      >
                        {genre}
                      </span>
                    ))}
                    {profile.genres.length > 3 && (
                      <span className="text-medium text-xs">
                        +{profile.genres.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Message for pending requests */}
              {connection.message && type !== 'connection' && (
                <div className="mt-3 p-2 bg-background rounded text-secondary text-sm">
                  "{connection.message}"
                </div>
              )}

              {/* Connection date */}
              {type === 'connection' && connection.accepted_at && (
                <p className="text-medium text-xs mt-2">
                  Connected since {new Date(connection.accepted_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {type === 'connection' && (
              <>
                <button
                  onClick={() => handleMessage(connection)}
                  className="flex items-center gap-2 bg-accent-teal hover:bg-opacity-90 text-white px-3 py-1.5 rounded text-sm transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Message
                </button>
                <button
                  onClick={() => handleRemove(connection.id)}
                  className="flex items-center gap-2 bg-button-secondary hover:bg-opacity-80 text-white px-3 py-1.5 rounded text-sm transition-colors"
                >
                  <UserX className="w-4 h-4" />
                  Remove
                </button>
              </>
            )}
            
            {type === 'received' && (
              <>
                <button
                  onClick={() => handleAccept(connection.id)}
                  className="flex items-center gap-2 bg-success hover:bg-opacity-90 text-white px-3 py-1.5 rounded text-sm transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Accept
                </button>
                <button
                  onClick={() => handleReject(connection.id)}
                  className="flex items-center gap-2 bg-red-500 hover:bg-opacity-90 text-white px-3 py-1.5 rounded text-sm transition-colors"
                >
                  <X className="w-4 h-4" />
                  Decline
                </button>
              </>
            )}
            
            {type === 'sent' && (
              <button
                onClick={() => handleCancel(connection.id)}
                className="flex items-center gap-2 bg-button-secondary hover:bg-opacity-80 text-white px-3 py-1.5 rounded text-sm transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const getActiveData = () => {
    switch (activeTab) {
      case 'connections':
        return filterConnections(connections)
      case 'received':
        return filterConnections(receivedRequests)
      case 'sent':
        return filterConnections(sentRequests)
      default:
        return []
    }
  }

  const activeData = getActiveData()

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Connections</h1>
            <p className="text-secondary">Manage your musical network</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-card rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-teal/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent-teal" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{connections.length}</p>
                  <p className="text-secondary text-sm">Connections</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{receivedRequests.length}</p>
                  <p className="text-secondary text-sm">Pending Requests</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-purple/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent-purple" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{sentRequests.length}</p>
                  <p className="text-secondary text-sm">Sent Requests</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-card">
            <button
              onClick={() => setActiveTab('connections')}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'connections'
                  ? 'text-white border-b-2 border-accent-teal'
                  : 'text-secondary hover:text-white'
              }`}
            >
              My Connections ({connections.length})
            </button>
            <button
              onClick={() => setActiveTab('received')}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'received'
                  ? 'text-white border-b-2 border-accent-teal'
                  : 'text-secondary hover:text-white'
              }`}
            >
              Requests Received ({receivedRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'sent'
                  ? 'text-white border-b-2 border-accent-teal'
                  : 'text-secondary hover:text-white'
              }`}
            >
              Requests Sent ({sentRequests.length})
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medium w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search connections..."
                className="w-full bg-card border border-card rounded-lg pl-12 pr-4 py-3 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal"
              />
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-secondary">Loading connections...</p>
            </div>
          ) : activeData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeData.map((connection) => (
                <ConnectionCard 
                  key={connection.id} 
                  connection={connection} 
                  type={activeTab === 'connections' ? 'connection' : activeTab === 'received' ? 'received' : 'sent'}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-lg">
              <Users className="w-12 h-12 text-medium mx-auto mb-4" />
              <p className="text-white font-medium mb-2">
                {activeTab === 'connections' && 'No connections yet'}
                {activeTab === 'received' && 'No pending requests'}
                {activeTab === 'sent' && 'No sent requests'}
              </p>
              <p className="text-secondary text-sm mb-4">
                {activeTab === 'connections' && 'Start connecting with other musicians!'}
                {activeTab === 'received' && 'When musicians want to connect, they\'ll appear here'}
                {activeTab === 'sent' && 'Your pending connection requests will appear here'}
              </p>
              {activeTab === 'connections' && (
                <Link
                  href="/find-musicians"
                  className="inline-flex items-center gap-2 bg-accent-teal hover:bg-opacity-90 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Find Musicians
                </Link>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}