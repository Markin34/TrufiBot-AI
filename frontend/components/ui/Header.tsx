'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Bus, LogOut, LayoutDashboard, Menu, X, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Header() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const dashboardHref =
    profile?.role === 'admin'
      ? '/dashboard/admin'
      : profile?.role === 'chofer'
      ? '/dashboard/driver'
      : '/dashboard/user'

  return (
    <header
      className={`bg-white border-b border-gray-100 sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'shadow-lg' : 'shadow-sm'
      }`}
    >
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'h-14' : 'h-16'
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-trufi-gradient rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
            <Bus className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight">
            <span className="font-bold text-gray-900 text-lg">WAYRA</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm text-gray-600 hover:text-red-600 transition-colors font-medium relative group">
            Inicio
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-200" />
          </Link>
          <Link href="/chat" className="text-sm text-gray-600 hover:text-red-600 transition-colors font-medium relative group">
            Chat IA
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-200" />
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href={dashboardHref}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 transition-colors font-medium"
              >
                <LayoutDashboard className="w-4 h-4" />
                Panel
              </Link>
              <div className="w-px h-5 bg-gray-200" />

              {/* Plan chip — solo pasajeros */}
              {profile?.role === 'pasajero' && (
                profile?.plan === 'premium' ? (
                  <span className="flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    <Zap className="w-3 h-3" /> Premium
                  </span>
                ) : (
                  <Link
                    href="/upgrade"
                    className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full transition-colors border border-red-200"
                  >
                    <Zap className="w-3 h-3" /> Actualizar
                  </Link>
                )
              )}

              <span className="text-sm text-gray-500 max-w-[120px] truncate">
                {profile?.full_name || user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-sm text-gray-600 hover:text-red-600 transition-colors font-medium"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/auth/register"
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                Registrarse
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen
            ? <X className="w-5 h-5 transition-transform duration-200 rotate-0" />
            : <Menu className="w-5 h-5 transition-transform duration-200" />
          }
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-4 animate-slide-down">
          <Link href="/" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">Inicio</Link>
          <Link href="/chat" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">Chat IA</Link>
          {user ? (
            <>
              <Link href={dashboardHref} onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">Mi Panel</Link>
              {profile?.role === 'pasajero' && (
                profile?.plan === 'premium' ? (
                  <span className="self-start flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    <Zap className="w-3 h-3" /> Premium activo
                  </span>
                ) : (
                  <Link
                    href="/upgrade"
                    onClick={() => setMenuOpen(false)}
                    className="self-start flex items-center gap-1 bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-3 py-1.5 rounded-full"
                  >
                    <Zap className="w-3 h-3" /> Actualizar a Premium
                  </Link>
                )
              )}
              <button onClick={handleSignOut} className="text-left text-sm font-medium text-red-500 hover:text-red-700 transition-colors">Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">Iniciar sesión</Link>
              <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg text-center hover:bg-red-700 transition-colors">Registrarse</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
