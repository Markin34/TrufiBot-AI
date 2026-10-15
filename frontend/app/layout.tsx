import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WAYRA — Movilidad Urbana en Cochabamba',
  description:
    'El primer asistente inteligente de movilidad urbana para Cochabamba, Bolivia. Encuentra tu trufi al instante con IA.',
  keywords: 'trufi, cochabamba, movilidad, transporte, bolivia, rutas',
  openGraph: {
    title: 'WAYRA',
    description: 'Asistente inteligente de movilidad urbana para Cochabamba',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : null

  return (
    <html lang="es">
      <head>
        {supabaseHostname && (
          <>
            <link rel="preconnect" href={`https://${supabaseHostname}`} />
            <link rel="dns-prefetch" href={`https://${supabaseHostname}`} />
          </>
        )}
        <link rel="preconnect" href="https://basemaps.cartocdn.com" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
