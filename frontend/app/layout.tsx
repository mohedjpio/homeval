import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'HomeVal — Egypt Property Intelligence',
    template: '%s | HomeVal',
  },
  description: 'AI-powered property valuation platform covering 25+ Egyptian cities. Instant ML price predictions, market analytics on 30,000+ listings, and an AI assistant.',
  keywords: ['Egypt real estate', 'property valuation', 'Cairo apartments', 'Egyptian property prices', 'ML valuation', 'شقق مصر'],
  authors: [{ name: 'HomeVal Team' }],
  creator: 'HomeVal',
  publisher: 'HomeVal',
  metadataBase: new URL('https://homeval-production-0518.up.railway.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://homeval-production-0518.up.railway.app',
    siteName: 'HomeVal',
    title: 'HomeVal — Egypt Property Intelligence',
    description: 'AI-powered property valuation for Egypt. Instant ML predictions, 30K+ listings, 25 cities.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'HomeVal — Egypt Property Intelligence' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HomeVal — Egypt Property Intelligence',
    description: 'AI-powered property valuation for Egypt.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico',        sizes: 'any' },
      { url: '/favicon-16x16.png',  sizes: '16x16',  type: 'image/png' },
      { url: '/favicon-32x32.png',  sizes: '32x32',  type: 'image/png' },
      { url: '/logo.svg',           type: 'image/svg+xml' },
    ],
    apple:    [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: [{ url: '/favicon.ico' }],
  },
  manifest: '/site.webmanifest',
  themeColor: '#1d9e75',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Extra browser-tab theme colour for Safari/Chrome on mobile */}
        <meta name="theme-color" content="#1d9e75" />
        <meta name="msapplication-TileColor" content="#04342c" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
