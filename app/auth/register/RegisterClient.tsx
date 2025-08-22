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
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Join BandSeeking</h1>
            <p className="text-gray-600">Connect with musicians in your area</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              {...register('fullName')}
              error={errors.fullName?.message}
            />

            <Input
              label="Username"
              placeholder="johndoe"
              {...register('username')}
              error={errors.username?.message}
            />

            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              {...register('email')}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              error={errors.password?.message}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />

            <Input
              label="ZIP Code"
              placeholder="12345"
              maxLength={5}
              {...register('zipCode')}
              error={errors.zipCode?.message}
            />

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-black hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  )
}