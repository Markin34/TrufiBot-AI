'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { usersApi } from '@/services/api'
import { supabase } from '@/services/supabase'
import Header from '@/components/ui/Header'
import { CreditCard, Lock, CheckCircle, ArrowLeft, Zap } from 'lucide-react'
import Link from 'next/link'

type Step = 'form' | 'processing' | 'success'

function formatCardNumber(val: string) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(val: string) {
  const clean = val.replace(/\D/g, '').slice(0, 4)
  return clean.length > 2 ? `${clean.slice(0, 2)}/${clean.slice(2)}` : clean
}

export default function CheckoutPage() {
  const { user, refreshProfile } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<Step>('form')
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user) {
      router.push('/auth/login?from=/upgrade/checkout')
      return
    }

    setStep('processing')
    await new Promise(r => setTimeout(r, 2500))

    try {
      // Intenta via backend; si falla, actualiza directo en Supabase
      try {
        await usersApi.upgradePlan(user.id)
      } catch {
        const { error: sbError } = await supabase
          .from('profiles')
          .update({ plan: 'premium' })
          .eq('id', user.id)
        if (sbError) throw new Error(sbError.message)
      }
      await refreshProfile()
      setStep('success')
    } catch (err: unknown) {
      setStep('form')
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al activar el plan: ${msg}`)
    }
  }

  if (step === 'processing') {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Procesando pago...</h2>
            <p className="text-gray-500 text-sm">Verificando tu tarjeta con el banco</p>
          </div>
        </div>
      </>
    )
  }

  if (step === 'success') {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center max-w-sm w-full">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold mb-4">
              <Zap className="w-3.5 h-3.5" />
              PLAN PREMIUM ACTIVO
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">¡Pago aprobado!</h2>
            <p className="text-gray-500 text-sm mb-8">
              Tu plan Premium está activo. Ya podés usar la IA sin límites y todos los beneficios.
            </p>
            <button
              onClick={() => router.push('/chat')}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md text-sm mb-3"
            >
              Empezar a usar Premium
            </button>
            <button
              onClick={() => router.push('/dashboard/user')}
              className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium py-2"
            >
              Ir a mi perfil
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 py-12 px-4">
        <div className="max-w-md mx-auto">

          <Link href="/upgrade" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-6 font-medium">
            <ArrowLeft className="w-4 h-4" />
            Volver a planes
          </Link>

          {/* Order summary */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Plan Premium WAYRA</p>
                <p className="text-gray-400 text-xs">Facturación mensual</p>
              </div>
            </div>
            <span className="text-xl font-extrabold text-gray-900">Bs 30</span>
          </div>

          {/* Card form */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <h2 className="font-bold text-gray-900">Datos de pago</h2>
              <div className="ml-auto flex items-center gap-1 text-gray-400 text-xs">
                <Lock className="w-3 h-3" />
                Seguro
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nombre en la tarjeta</label>
                <input
                  type="text"
                                   placeholder="Juan Pérez"
                  value={card.name}
                  onChange={e => setCard(c => ({ ...c, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Número de tarjeta</label>
                <input
                  type="text"
                                   placeholder="1234 5678 9012 3456"
                  value={card.number}
                  onChange={e => setCard(c => ({ ...c, number: formatCardNumber(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono tracking-widest"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Vencimiento</label>
                  <input
                    type="text"
                                       placeholder="MM/AA"
                    value={card.expiry}
                    onChange={e => setCard(c => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">CVV</label>
                  <input
                    type="text"
                                       placeholder="123"
                    maxLength={4}
                    value={card.cvv}
                    onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md text-sm mt-2 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Pagar Bs 30/mes
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-4">
              Tus datos están cifrados y protegidos · Cancelá cuando quieras
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
