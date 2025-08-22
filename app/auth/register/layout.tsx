import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | BandSeeking',
  description: 'Create your free BandSeeking account and start connecting with musicians in your area.',
  openGraph: {
    title: 'Join BandSeeking - Connect with Musicians',
    description: 'Create your free account and start finding bandmates today.',
  }
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}