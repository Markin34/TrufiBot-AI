'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Bus } from 'lucide-react'

export default function SearchForm() {
  const router = useRouter()
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (origin) params.set('origin', origin)
    if (destination) params.set('destination', destination)
    router.push(`/chat?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-xl p-4 space-y-3">
      <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all">
        <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
        <input
          type="text"
          placeholder="¿Desde dónde sales?"
          value={origin}
          onChange={e => setOrigin(e.target.value)}
          className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
        />
      </div>
      <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all">
        <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
        <input
          type="text"
          placeholder="¿A dónde vas?"
          value={destination}
          onChange={e => setDestination(e.target.value)}
          className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md text-sm"
        >
          <Search className="w-4 h-4" />
          Buscar ruta
        </button>
        <button
          type="button"
          onClick={() => router.push('/chat')}
          className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-4 rounded-xl transition-colors text-sm"
        >
          <Bus className="w-4 h-4" />
          Chat IA
        </button>
      </div>
    </form>
  )
}
