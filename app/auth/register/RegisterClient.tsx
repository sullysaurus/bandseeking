'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/layout/Navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  zipCode: z.string().regex(/^\d{5}$/, 'Please enter a valid 5-digit ZIP code')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterClient() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  })

  const checkUsernameAvailability = async (username: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single()

      console.log('Username check result:', { username, data, error: error?.code })

      // If no data found (error code PGRST116), username is available
      // If data exists, username is taken
      // If other error, log it and assume unavailable for safety
      if (error?.code === 'PGRST116') {
        return true // Username available
      } else if (data) {
        return false // Username taken
      } else {
        console.error('Unexpected error checking username:', error)
        return false // Assume unavailable for safety
      }
    } catch (err) {
      console.error('Error in checkUsernameAvailability:', err)
      return false // Assume unavailable for safety
    }
  }

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Check username availability
      const isAvailable = await checkUsernameAvailability(data.username)
      if (!isAvailable) {
        setFormError('username', { message: 'Username is already taken' })
        setIsLoading(false)
        return
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            username: data.username,
            zip_code: data.zipCode
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // User record should be created automatically by Supabase
        // The ensureUserRecord function in onboarding will handle any missing records
        router.push('/auth/verify?email=' + encodeURIComponent(data.email))
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-pink-300 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white border-8 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-black mb-2">JOIN THE BAND!</h1>
              <p className="font-bold text-lg">START YOUR MUSIC JOURNEY</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block font-black mb-2 text-sm">FULL NAME</label>
                <input
                  placeholder="YOUR NAME"
                  {...register('fullName')}
                  className="w-full px-4 py-3 border-4 border-black font-bold placeholder:text-gray-400 focus:outline-none focus:bg-yellow-100 transition-colors"
                />
                {errors.fullName && (
                  <p className="mt-1 font-bold text-sm text-red-600">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block font-black mb-2 text-sm">USERNAME</label>
                <input
                  placeholder="PICK A USERNAME"
                  {...register('username')}
                  className="w-full px-4 py-3 border-4 border-black font-bold placeholder:text-gray-400 focus:outline-none focus:bg-yellow-100 transition-colors"
                />
                {errors.username && (
                  <p className="mt-1 font-bold text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label className="block font-black mb-2 text-sm">EMAIL</label>
                <input
                  type="email"
                  placeholder="YOUR@EMAIL.COM"
                  {...register('email')}
                  className="w-full px-4 py-3 border-4 border-black font-bold placeholder:text-gray-400 focus:outline-none focus:bg-yellow-100 transition-colors"
                />
                {errors.email && (
                  <p className="mt-1 font-bold text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block font-black mb-2 text-sm">PASSWORD</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full px-4 py-3 border-4 border-black font-bold placeholder:text-gray-400 focus:outline-none focus:bg-yellow-100 transition-colors"
                />
                {errors.password && (
                  <p className="mt-1 font-bold text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block font-black mb-2 text-sm">CONFIRM PASSWORD</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className="w-full px-4 py-3 border-4 border-black font-bold placeholder:text-gray-400 focus:outline-none focus:bg-yellow-100 transition-colors"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 font-bold text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block font-black mb-2 text-sm">ZIP CODE</label>
                <input
                  placeholder="12345"
                  maxLength={5}
                  {...register('zipCode')}
                  className="w-full px-4 py-3 border-4 border-black font-bold placeholder:text-gray-400 focus:outline-none focus:bg-yellow-100 transition-colors"
                />
                {errors.zipCode && (
                  <p className="mt-1 font-bold text-sm text-red-600">{errors.zipCode.message}</p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-400 border-4 border-black">
                  <p className="font-black text-sm">{error.toUpperCase()}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-black text-white border-4 border-black font-black text-lg hover:bg-lime-400 hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
              >
                {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT →'}
              </button>

            </form>

            <div className="mt-6 pt-6 border-t-4 border-black">
              <p className="text-center font-bold">
                ALREADY A MEMBER?
              </p>
              <Link 
                href="/auth/login" 
                className="block mt-2 px-6 py-3 bg-cyan-300 border-4 border-black font-black text-center hover:bg-cyan-400 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                SIGN IN →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}