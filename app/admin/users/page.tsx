'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/layout/Navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Users, Search, Trash2, Edit, Eye, AlertTriangle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  full_name: string
  username: string
  zip_code: string
  profile_completed: boolean
  created_at: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [updateKey, setUpdateKey] = useState(0)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery])

  const checkAdminAccess = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user || user.email !== 'dsully15@gmail.com') {
        router.push('/dashboard')
        return
      }

      setCurrentUser(user)
      await fetchUsers()
    } catch (error) {
      console.error('Error checking admin access:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const filterUsers = () => {
    if (!searchQuery) {
      setFilteredUsers(users)
      return
    }

    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredUsers(filtered)
  }

  const handleDeleteUser = async (userId: string) => {
    console.log('handleDeleteUser called with userId:', userId)
    console.log('deleteConfirm state:', deleteConfirm)
    
    if (deleteConfirm !== userId) {
      console.log('Setting delete confirm for user:', userId)
      setDeleteConfirm(userId)
      return
    }

    console.log('Proceeding with deletion for user:', userId)

    try {
      console.log('Starting deletion process for user:', userId)

      // Call admin API to delete user
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          adminEmail: currentUser?.email
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user')
      }

      console.log('User deletion completed successfully:', result)

      // Clear delete confirmation immediately
      setDeleteConfirm(null)

      // Immediately update local state
      console.log('Current users state:', users.map(u => ({ id: u.id, email: u.email })))
      console.log('Current filteredUsers state:', filteredUsers.map(u => ({ id: u.id, email: u.email })))
      
      const updatedUsers = users.filter(user => user.id !== userId)
      const updatedFilteredUsers = filteredUsers.filter(user => user.id !== userId)
      
      console.log('Users before filter:', users.length, 'Users after filter:', updatedUsers.length)
      console.log('Filtered users before:', filteredUsers.length, 'Filtered users after:', updatedFilteredUsers.length)
      
      // Update both states with force re-render
      setUsers([...updatedUsers])
      setFilteredUsers([...updatedFilteredUsers])
      
      console.log('State updates applied')
      
      // Force component re-render
      setUpdateKey(prev => prev + 1)
      
      // Force a fresh fetch after a delay to verify deletion
      setTimeout(async () => {
        console.log('Refetching users to ensure consistency...')
        await fetchUsers()
      }, 1000)
      
      alert('User and all associated data deleted successfully')
    } catch (error: any) {
      console.error('Error in deletion process:', error)
      setDeleteConfirm(null)
      alert(`Error deleting user: ${error.message || 'Unknown error'}. Check console for details.`)
    }
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
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
              <Users className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-black">User Management</h1>
            </div>
            <p className="text-gray-600">Manage user accounts and permissions</p>
          </div>

          {/* Search and Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search users by email, name, or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-gray-600">
                Showing {filteredUsers.length} of {users.length} users
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Location</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Profile</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Joined</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody key={updateKey} className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{user.full_name}</div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-gray-900">{user.email}</div>
                        {user.email === 'dsully15@gmail.com' && (
                          <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                            Admin
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {user.zip_code || 'Not set'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          user.profile_completed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.profile_completed ? 'Complete' : 'Incomplete'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/profile/${user.username}`} target="_blank">
                            <Button variant="ghost" size="sm" className="p-2">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          
                          {user.email !== 'dsully15@gmail.com' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              {deleteConfirm === user.id ? (
                                <AlertTriangle className="w-4 h-4" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-500">
                  {searchQuery ? 'Try adjusting your search criteria' : 'No users in the system yet'}
                </p>
              </div>
            )}
          </div>

          {/* Delete Confirmation Notice */}
          {deleteConfirm && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">Confirm Deletion</p>
                  <p className="text-sm text-red-700">
                    Click the delete button again to permanently remove this user and all their data.
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