import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = {
  title: 'HomeVal — Egyptian Real Estate Valuations',
  description: 'ML-powered instant property valuations across Egypt.',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body suppressHydrationWarning>{children}</body></html>
}
