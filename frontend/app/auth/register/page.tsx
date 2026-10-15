'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/services/supabase'
import { Bus, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

const BASE_ROLES = [
  { value: 'pasajero', label: '🧑 Pasajero', desc: 'Busco rutas y uso el chat IA' },
  { value: 'chofer', label: '🚐 Chofer', desc: 'Conduzco trufi y comparto ubicación' },
]

const ADMIN_ROLE = { value: 'admin', label: '🛡️ Administrador', desc: 'Gestiono la plataforma WAYRA' }

function RegisterPageContent() {
  const { signUp } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isSetup = searchParams.get('setup') === '1'
  const ROLES = isSetup ? [...BASE_ROLES, ADMIN_ROLE] : BASE_ROLES
  const [form, setForm] = useState({ email: '', password: '', fullName: '', role: 'pasajero' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setLoading(true)
    const { error } = await signUp(form.email, form.password, form.fullName, form.role)
    setLoading(false)
    if (error) {
      if (error.message?.includes('rate limit') || error.message?.includes('email rate')) {
        setError('Límite de emails alcanzado. Ve a Supabase Dashboard → Authentication → Settings y desactiva "Confirm email".')
      } else if (error.message?.includes('confirm')) {
        setError('Debes confirmar tu email. Ve a Supabase Dashboard → Authentication → Settings y desactiva "Confirm email".')
      } else if (error.message?.includes('already registered') || error.message?.includes('already been registered')) {
        setError('Este email ya está registrado. Intenta iniciar sesión.')
      } else {
        setError(error.message || 'Error al registrarse. Intenta de nuevo.')
      }
      return
    }
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
      const role = profile?.role ?? form.role
      router.push(role === 'chofer' ? '/dashboard/driver' : role === 'admin' ? '/dashboard/admin' : '/dashboard/user')
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/auth/login'), 3000)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">¡Cuenta creada!</h2>
          <p className="text-gray-500 text-sm">Tu cuenta fue creada. Revisa tu email para confirmar tu cuenta y luego inicia sesión.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-trufi-gradient rounded-2xl flex items-center justify-center shadow-lg">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-xl">WAYRA</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-1">Crea tu cuenta</h1>
          <p className="text-gray-500 text-sm">Únete a la comunidad WAYRA</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre completo</label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={set('fullName')}
                placeholder="Juan Pérez"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={set('email')}
                placeholder="tu@email.com"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Soy un...</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: r.value }))}
                    className={`text-left px-4 py-3 rounded-xl border-2 transition-all ${
                      form.role === r.value
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-sm text-gray-800">{r.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors shadow-md text-sm"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-red-600 font-semibold hover:text-red-700">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <RegisterPageContent />
    </Suspense>
  )
}
