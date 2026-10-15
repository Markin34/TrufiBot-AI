'use client'

import { useState, useCallback } from 'react'
import { Route } from '@/services/api'

export const COCHABAMBA_CENTER: [number, number] = [-17.3895, -66.1568]
export const DEFAULT_ZOOM = 13

export function useMap() {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [center, setCenter] = useState<[number, number]>(COCHABAMBA_CENTER)
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [showRouteLayer, setShowRouteLayer] = useState(false)

  const focusRoute = useCallback((route: Route) => {
    setSelectedRoute(route)
    setShowRouteLayer(true)
    if (route.coordinates?.length > 0) {
      const midIdx = Math.floor(route.coordinates.length / 2)
      const mid = route.coordinates[midIdx]
      setCenter([mid.lat, mid.lng])
      setZoom(14)
    }
  }, [])

  const resetMap = useCallback(() => {
    setSelectedRoute(null)
    setShowRouteLayer(false)
    setCenter(COCHABAMBA_CENTER)
    setZoom(DEFAULT_ZOOM)
  }, [])

  return {
    selectedRoute,
    center,
    zoom,
    showRouteLayer,
    focusRoute,
    resetMap,
    setCenter,
    setZoom,
  }
}
