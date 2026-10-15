'use client'

import { RouteData } from '@/services/api'
import { Clock, DollarSign, Shield, MapPin, Lightbulb, Bus, AlertTriangle, Map } from 'lucide-react'

interface RouteCardProps {
  data: RouteData
  onViewMap?: () => void
}

const securityConfig = {
  alta:  { label: 'Seguridad Alta',  color: 'badge-alta',  icon: '🟢', dot: 'bg-red-500' },
  media: { label: 'Seguridad Media', color: 'badge-media', icon: '🟡', dot: 'bg-yellow-500' },
  baja:  { label: 'Seguridad Baja',  color: 'badge-baja',  icon: '🔴', dot: 'bg-red-500' },
}

export default function RouteCard({ data, onViewMap }: RouteCardProps) {
  const sec = securityConfig[data.seguridad] ?? securityConfig.media

  return (
    <div className="mt-2 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-trufi-gradient px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bus className="w-5 h-5 text-white" />
          <span className="font-bold text-white text-base">{data.trufi ? `Trufi ${data.trufi}` : 'Ruta disponible'}</span>
        </div>
        {data.modo_seguro && (
          <div className="flex items-center gap-1 bg-amber-400 text-amber-900 text-xs font-semibold px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            Modo Seguro
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-px bg-gray-100">
        <div className="bg-white px-4 py-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-red-600 flex-shrink-0" />
          <div>
            <div className="text-xs text-gray-500">Espera</div>
            <div className="text-sm font-semibold text-gray-800">{data.tiempo_espera}</div>
          </div>
        </div>
        <div className="bg-white px-4 py-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <div>
            <div className="text-xs text-gray-500">Viaje</div>
            <div className="text-sm font-semibold text-gray-800">{data.tiempo_viaje}</div>
          </div>
        </div>
        <div className="bg-white px-4 py-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-red-600 flex-shrink-0" />
          <div>
            <div className="text-xs text-gray-500">Precio</div>
            <div className="text-sm font-semibold text-gray-800">
              {data.precio_adulto ?? data.precio ?? 'Bs 3.00'}
            </div>
            {data.precio_estudiante && (
              <div className="text-xs text-gray-500">Estudiante: {data.precio_estudiante}</div>
            )}
          </div>
        </div>
        <div className="bg-white px-4 py-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <div>
            <div className="text-xs text-gray-500">Seguridad</div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sec.color}`}>
              {sec.icon} {data.seguridad}
            </span>
          </div>
        </div>
      </div>

      {/* Stops */}
      {data.paradas?.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="w-4 h-4 text-red-600" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Paradas</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.paradas.map((p, i) => (
              <span
                key={i}
                className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tip */}
      {data.consejo && (
        <div className="px-4 py-3 bg-amber-50 border-t border-amber-100 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">{data.consejo}</p>
        </div>
      )}

      {/* Action */}
      {onViewMap && (
        <div className="px-4 py-3 border-t border-gray-100">
          <button
            onClick={onViewMap}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
          >
            <Map className="w-4 h-4" />
            Ver ruta
          </button>
        </div>
      )}
    </div>
  )
}
