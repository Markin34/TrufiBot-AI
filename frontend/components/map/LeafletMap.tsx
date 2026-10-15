'use client'

import { useEffect, useRef, useState } from 'react'
import type { Route } from '@/services/api'
import type { Map as LeafletMapInstance, LayerGroup, Marker } from 'leaflet'

interface LeafletMapProps {
  center?: [number, number]
  zoom?: number
  selectedRoute?: Route | null
  className?: string
  showLiveTrufis?: boolean
}

const COCHABAMBA_CENTER: [number, number] = [-17.3895, -66.1568]

// Demo trufis that animate on the home page map
const LIVE_TRUFIS = [
  {
    id: '101', label: '101', color: '#dc2626',
    waypoints: [
      [-17.3623, -66.1589], [-17.3700, -66.1580], [-17.3760, -66.1575],
      [-17.3830, -66.1570], [-17.3895, -66.1568], [-17.3950, -66.1555],
      [-17.4010, -66.1535], [-17.4080, -66.1490], [-17.4156, -66.1423],
    ] as [number, number][],
  },
  {
    id: '212', label: '212', color: '#2563eb',
    waypoints: [
      [-17.3756, -66.0892], [-17.3800, -66.1000], [-17.3840, -66.1100],
      [-17.3870, -66.1200], [-17.3890, -66.1350], [-17.3895, -66.1568],
    ] as [number, number][],
  },
  {
    id: '200', label: '200', color: '#16a34a',
    waypoints: [
      [-17.3895, -66.1568], [-17.3890, -66.1700], [-17.3880, -66.1900],
      [-17.3870, -66.2100], [-17.3860, -66.2300], [-17.3850, -66.2600],
      [-17.3934, -66.2189],
    ] as [number, number][],
  },
  {
    id: '110', label: '110', color: '#9333ea',
    waypoints: [
      [-17.3560, -66.1620], [-17.3620, -66.1610], [-17.3680, -66.1600],
      [-17.3712, -66.1589], [-17.3780, -66.1580], [-17.3850, -66.1570],
      [-17.3895, -66.1568],
    ] as [number, number][],
  },
  {
    id: '134', label: '134', color: '#ea580c',
    waypoints: [
      [-17.3698, -66.1423], [-17.3750, -66.1480], [-17.3800, -66.1510],
      [-17.3850, -66.1540], [-17.3895, -66.1568],
    ] as [number, number][],
  },
]

let cssInjected = false
function injectCSS() {
  if (cssInjected || typeof document === 'undefined') return
  const style = document.createElement('style')
  style.textContent = `
    @keyframes wayra-pulse {
      0%   { transform: scale(1);   opacity: 0.8; }
      100% { transform: scale(2.4); opacity: 0; }
    }
    .wayra-pulse { animation: wayra-pulse 2s ease-out infinite; }
    @keyframes trufi-bounce {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-3px); }
    }
    .trufi-bounce { animation: trufi-bounce 1.2s ease-in-out infinite; }
  `
  document.head.appendChild(style)
  cssInjected = true
}

