'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ensureUserRecord } from '@/lib/auth-helpers'
import Navigation from '@/components/layout/Navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import GoogleAuthButton from '@/components/auth/GoogleAuthButton'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginClient() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (authError) throw authError

      // Ensure user record exists and get user data
      const userData = await ensureUserRecord()
      
      // Use router.push for smoother navigation
      if (userData.profile_completed) {
        router.push('/dashboard')
      } else {
        router.push('/onboarding')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-cyan-300 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white border-8 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-black mb-2">WELCOME BACK!</h1>
              <p className="font-bold text-lg">LET&apos;S MAKE SOME NOISE</p>
            </div>

            <div className="mb-6">
              <GoogleAuthButton text="SIGN IN WITH GOOGLE" />
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-4 border-black"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 font-black text-sm">OR</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

              {error && (
                <div className="p-3 bg-red-400 border-4 border-black">
                  <p className="font-black text-sm">{error.toUpperCase()}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-black text-white border-4 border-black font-black text-lg hover:bg-pink-400 hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
              >
                {isLoading ? 'SIGNING IN...' : 'SIGN IN →'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t-4 border-black">
              <p className="text-center font-bold">
                NO ACCOUNT YET?
              </p>
              <Link 
                href="/auth/register" 
                className="block mt-2 px-6 py-3 bg-yellow-300 border-4 border-black font-black text-center hover:bg-yellow-400 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                CREATE ACCOUNT →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}