import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import Footer from '@/components/layout/Footer'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
}

export const metadata: Metadata = {
  title: {
    template: '%s | BandSeeking',
    default: 'BandSeeking - Connect with Musicians',
  },
  description: 'A better way to connect with musicians. Find band members, collaborate on music projects, and join the musician community.',
  keywords: 'musicians, band members, find musicians, music collaboration, band seeking, connect with musicians',
  authors: [{ name: 'BandSeeking Team' }],
  creator: 'BandSeeking',
  publisher: 'BandSeeking',
  metadataBase: new URL('https://www.bandseeking.com'),
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'X6fxCkBJkNoHSNESefhZYNtahOnpsI4cqHRYMRlzpGA',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.bandseeking.com',
    siteName: 'BandSeeking',
    title: 'BandSeeking - Connect with Musicians',
    description: 'A better way to connect with musicians. Find band members, collaborate on music projects, and join the musician community.',
    images: [{
      url: '/social.png',
      width: 1200,
      height: 630,
      alt: 'BandSeeking - Connect with Musicians',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@bandseeking',
    creator: '@bandseeking',
    images: ['/social.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-white flex flex-col">
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}