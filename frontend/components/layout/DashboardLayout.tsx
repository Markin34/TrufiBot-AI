'use client'

import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/ui/Header'
import Link from 'next/link'
import {
  LayoutDashboard, Bus, LogOut, Heart,
  AlertCircle, Settings, ChevronRight,
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

const passengerNav = [
  { href: '/dashboard/user', icon: LayoutDashboard, label: 'Panel' },
  { href: '/chat', icon: Bus, label: 'Chat IA' },
  { href: '/dashboard/user#favorites', icon: Heart, label: 'Favoritos' },
  { href: '/dashboard/user#reports', icon: AlertCircle, label: 'Mis reportes' },
]

const driverNav = [
  { href: '/dashboard/driver', icon: LayoutDashboard, label: 'Mi panel' },
  { href: '/chat', icon: Bus, label: 'Chat IA' },
]

const adminNav = [
  { href: '/dashboard/admin', icon: LayoutDashboard, label: 'Métricas' },
  { href: '/dashboard/admin#users', icon: Settings, label: 'Usuarios' },
  { href: '/dashboard/admin#routes', icon: Bus, label: 'Rutas' },
  { href: '/dashboard/admin#reports', icon: AlertCircle, label: 'Reportes' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const nav =
    profile?.role === 'admin' ? adminNav :
    profile?.role === 'chofer' ? driverNav :
    passengerNav

  const roleLabel =
    profile?.role === 'admin' ? 'Administrador' :
    profile?.role === 'chofer' ? 'Chofer' :
    'Pasajero'

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex gap-6 pb-24 md:pb-6">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 flex-shrink-0">
          {/* Profile card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
            <div className="w-12 h-12 bg-trufi-gradient rounded-2xl flex items-center justify-center mb-3 shadow-sm">
              <span className="text-white font-bold text-lg">
                {profile?.full_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <p className="font-bold text-gray-900 text-sm truncate">{profile?.full_name || 'Usuario'}</p>
            <p className="text-xs text-gray-500 truncate mb-2">{profile?.email}</p>
            <span className="inline-block text-xs font-semibold bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full">
              {roleLabel}
            </span>
          </div>

          {/* Nav */}
          <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex flex-col gap-1 mb-4">
            {nav.map(({ href, icon: Icon, label }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {active && <ChevronRight className="w-3 h-3 ml-auto text-red-600" />}
                </Link>
              )
            })}
          </nav>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-40 flex">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href.split('#')[0]
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                active ? 'text-red-600' : 'text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
        <button
          onClick={handleSignOut}
          className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-400"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-medium">Salir</span>
        </button>
      </nav>
    </div>
  )
}
