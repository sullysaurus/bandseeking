import type { Metadata } from 'next'
import RegisterClient from './RegisterClient'

export const metadata: Metadata = {
  title: 'Join BandSeeking - Create Your Account',
  description: 'Create your free BandSeeking account to connect with musicians in your area and start collaborating on music projects.',
  keywords: 'join bandseeking, create account, musician signup, band member registration',
  alternates: {
    canonical: '/auth/register',
  },
  openGraph: {
    title: 'Join BandSeeking - Create Your Account',
    description: 'Create your free account to connect with musicians in your area.',
    type: 'website',
    url: 'https://www.bandseeking.com/auth/register',
  },
}

export default function RegisterPage() {
  return <RegisterClient />
}