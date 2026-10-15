'use client'

import { Suspense, useState } from 'react'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/ui/Header'
import ChatWindow from '@/components/chat/ChatWindow'
import type { Route } from '@/services/api'
import { Map, MessageSquare } from 'lucide-react'

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="text-gray-400 text-sm">Cargando mapa...</div>
    </div>
  ),
})

function ChatPageContent() {
  const searchParams = useSearchParams()
  const origin = searchParams.get('origin') || undefined
  const destination = searchParams.get('destination') || undefined
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [mapVisible, setMapVisible] = useState(false)

  const initialMessage =
    origin && destination
      ? `Quiero ir desde ${origin} hasta ${destination}`
      : undefined

  const handleViewMap = (route: Route) => {
    setSelectedRoute(route)
    setMapVisible(true)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex flex-1 overflow-hidden">
        {/* Chat panel */}
        <div className={`flex flex-col ${mapVisible ? 'hidden lg:flex lg:w-1/2' : 'w-full'} transition-all`}>
          <ChatWindow initialMessage={initialMessage} onViewMap={handleViewMap} />
        </div>

        {/* Map panel */}
        {mapVisible && (
          <div className="flex-1 relative">
            {/* Close map btn (mobile) */}
            <button
              onClick={() => setMapVisible(false)}
              className="lg:hidden absolute top-3 left-3 z-10 bg-white shadow-md rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Volver al chat
            </button>
            <LeafletMap selectedRoute={selectedRoute} className="h-full" />
          </div>
        )}
      </div>

      {/* Mobile map toggle */}
      {!mapVisible && selectedRoute && (
        <div className="lg:hidden bg-white border-t border-gray-200 px-4 py-2">
          <button
            onClick={() => setMapVisible(true)}
            className="w-full flex items-center justify-center gap-2 text-red-700 text-sm font-semibold py-2 border border-red-200 bg-red-50 rounded-xl"
          >
            <Map className="w-4 h-4" />
            Ver ruta {selectedRoute.name}
          </button>
        </div>
      )}
    </div>
  )
}

export default function ChatPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="h-screen bg-gray-50" />}>
        <ChatPageContent />
      </Suspense>
    </>
  )
}
