'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { usersApi } from '@/services/api'
import { reportsApi, Report } from '@/services/api'
import { CardSkeleton } from '@/components/ui/SkeletonLoader'
import { Heart, Clock, AlertCircle, Star, MapPin, Bus, Zap, Check } from 'lucide-react'
import Link from 'next/link'

interface FavoriteItem {
  id: string
  alias?: string
  routes?: { name: string; origin: string; destination: string; price: number }
}

interface TripItem {
  id: string
  origin: string
  destination: string
  routes?: { numero: string }
  created_at: string
  rating?: number
}

export default function UserDashboard() {
  const { profile, user } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [trips, setTrips] = useState<TripItem[]>([])
  const [myReports, setMyReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      usersApi.getFavorites(user.id),
      usersApi.getTrips(user.id),
      reportsApi.list(),
    ]).then(([fav, tr, rep]) => {
      setFavorites(fav.favorites)
      setTrips(tr.trips)
      setMyReports(rep.reports.filter(r => r.user_id === user.id).slice(0, 5))
    }).finally(() => setLoading(false))
  }, [user])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-trufi-gradient rounded-2xl p-6 text-white">
          <p className="text-red-200 text-sm font-medium mb-1">{greeting} 👋</p>
          <h1 className="text-2xl font-extrabold mb-2">
            {profile?.full_name || 'Pasajero'}
          </h1>
          <p className="text-red-100 text-sm mb-4">
            ¿A dónde vas hoy? WAYRA te ayuda a llegar.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 bg-white text-red-700 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-red-50 transition-colors shadow-sm"
          >
            <Bus className="w-4 h-4" />
            Buscar ruta con IA
          </Link>
        </div>

        {/* Plan banner */}
        {profile?.plan === 'premium' ? (
          <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-extrabold text-sm">Plan Premium activo</p>
              <p className="text-red-100 text-xs mt-0.5">IA ilimitada · 10 favoritas · Sin publicidad</p>
            </div>
            <span className="flex items-center gap-1 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0">
              <Check className="w-3.5 h-3.5" /> Activo
            </span>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-dashed border-red-200 p-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-gray-900 text-sm mb-0.5">Actualizá a Premium</p>
                <ul className="space-y-1 mb-4">
                  {['IA ilimitada (ahora: 10/día)', '10 rutas favoritas', 'Historial 30 días', 'Sin publicidad'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-500">
                      <Check className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/upgrade"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  <Zap className="w-4 h-4" />
                  Ver planes — Bs 30/mes
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Favorites */}
        <section id="favorites">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" /> Rutas favoritas
            </h2>
            <Link href="/chat" className="text-xs text-red-600 font-semibold">+ Agregar</Link>
          </div>
          {loading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <CardSkeleton /><CardSkeleton />
            </div>
          ) : favorites.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
              <Heart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Aún no tienes rutas favoritas</p>
              <Link href="/chat" className="text-red-600 text-sm font-semibold mt-2 inline-block">
                Buscar rutas →
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {favorites.map((f) => (
                <div key={f.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bus className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {f.alias || f.routes?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {f.routes?.origin} → {f.routes?.destination}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-red-600">Bs {f.routes?.price}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Trip history */}
        <section>
          <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-blue-500" /> Historial de viajes
          </h2>
          {loading ? (
            <CardSkeleton />
          ) : trips.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-6 text-center">
              <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Sin viajes registrados aún</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {trips.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium truncate">
                      {t.origin} → {t.destination}
                    </p>
                    <p className="text-xs text-gray-500">
                      Trufi {t.routes?.numero} · {new Date(t.created_at).toLocaleDateString('es-BO')}
                    </p>
                  </div>
                  {t.rating && (
                    <div className="flex items-center gap-0.5">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* My reports */}
        <section id="reports">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-orange-500" /> Mis reportes
          </h2>
          {myReports.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-6 text-center">
              <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No has reportado incidentes</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {myReports.map((r) => (
                <div key={r.id} className="flex items-start gap-3 px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium capitalize">{r.type}</p>
                    <p className="text-xs text-gray-500 truncate">{r.description}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    r.status === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                    r.status === 'revisado' ? 'bg-red-100 text-red-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
