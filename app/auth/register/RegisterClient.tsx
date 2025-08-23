'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/layout/Navigation'
import GoogleAuthButton from '@/components/auth/GoogleAuthButton'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterClient() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEmailForm, setShowEmailForm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Create auth user with minimal data - rest will be collected in onboarding
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password
      })

      if (authError) throw authError

      if (authData.user) {
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

            {!showEmailForm ? (
              <div className="space-y-4">
                <GoogleAuthButton text="SIGN UP WITH GOOGLE" />
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-4 border-black"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 font-black text-sm">OR</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowEmailForm(true)}
                  className="w-full px-6 py-3 bg-cyan-300 border-4 border-black font-black text-lg hover:bg-cyan-400 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  SIGN UP WITH EMAIL →
                </button>
                
                <p className="text-center font-bold text-sm text-gray-600 mt-4">
                  WE'LL COLLECT YOUR DETAILS AFTER SIGN UP
                </p>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowEmailForm(false)}
                  className="mb-6 font-black text-sm hover:text-pink-400 transition-colors"
                >
                  ← BACK TO OPTIONS
                </button>
                
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
              </>
            )}

            <div className="mt-8 pt-6 border-t-4 border-black">
              <p className="text-center font-bold">
                ALREADY A MEMBER?
              </p>
              <Link 
                href="/auth/login" 
                className="block mt-2 px-6 py-3 bg-yellow-300 border-4 border-black font-black text-center hover:bg-yellow-400 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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