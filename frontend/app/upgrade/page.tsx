'use client'

import Link from 'next/link'
import Header from '@/components/ui/Header'
import { Check, Zap, Bus } from 'lucide-react'

const FREE_FEATURES = [
  '10 mensajes de IA por día',
  'Búsqueda de rutas en el mapa',
  'Ver trufis en tiempo real',
  '1 ruta favorita guardada',
  'Reportar incidentes básicos',
]

const PREMIUM_FEATURES = [
  'Mensajes de IA ilimitados',
  'Búsqueda de rutas en el mapa',
  'Ver trufis en tiempo real',
  '10 rutas favoritas guardadas',
  'Reportar incidentes con foto y ubicación',
  'Historial de chats (30 días)',
  'Alertas en tus rutas favoritas',
  'Sin publicidad',
  'Badge de usuario verificado',
]

export default function UpgradePage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              <Zap className="w-4 h-4" />
              Planes WAYRA
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
              Elige tu plan
            </h1>
            <p className="text-gray-500 text-lg">
              Muévete por Cochabamba sin límites
            </p>
          </div>

          {/* Plans grid */}
          <div className="grid md:grid-cols-2 gap-6 items-start">

            {/* Free */}
            <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Bus className="w-5 h-5 text-gray-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Gratuito</h2>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-gray-900">Bs 0</span>
                <span className="text-gray-400 text-sm">/mes</span>
              </div>
              <ul className="space-y-3 mb-8">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="w-full text-center py-3 rounded-xl border-2 border-gray-200 text-gray-400 font-semibold text-sm">
                Plan actual
              </div>
            </div>

            {/* Premium */}
            <div className="bg-white rounded-3xl border-2 border-red-500 p-8 shadow-xl relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                MÁS POPULAR
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Premium</h2>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-gray-900">Bs 30</span>
                <span className="text-gray-400 text-sm">/mes</span>
              </div>
              <ul className="space-y-3 mb-8">
                {PREMIUM_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/upgrade/checkout"
                className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md text-sm"
              >
                Suscribirse a Premium
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            Podés cancelar en cualquier momento · Sin compromisos
          </p>
        </div>
      </div>
    </>
  )
}
