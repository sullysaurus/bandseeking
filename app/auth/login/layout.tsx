import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login | BandSeeking',
  description: 'Sign in to your BandSeeking account to connect with musicians in your area.',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}