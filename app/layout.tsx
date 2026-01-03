import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LaunchReady — Protect Your Ideas Before Someone Else Does',
  description: 'Voice-guided IP protection for founders, inventors, and creators. Automate trademark filing, capture evidence, and launch your brand with confidence.',
  keywords: ['intellectual property', 'trademark', 'patent', 'startup', 'founder', 'IP protection', 'brand protection'],
  authors: [{ name: 'LaunchReady' }],
  openGraph: {
    title: 'LaunchReady — Protect Your Ideas Before Someone Else Does',
    description: 'Voice-guided IP protection for founders, inventors, and creators.',
    url: 'https://launchready.io',
    siteName: 'LaunchReady',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LaunchReady - IP Protection Platform',
      },
    ],
    locale: 'en_AU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LaunchReady — Protect Your Ideas',
    description: 'Voice-guided IP protection for founders, inventors, and creators.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
