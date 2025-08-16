'use client'

import { useState } from 'react'
import { Check, Upload, X } from 'lucide-react'
import { defaultAvatarOptions, headerImageOptions } from '@/lib/avatar-utils'
import Avatar from './Avatar'
import HeaderImage from './HeaderImage'

interface ImageSelectorProps {
  type: 'avatar' | 'header'
  currentSelection?: string
  currentUpload?: string
  name: string
  onSelect: (id: string) => void
  onUpload?: (file: File) => void
  onRemoveUpload?: () => void
  isOpen: boolean
  onClose: () => void
}

export default function ImageSelector({
  type,
  currentSelection,
  currentUpload,
  name,
  onSelect,
  onUpload,
  onRemoveUpload,
  isOpen,
  onClose
}: ImageSelectorProps) {
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  
  if (!isOpen) return null

  const options = type === 'avatar' ? defaultAvatarOptions : headerImageOptions

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onUpload) {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      onUpload(file)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            Choose {type === 'avatar' ? 'Avatar' : 'Header Image'}
          </h2>
          <button 
            onClick={onClose}
            className="text-medium hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Option */}
        {onUpload && (
          <div className="mb-6">
            <h3 className="text-white font-medium mb-3">Upload Custom Image</h3>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 bg-accent-teal hover:bg-opacity-90 text-black font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              
              {currentUpload && onRemoveUpload && (
                <button
                  onClick={onRemoveUpload}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove Upload
                </button>
              )}
            </div>
            
            {/* Upload Preview */}
            {(uploadPreview || currentUpload) && (
              <div className="mt-3">
                {type === 'avatar' ? (
                  <Avatar 
                    src={uploadPreview || currentUpload}
                    name={name}
                    size="lg"
                  />
                ) : (
                  <HeaderImage 
                    src={uploadPreview || currentUpload}
                    height="sm"
                    className="max-w-xs"
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Default Options */}
        <div>
          <h3 className="text-white font-medium mb-3">
            Choose from {type === 'avatar' ? 'Default Avatars' : 'Header Patterns'}
          </h3>
          <div className={`grid gap-3 ${type === 'avatar' ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {options.map((option) => (
              <div
                key={option.id}
                className={`
                  relative cursor-pointer rounded-lg border-2 transition-colors p-3
                  ${currentSelection === option.id 
                    ? 'border-accent-teal bg-accent-teal/10' 
                    : 'border-border hover:border-accent-teal/50'
                  }
                `}
                onClick={() => onSelect(option.id)}
              >
                {/* Preview */}
                <div className="flex flex-col items-center gap-2">
                  {type === 'avatar' ? (
                    <Avatar 
                      name={name}
                      selectedAvatarId={option.id}
                      size="lg"
                    />
                  ) : (
                    <HeaderImage 
                      selectedHeaderId={option.id}
                      height="sm"
                      className="w-full"
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-xs font-medium bg-black/20 px-2 py-1 rounded">
                          Preview
                        </span>
                      </div>
                    </HeaderImage>
                  )}
                  
                  <div className="text-center">
                    <p className="text-white text-sm font-medium">{option.name}</p>
                    {type === 'header' && 'description' in option && (
                      <p className="text-secondary text-xs">{option.description}</p>
                    )}
                  </div>
                </div>

                {/* Selected Indicator */}
                {currentSelection === option.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-accent-teal rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-black" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-secondary hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="bg-accent-teal hover:bg-opacity-90 text-black font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}