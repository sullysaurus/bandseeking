'use client'

import React from 'react'
import Link from 'next/link'
import { Bell, Settings, User } from 'lucide-react'

interface MobilePageHeaderProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
  rightAction?: 'notifications' | 'settings' | 'profile' | React.ReactNode
}

export default function MobilePageHeader({ title, subtitle, children, rightAction }: MobilePageHeaderProps) {
  return (
    <>
      {/* Desktop Header */}
      <div className="hidden md:block">
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{title}</h1>
        {subtitle && (
          <p className="text-secondary text-sm md:text-lg">{subtitle}</p>
        )}
      </div>

      {/* Mobile Header - Compact Design */}
      <div className="md:hidden">
        <div className="flex items-center justify-between gap-3">
          {/* Title and Subtitle - On the left */}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{title}</h1>
            {subtitle && (
              <p className="text-secondary text-xs mt-0.5">{subtitle}</p>
            )}
          </div>
          
          {/* Logo on the right - aligned with text */}
          <div className="w-20 h-20 flex-shrink-0 -mt-2">
            <img 
              src="/logo-eyes.png" 
              alt="BandSeeking Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Additional content like buttons, search bars, etc. */}
      {children}
    </>
  )
}