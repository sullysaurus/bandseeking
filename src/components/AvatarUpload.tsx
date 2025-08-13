'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, X, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  onAvatarChange: (avatarUrl: string | null) => void
  size?: 'small' | 'medium' | 'large'
  editable?: boolean
  type?: 'user' | 'band'
  entityId?: string
}

export default function AvatarUpload({ 
  currentAvatarUrl, 
  onAvatarChange, 
  size = 'large',
  editable = true,
  type = 'user',
  entityId
}: AvatarUploadProps) {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>('')

  const sizeClasses = {
    small: 'w-10 h-10 text-sm',
    medium: 'w-16 h-16 text-lg',
    large: 'w-24 h-24 text-2xl'
  }

  const getInitial = () => {
    if (type === 'band') {
      return 'B'
    }
    if (user?.user_metadata?.username) {
      return user.user_metadata.username.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    uploadAvatar(file)
  }

  const uploadAvatar = async (file: File) => {
    if (!user) return

    try {
      setUploading(true)
      setError('')

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }

      // Delete existing avatar if it exists
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split('/').pop()
        if (oldPath && oldPath.includes(user.id)) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldPath}`])
        }
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const id = type === 'band' && entityId ? entityId : user.id
      const folder = type === 'band' ? 'band-avatars' : user.id
      const fileName = `${folder}/avatar-${Date.now()}.${fileExt}`

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      onAvatarChange(publicUrl)

    } catch (err: any) {
      console.error('Error uploading avatar:', err)
      setError(err.message || 'Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!user || !currentAvatarUrl) return

    try {
      setUploading(true)
      setError('')

      // Extract path from URL
      const path = currentAvatarUrl.split('/').slice(-2).join('/')
      
      const { error } = await supabase.storage
        .from('avatars')
        .remove([path])

      if (error) throw error

      onAvatarChange(null)

    } catch (err: any) {
      console.error('Error removing avatar:', err)
      setError(err.message || 'Failed to remove avatar')
    } finally {
      setUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="relative">
      {/* Avatar Display */}
      <div className={`${sizeClasses[size]} bg-accent-teal rounded-full flex items-center justify-center text-black font-bold relative overflow-hidden`}>
        {currentAvatarUrl ? (
          <img 
            src={currentAvatarUrl} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        ) : (
          getInitial()
        )}
        
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Edit Controls */}
      {editable && (
        <>
          {/* Upload Button */}
          <button
            type="button"
            onClick={triggerFileInput}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 bg-accent-teal hover:bg-opacity-90 text-black p-2 rounded-full shadow-lg transition-colors disabled:opacity-50"
            title="Change avatar"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Remove Button */}
          {currentAvatarUrl && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              disabled={uploading}
              className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg transition-colors disabled:opacity-50"
              title="Remove avatar"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-full left-0 mt-2 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm whitespace-nowrap">
          {error}
        </div>
      )}

      {/* Upload Instructions */}
      {editable && !currentAvatarUrl && size === 'large' && (
        <div className="absolute top-full left-0 mt-2 text-xs text-medium">
          Click camera to upload photo
        </div>
      )}
    </div>
  )
}