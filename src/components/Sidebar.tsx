'use client'

import { useState, useEffect } from 'react'
import { Users, Music, User, MessageSquare, Briefcase, Network, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import AvatarUpload from './AvatarUpload'
import { StylizedLogo } from './Logo'
import { profileService } from '@/lib/profiles'

export default function Sidebar() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const profile = await profileService.getProfile()
      if (profile) {
        setAvatarUrl(profile.avatar_url)
      }
    } catch (error) {
      console.error('Error loading profile for sidebar:', error)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/signin')
  }

  const handleAvatarChange = (newAvatarUrl: string | null) => {
    setAvatarUrl(newAvatarUrl)
  }

  const getInitial = () => {
    if (user?.user_metadata?.username) {
      return user.user_metadata.username.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const getDisplayName = () => {
    return user?.user_metadata?.full_name || 
           user?.user_metadata?.username || 
           user?.email?.split('@')[0] || 
           'User'
  }

  return (
    <div className="w-64 bg-sidebar min-h-screen p-4 flex-col hidden md:flex">
      {/* Logo */}
      <div className="mb-6 px-2">
        <Link href="/dashboard">
          <StylizedLogo size="md" />
        </Link>
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3 mb-8">
        <AvatarUpload
          currentAvatarUrl={avatarUrl}
          onAvatarChange={handleAvatarChange}
          size="small"
          editable={false}
        />
        <div>
          <div className="text-white font-medium">{getDisplayName()}</div>
          <div className="text-secondary text-sm">{user?.email}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 flex-1">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-secondary hover:text-white hover:bg-card transition-colors">
          <div className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>
        
        <Link href="/find-musicians" className="flex items-center gap-3 px-3 py-2 rounded-lg text-secondary hover:text-white hover:bg-card transition-colors">
          <Users className="w-5 h-5" />
          <span>Find Musicians</span>
          <span className="ml-auto bg-success text-white text-xs px-2 py-1 rounded-full">8</span>
        </Link>
        
        <Link href="/find-bands" className="flex items-center gap-3 px-3 py-2 rounded-lg text-secondary hover:text-white hover:bg-card transition-colors">
          <Music className="w-5 h-5" />
          <span>Find Bands</span>
          <span className="ml-auto bg-accent-purple text-white text-xs px-2 py-1 rounded-full">6</span>
        </Link>
        
        <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg text-secondary hover:text-white hover:bg-card transition-colors">
          <User className="w-5 h-5" />
          <span>My Profile</span>
        </Link>

        <Link href="/bands" className="flex items-center gap-3 px-3 py-2 rounded-lg text-medium hover:text-white hover:bg-card transition-colors mt-6">
          <Music className="w-5 h-5" />
          <span>My Bands</span>
        </Link>

        <Link href="/messages" className="flex items-center gap-3 px-3 py-2 rounded-lg text-secondary hover:text-white hover:bg-card transition-colors mt-4">
          <MessageSquare className="w-5 h-5" />
          <span>Messages</span>
          <div className="w-2 h-2 bg-red-500 rounded-full ml-auto" />
        </Link>
        
        <Link href="/opportunities" className="flex items-center gap-3 px-3 py-2 rounded-lg text-secondary hover:text-white hover:bg-card transition-colors">
          <Briefcase className="w-5 h-5" />
          <span>Opportunities</span>
          <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded-full">New</span>
        </Link>
        
        <Link href="/connections" className="flex items-center gap-3 px-3 py-2 rounded-lg text-secondary hover:text-white hover:bg-card transition-colors">
          <Network className="w-5 h-5" />
          <span>Connections</span>
        </Link>
      </nav>

      {/* Start a Band Button */}
      <Link 
        href="/bands/create" 
        className="block w-full bg-accent-teal text-black font-medium py-3 rounded-lg mb-4 hover:bg-opacity-90 transition-colors text-center"
      >
        + Start a Band
      </Link>

      {/* Sign Out */}
      <button 
        onClick={handleSignOut}
        className="flex items-center gap-3 px-3 py-2 text-secondary hover:text-white transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span>Sign Out</span>
      </button>
    </div>
  )
}