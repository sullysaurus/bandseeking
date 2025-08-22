import type { Metadata } from 'next'
import RegisterClient from './RegisterClient'

export const metadata: Metadata = {
  title: 'Join BandSeeking - Create Your Account',
  description: 'Create your free BandSeeking account to connect with musicians in your area and start collaborating on music projects.',
}

export default function RegisterPage() {
  return <RegisterClient />
}