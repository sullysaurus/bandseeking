'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Notification {
  id: string
  type: 'message' | 'profile_saved' | 'new_follower'
  title: string
  message: string
  related_user_id?: string
  related_message_id?: string
  related_profile_id?: string
  read: boolean
  created_at: string
}

export default function NotificationsCard() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error

      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.read).length || 0)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) throw error

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return '💬'
      case 'profile_saved':
        return '⭐'
      case 'new_follower':
        return '👤'
      default:
        return '🔔'
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (loading) {
    return (
      <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black">NOTIFICATIONS</h2>
          <div className="w-6 h-6 bg-gray-300 border-2 border-black rounded-full animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-3 bg-gray-100 border-2 border-gray-300 animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black">NOTIFICATIONS</h2>
        {unreadCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500 border-2 border-black rounded-full flex items-center justify-center">
              <span className="text-white font-black text-xs">{unreadCount}</span>
            </div>
            <button
              onClick={markAllAsRead}
              className="text-xs font-bold text-purple-600 hover:text-purple-800 underline"
            >
              Mark all read
            </button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🔔</div>
          <p className="font-bold text-gray-600">No notifications yet!</p>
          <p className="text-sm font-bold text-gray-500 mt-1">
            You&apos;ll be notified when someone messages you or saves your profile.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 border-2 border-black cursor-pointer transition-colors ${
                notification.read 
                  ? 'bg-gray-50 hover:bg-gray-100' 
                  : 'bg-yellow-100 hover:bg-yellow-200 border-yellow-400'
              }`}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <div className="flex items-start gap-3">
                <div className="text-lg flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm leading-tight ${
                    notification.read ? 'text-gray-700' : 'text-black'
                  }`}>
                    {notification.title}
                  </p>
                  <p className={`text-xs mt-1 ${
                    notification.read ? 'text-gray-500' : 'text-gray-700'
                  }`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {getTimeAgo(notification.created_at)}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {notifications.length > 0 && (
        <div className="mt-4 pt-3 border-t-2 border-black">
          <Link
            href="/dashboard/notifications"
            className="block w-full text-center px-4 py-2 bg-black text-white border-2 border-black font-black text-sm hover:bg-gray-800 transition-colors"
          >
            VIEW ALL NOTIFICATIONS →
          </Link>
        </div>
      )}
    </div>
  )
}