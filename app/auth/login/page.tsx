import type { Metadata } from 'next'
import LoginClient from './LoginClient'

export const metadata: Metadata = {
  title: 'Sign In to BandSeeking',
  description: 'Sign in to your BandSeeking account to connect with musicians and manage your music collaborations.',
}

export default function LoginPage() {
  return <LoginClient />
}