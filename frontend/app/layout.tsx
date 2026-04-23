import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HomeVal — Egyptian Real Estate Valuations',
  description: 'ML-powered property valuations for the Egyptian real estate market.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
