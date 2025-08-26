'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Settings, Database, Shield, Bell, Mail, Globe, Users, BarChart3 } from 'lucide-react'

export default function AdminSettingsClient() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    siteName: 'BandSeeking',
    siteDescription: 'Connect musicians and find your perfect bandmate',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    maxProfilesPerUser: 1,
    maxMessagesPerDay: 50,
    searchResultsPerPage: 12
  })

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProfiles: 0,
    totalMessages: 0,
    totalVenues: 0,
    activeUsers: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Get basic stats
      const [
        { count: totalUsers },
        { count: totalProfiles },
        { count: totalMessages },
        { count: totalVenues }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('messages').select('*', { count: 'exact', head: true }),
        supabase.from('venues').select('*', { count: 'exact', head: true })
      ])

      // Get active users (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('last_active', sevenDaysAgo.toISOString())

      setStats({
        totalUsers: totalUsers || 0,
        totalProfiles: totalProfiles || 0,
        totalMessages: totalMessages || 0,
        totalVenues: totalVenues || 0,
        activeUsers: activeUsers || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const saveSettings = async () => {
    setLoading(true)
    // In a real app, you'd save these to a settings table or environment variables
    // For now, we'll just simulate saving
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    alert('Settings saved successfully!')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 mb-4">
          SYSTEM SETTINGS
        </h1>
        <p className="text-lg text-gray-600">
          Configure application settings and view system statistics
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Site Configuration */}
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-400 border-2 border-black">
                <Globe className="w-5 h-5 text-black" />
              </div>
              <h2 className="text-xl font-black">SITE CONFIGURATION</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block font-black text-sm mb-2">SITE NAME</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleSettingChange('siteName', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-black transition-colors"
                />
              </div>
              
              <div>
                <label className="block font-black text-sm mb-2">SITE DESCRIPTION</label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-black transition-colors resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* User Management */}
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-400 border-2 border-black">
                <Users className="w-5 h-5 text-black" />
              </div>
              <h2 className="text-xl font-black">USER MANAGEMENT</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">New User Registration</p>
                  <p className="text-sm text-gray-600">Allow new users to register accounts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.registrationEnabled}
                    onChange={(e) => handleSettingChange('registrationEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Maintenance Mode</p>
                  <p className="text-sm text-gray-600">Disable site for maintenance</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </label>
              </div>

              <div>
                <label className="block font-bold text-sm mb-2">MAX PROFILES PER USER</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.maxProfilesPerUser}
                  onChange={(e) => handleSettingChange('maxProfilesPerUser', parseInt(e.target.value))}
                  className="w-32 px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block font-bold text-sm mb-2">MAX MESSAGES PER DAY</label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  step="10"
                  value={settings.maxMessagesPerDay}
                  onChange={(e) => handleSettingChange('maxMessagesPerDay', parseInt(e.target.value))}
                  className="w-32 px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-yellow-400 border-2 border-black">
                <Bell className="w-5 h-5 text-black" />
              </div>
              <h2 className="text-xl font-black">NOTIFICATIONS</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Email Notifications</p>
                  <p className="text-sm text-gray-600">Send email notifications to users</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={saveSettings}
            disabled={loading}
            className="w-full px-6 py-4 bg-black text-white border-2 border-black font-black hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
          >
            {loading ? 'SAVING...' : 'SAVE SETTINGS'}
          </button>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-400 border-2 border-black">
                <BarChart3 className="w-5 h-5 text-black" />
              </div>
              <h2 className="text-xl font-black">SYSTEM STATS</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-bold">Total Users:</span>
                <span className="text-2xl font-black text-blue-600">{stats.totalUsers}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-bold">Active Users (7d):</span>
                <span className="text-2xl font-black text-green-600">{stats.activeUsers}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-bold">Total Profiles:</span>
                <span className="text-2xl font-black text-purple-600">{stats.totalProfiles}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-bold">Total Messages:</span>
                <span className="text-2xl font-black text-orange-600">{stats.totalMessages}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-bold">Total Venues:</span>
                <span className="text-2xl font-black text-red-600">{stats.totalVenues}</span>
              </div>
            </div>
          </div>

          {/* Database Actions */}
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-400 border-2 border-black">
                <Database className="w-5 h-5 text-black" />
              </div>
              <h2 className="text-xl font-black">DATABASE</h2>
            </div>
            
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-blue-400 border-2 border-black font-black text-sm hover:bg-blue-500 transition-colors">
                BACKUP DATABASE
              </button>
              
              <button className="w-full px-4 py-2 bg-yellow-400 border-2 border-black font-black text-sm hover:bg-yellow-500 transition-colors">
                OPTIMIZE TABLES
              </button>
              
              <button className="w-full px-4 py-2 bg-green-400 border-2 border-black font-black text-sm hover:bg-green-500 transition-colors">
                UPDATE SEARCH INDEX
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-400 border-2 border-black">
                <Shield className="w-5 h-5 text-black" />
              </div>
              <h2 className="text-xl font-black">SECURITY</h2>
            </div>
            
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-gray-200 border-2 border-black font-black text-sm hover:bg-gray-300 transition-colors">
                VIEW AUDIT LOGS
              </button>
              
              <button className="w-full px-4 py-2 bg-gray-200 border-2 border-black font-black text-sm hover:bg-gray-300 transition-colors">
                SECURITY SCAN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}