import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const poppins = Poppins({
  subsets:  ['latin'],
  weight:   ['300','400','500','600','700','800'],
  variable: '--font-poppins',
  display:  'swap',
})

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mansionpro.id'

export const viewport: Viewport = {
  width:               'device-width',
  initialScale:        1,
  maximumScale:        5,
  userScalable:        true,
  themeColor:          '#0a2342',
  viewportFit:         'cover',
}

export const metadata: Metadata = {
  metadataBase:       new URL(BASE),
  title:              { default: 'Mansion Realty | Properti Impian Anda', template: '%s | Mansion Realty' },
  description:        'Temukan properti impian Anda bersama Mansion Realty Surabaya. Jual, beli, sewa rumah & apartemen terbaik.',
  keywords:           ['properti surabaya', 'rumah dijual surabaya', 'broker properti', 'KPR surabaya', 'mansion realty'],
  authors:            [{ name: 'Mansion Realty' }],
  robots:             { index: true, follow: true },
  manifest:           '/manifest.json',
  appleWebApp: {
    capable:          true,
    statusBarStyle:   'black-translucent',
    title:            'Mansion Realty',
  },
  openGraph: {
    type:        'website',
    locale:      'id_ID',
    url:         BASE,
    title:       'Mansion Realty | Properti Impian Anda',
    description: 'Temukan properti impian Anda bersama Mansion Realty Surabaya.',
    siteName:    'Mansion Realty',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Mansion Realty',
    description: 'Properti Impian Anda, Investasi Terbaik Anda',
  },
  icons: {
    icon:    [
      { url: '/icons/icon-32x32.png',  sizes: '32x32',  type: 'image/png' },
      { url: '/icons/icon-192x192.png',sizes: '192x192',type: 'image/png' },
    ],
    apple:   [{ url: '/icons/icon-152x152.png', sizes: '152x152' }],
    other:   [{ rel: 'mask-icon', url: '/icons/icon-512x512.png' }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={poppins.variable}>
      <head>
        <meta name="mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
        <meta name="format-detection" content="telephone=no"/>
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png"/>
      </head>
      <body className="font-sans bg-white text-gray-900 antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