export default function LeafletMap({
  center = COCHABAMBA_CENTER,
  zoom = 13,
  selectedRoute = null,
  className = '',
  showLiveTrufis = false,
}: LeafletMapProps) {
  const mapRef            = useRef<LeafletMapInstance | null>(null)
  const containerRef      = useRef<HTMLDivElement>(null)
  const routeLayerRef     = useRef<LayerGroup | null>(null)
  const trufiLayerRef     = useRef<LayerGroup | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const trufiTimersRef    = useRef<ReturnType<typeof setInterval>[]>([])
  const trufiRafsRef      = useRef<number[]>([])
  const [mapReady, setMapReady] = useState(false)
  const [routeLoading, setRouteLoading] = useState(false)

  // ── Inicializar mapa ────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || mapRef.current) return
    let cancelled = false

    import('leaflet').then((L) => {
      if (cancelled || !containerRef.current) return
      injectCSS()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        iconUrl:       '/leaflet/marker-icon.png',
        shadowUrl:     '/leaflet/marker-shadow.png',
      })

      const map = L.map(containerRef.current, {
        center, zoom,
        zoomControl: true,
        attributionControl: true,
      })

      // CartoDB Voyager — colorido, moderno, gratuito, sin API key
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      mapRef.current = map

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!cancelled && mapRef.current) mapRef.current.invalidateSize()
        })
      })

      const ro = new ResizeObserver(() => { if (mapRef.current) mapRef.current.invalidateSize() })
      if (containerRef.current) ro.observe(containerRef.current)
      resizeObserverRef.current = ro

      setMapReady(true)
    })

    return () => {
      cancelled = true
      resizeObserverRef.current?.disconnect()
      resizeObserverRef.current = null
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Actualizar centro ───────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.setView(center, zoom, { animate: true })
  }, [center, zoom])

  // ── Trufis animados en el mapa del home ────────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current || !showLiveTrufis) return

    import('leaflet').then((L) => {
      if (!mapRef.current) return

      // Limpiar timers anteriores
      trufiTimersRef.current.forEach(clearInterval)
      trufiTimersRef.current = []
      if (trufiLayerRef.current) { trufiLayerRef.current.remove(); trufiLayerRef.current = null }

      const layerGroup = L.layerGroup().addTo(mapRef.current)
      trufiLayerRef.current = layerGroup

      // Inicializar array de rAFs por trufi
      trufiRafsRef.current = new Array(LIVE_TRUFIS.length).fill(0)

      // Interpolación suave entre dos waypoints
      const smoothMove = (
        idx: number,
        marker: Marker,
        toLat: number,
        toLng: number,
        durationMs: number,
      ) => {
        cancelAnimationFrame(trufiRafsRef.current[idx])
        const from = marker.getLatLng()
        const frames = Math.round(durationMs / 16.67)
        let f = 0
        const step = () => {
          f++
          const t = Math.min(f / frames, 1)
          // ease-in-out cuadrático
          const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
          marker.setLatLng([
            from.lat + (toLat - from.lat) * ease,
            from.lng + (toLng - from.lng) * ease,
          ])
          if (f < frames) {
            trufiRafsRef.current[idx] = requestAnimationFrame(step)
          }
        }
        trufiRafsRef.current[idx] = requestAnimationFrame(step)
      }

      LIVE_TRUFIS.forEach((trufi, idx) => {
        // Posición de inicio escalonada para que no arranquen todos juntos
        let posIndex = (idx * 2) % trufi.waypoints.length
        let direction = 1

        const makeBusIcon = (color: string, label: string) => L.divIcon({
          html: `
            <div class="trufi-bounce" style="position:relative;display:flex;flex-direction:column;align-items:center;">
              <div style="
                background:${color};
                color:#fff;
                font-size:9px;
                font-weight:800;
                padding:2px 5px;
                border-radius:6px;
                border:2px solid #fff;
                box-shadow:0 2px 8px rgba(0,0,0,.35);
                white-space:nowrap;
                line-height:1.4;
              ">🚐 ${label}</div>
              <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${color};margin-top:-1px;"></div>
            </div>`,
          className: '',
          iconSize: [54, 36],
          iconAnchor: [27, 36],
        })

        const pt = trufi.waypoints[posIndex]
        const marker = L.marker(pt, { icon: makeBusIcon(trufi.color, trufi.label) })
          .addTo(layerGroup)
          .bindTooltip(`Trufi ${trufi.label}`, { permanent: false, direction: 'top', className: 'wayra-tooltip' })

        // Intervalo entre waypoints: cada trufi tiene velocidad diferente
        const speed = 2000 + idx * 400

        const timer = setInterval(() => {
          posIndex += direction
          if (posIndex >= trufi.waypoints.length - 1) {
            posIndex = trufi.waypoints.length - 1
            direction = -1
          } else if (posIndex <= 0) {
            posIndex = 0
            direction = 1
          }
          const next = trufi.waypoints[posIndex]
          if (next) {
            // Animar suavemente durante el 80% del intervalo
            smoothMove(idx, marker, next[0], next[1], speed * 0.8)
          }
        }, speed)

        trufiTimersRef.current.push(timer)
      })
    })

    return () => {
      trufiTimersRef.current.forEach(clearInterval)
      trufiTimersRef.current = []
      trufiRafsRef.current.forEach(cancelAnimationFrame)
      trufiRafsRef.current = []
      if (trufiLayerRef.current) { trufiLayerRef.current.remove(); trufiLayerRef.current = null }
    }
  }, [mapReady, showLiveTrufis])

  // ── Dibujar ruta ────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current) return

    if (routeLayerRef.current) { routeLayerRef.current.remove(); routeLayerRef.current = null }
    if (!selectedRoute || !selectedRoute.coordinates?.length) return

    const waypoints = selectedRoute.coordinates
    const coordStr  = waypoints.map((c) => `${c.lng},${c.lat}`).join(';')
    const osrmUrl   = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`

    setRouteLoading(true)
    import('leaflet').then(async (L) => {
      let latlngs: [number, number][]

      try {
        const res  = await fetch(osrmUrl)
        const json = await res.json()
        const raw: [number, number][] = json.routes?.[0]?.geometry?.coordinates ?? []
        latlngs = raw.map(([lng, lat]) => [lat, lng])
      } catch {
        latlngs = waypoints.map((c) => [c.lat, c.lng] as [number, number])
      } finally {
        setRouteLoading(false)
      }

      if (!mapRef.current || latlngs.length === 0) return

      // Glow (sombra roja suave)
      const glow = L.polyline(latlngs, {
        color: '#dc2626', weight: 16, opacity: 0.13,
        lineCap: 'round', lineJoin: 'round',
      })

      // Línea blanca de borde
      const border = L.polyline(latlngs, {
        color: '#ffffff', weight: 8, opacity: 0.9,
        lineCap: 'round', lineJoin: 'round',
      })

      // Línea principal
      const line = L.polyline(latlngs, {
        color: '#dc2626', weight: 5, opacity: 1,
        lineCap: 'round', lineJoin: 'round',
      })

      const firstPt = waypoints[0]
      const lastPt  = waypoints[waypoints.length - 1]

      // Origen — punto verde pulsante
      const startIcon = L.divIcon({
        html: `
          <div style="position:relative;width:48px;height:48px;display:flex;align-items:center;justify-content:center;">
            <div class="wayra-pulse" style="position:absolute;width:28px;height:28px;background:rgba(34,197,94,0.45);border-radius:50%;"></div>
            <div style="position:relative;z-index:1;width:18px;height:18px;background:#22c55e;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 10px rgba(0,0,0,.3);"></div>
          </div>`,
        className: '',
        iconSize:   [48, 48],
        iconAnchor: [24, 24],
      })

      // Destino — pin rojo estilo gota
      const endIcon = L.divIcon({
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 4px 10px rgba(220,38,38,.55));">
            <div style="width:28px;height:28px;background:#dc2626;border:3.5px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);"></div>
            <div style="width:5px;height:5px;background:#dc2626;border-radius:50%;margin-top:2px;opacity:.7;"></div>
          </div>`,
        className: '',
        iconSize:   [28, 40],
        iconAnchor: [14, 40],
      })

      const startMarker = L.marker([firstPt.lat, firstPt.lng], { icon: startIcon })
        .bindPopup(`<div style="font-size:13px;font-weight:600;color:#15803d">● Origen</div><div style="font-size:12px;color:#555;margin-top:2px">${selectedRoute.origin}</div>`)

      const endMarker = L.marker([lastPt.lat, lastPt.lng], { icon: endIcon })
        .bindPopup(`<div style="font-size:13px;font-weight:600;color:#dc2626">● Destino</div><div style="font-size:12px;color:#555;margin-top:2px">${selectedRoute.destination}</div>`)

      routeLayerRef.current = L.layerGroup([glow, border, line, startMarker, endMarker])
        .addTo(mapRef.current)

      mapRef.current.fitBounds(line.getBounds(), { padding: [55, 55] })
    })
  }, [selectedRoute, mapReady])

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden" />

      {/* Overlay de carga mientras OSRM calcula la ruta */}
      {routeLoading && (
        <div className="absolute inset-0 z-[999] flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl pointer-events-none">
          <div className="bg-white rounded-2xl shadow-lg px-5 py-3 flex items-center gap-3 border border-gray-100">
            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold text-gray-700">Calculando ruta...</span>
          </div>
        </div>
      )}

      {/* Tarjeta flotante de ruta — estilo InDrive */}
      {selectedRoute && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none w-max max-w-[calc(100%-2rem)]">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 border border-gray-100">
            {/* Badge número */}
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white font-bold text-sm">{selectedRoute.numero}</span>
            </div>

            {/* Origen → Destino */}
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-red-500 uppercase tracking-widest leading-none mb-1">
                Trufi {selectedRoute.numero}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                <span className="text-xs font-medium text-gray-700 truncate">{selectedRoute.origin}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0"></span>
                <span className="text-xs font-medium text-gray-700 truncate">{selectedRoute.destination}</span>
              </div>
            </div>

            {/* Paradas */}
            {selectedRoute.stops?.length > 0 && (
              <div className="flex-shrink-0 text-center border-l border-gray-200 pl-3">
                <p className="text-lg font-bold text-gray-800 leading-none">{selectedRoute.stops.length}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">paradas</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
