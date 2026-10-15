'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { usersApi, routesApi, reportsApi, Route } from '@/services/api'
import { Bus, MapPin, Star, AlertTriangle, ToggleRight, Users } from 'lucide-react'

type DriverStatusType = 'disponible' | 'ocupado' | 'fuera_de_servicio'

const STATUS_CONFIG: Record<DriverStatusType, { label: string; color: string; bg: string }> = {
  disponible: { label: 'Disponible', color: 'text-red-700', bg: 'bg-red-100' },
  ocupado: { label: 'Ocupado', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  fuera_de_servicio: { label: 'Fuera de servicio', color: 'text-gray-600', bg: 'bg-gray-100' },
}

export default function DriverDashboard() {
  const { user, profile } = useAuth()
  const [status, setStatus] = useState<DriverStatusType>('fuera_de_servicio')
  const [routes, setRoutes] = useState<Route[]>([])
  const [selectedRouteId, setSelectedRouteId] = useState<string>('')
  const [rating] = useState(4.7)
  const [loading, setLoading] = useState(false)
  const [reportForm, setReportForm] = useState({ type: 'retraso', description: '' })
  const [reportSent, setReportSent] = useState(false)

  useEffect(() => {
    routesApi.list().then(d => setRoutes(d.routes))
  }, [])

  const handleStatusChange = async (newStatus: DriverStatusType) => {
    if (!user) return
    setLoading(true)
    setStatus(newStatus)
    await usersApi.updateDriverStatus(user.id, {
      status: newStatus,
      route_id: selectedRouteId || undefined,
    })
    setLoading(false)
  }

  const handleReport = async () => {
    if (!reportForm.description.trim() || !user) return
    await reportsApi.create(
      { type: reportForm.type, description: reportForm.description, route_id: selectedRouteId || undefined },
      user.id,
    )
    setReportSent(true)
    setReportForm({ type: 'retraso', description: '' })
    setTimeout(() => setReportSent(false), 3000)
  }

  const cfg = STATUS_CONFIG[status]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Panel del Chofer</h1>
          <p className="text-gray-500 text-sm mt-1">Hola, {profile?.full_name}. Gestiona tu estado y ruta.</p>
          {!profile?.approved && (
            <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              Tu cuenta está pendiente de aprobación por el administrador.
            </div>
          )}
        </div>

        {/* Status toggle */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ToggleRight className="w-5 h-5 text-red-600" />
            Estado del servicio
          </h2>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {(Object.keys(STATUS_CONFIG) as DriverStatusType[]).map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={loading || !profile?.approved}
                className={`py-3 px-2 rounded-xl text-xs font-bold border-2 transition-all ${
                  status === s
                    ? `border-red-500 ${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color}`
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${cfg.bg} ${cfg.color}`}>
            <span className={`w-2 h-2 rounded-full ${status === 'disponible' ? 'bg-red-500 animate-pulse' : status === 'ocupado' ? 'bg-yellow-500' : 'bg-gray-400'}`} />
            Estado actual: {cfg.label}
          </div>
        </div>

        {/* Route selection */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Bus className="w-5 h-5 text-red-600" />
            Ruta activa
          </h2>
          <select
            value={selectedRouteId}
            onChange={e => setSelectedRouteId(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">— Seleccionar ruta —</option>
            {routes.map(r => (
              <option key={r.id} value={r.id}>
                Trufi {r.numero} · {r.name}
              </option>
            ))}
          </select>
          {selectedRouteId && (
            <div className="mt-3 flex items-center gap-2 text-xs text-red-600 font-medium">
              <MapPin className="w-3.5 h-3.5" />
              {routes.find(r => r.id === selectedRouteId)?.origin} →{' '}
              {routes.find(r => r.id === selectedRouteId)?.destination}
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-extrabold text-gray-900">{rating}</span>
            </div>
            <p className="text-xs text-gray-500">Calificación promedio</p>
            <div className="flex gap-0.5 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-2xl font-extrabold text-gray-900">—</span>
            </div>
            <p className="text-xs text-gray-500">Pasajeros estimados hoy</p>
          </div>
        </div>

        {/* Report incident */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Reportar incidente en ruta
          </h2>
          {reportSent && (
            <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
              ✅ Reporte enviado exitosamente
            </div>
          )}
          <select
            value={reportForm.type}
            onChange={e => setReportForm(f => ({ ...f, type: e.target.value }))}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 mb-3"
          >
            <option value="retraso">Retraso</option>
            <option value="accidente">Accidente</option>
            <option value="superpoblado">Superpoblado</option>
            <option value="desvio">Desvío de ruta</option>
            <option value="otro">Otro</option>
          </select>
          <textarea
            value={reportForm.description}
            onChange={e => setReportForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Describe el incidente..."
            rows={3}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none mb-3"
          />
          <button
            onClick={handleReport}
            disabled={!reportForm.description.trim()}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
          >
            Enviar reporte
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
