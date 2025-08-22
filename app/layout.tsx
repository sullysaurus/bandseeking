import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SpeedInsights } from "@vercel/speed-insights/next"
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | BandSeeking',
    default: 'BandSeeking - Connect with Musicians',
  },
  description: 'Find and connect with musicians in your area for bands, collaborations, and music projects',
  metadataBase: new URL('https://www.bandseeking.com'),
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  themeColor: '#000000',
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
    google: 'verification-token',
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
        <div className="min-h-screen bg-white">
          {children}
        </div>
        <SpeedInsights />
      </body>
    </html>
  )
}