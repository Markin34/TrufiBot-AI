'use client'

import { useRef, useEffect, useState } from 'react'
import { useChat } from '@/hooks/useChat'
import { useAuth } from '@/contexts/AuthContext'
import MessageBubble from './MessageBubble'
import { SkeletonLoader } from '../ui/SkeletonLoader'
import { Send, Trash2, Moon, Bus, Zap } from 'lucide-react'
import type { Route } from '@/services/api'

interface ChatWindowProps {
  initialMessage?: string
  onViewMap?: (route: Route) => void
}

const QUICK_PROMPTS = [
  '¿Cómo llego al centro desde Sacaba?',
  '¿Qué trufi va a Quillacollo?',
  '¿Cuál es la ruta más barata a la UMSS?',
  'Rutas nocturnas seguras desde Cala Cala',
]

export default function ChatWindow({ initialMessage, onViewMap }: ChatWindowProps) {
  const { messages, loading, streaming, error, limitReached, sendMessage, clearChat } = useChat()
  const { user } = useAuth()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const initiated = useRef(false)

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Send initial message once
  useEffect(() => {
    if (initialMessage && !initiated.current) {
      initiated.current = true
      sendMessage(initialMessage, user?.id)
    }
  }, [initialMessage, user?.id, sendMessage])

  const handleSend = () => {
    if (!input.trim() || loading) return
    sendMessage(input.trim(), user?.id)
    setInput('')
    inputRef.current?.focus()
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleNightMode = () => {
    sendMessage(
      '¿Cuáles son las rutas más seguras para viajar de noche en Cochabamba?',
      user?.id,
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-trufi-gradient rounded-full flex items-center justify-center shadow-sm">
            <Bus className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">WAYRA</p>
            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block" />
              En línea · Cochabamba
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNightMode}
            title="Modo Seguro Nocturno"
            className="flex items-center gap-1.5 text-xs text-amber-600 border border-amber-200 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg font-semibold transition-colors"
          >
            <Moon className="w-3.5 h-3.5" />
            Modo Seguro
          </button>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              title="Limpiar chat"
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full gap-6 px-6 py-10">
            <div className="w-16 h-16 bg-trufi-gradient rounded-2xl flex items-center justify-center shadow-lg">
              <Bus className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <h2 className="font-bold text-gray-800 text-lg mb-1">¡Hola! Soy WAYRA</h2>
              <p className="text-gray-500 text-sm">Cuéntame a dónde quieres ir y te ayudo a encontrar tu trufi 🚐</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt, user?.id)}
                  className="text-left text-xs text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors font-medium"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onViewMap={onViewMap} />
        ))}

        {loading && !streaming && <SkeletonLoader />}

        {error && (
          <div className="mx-4 my-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            ⚠️ {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Upgrade banner */}
      {limitReached && (
        <div className="mx-4 mb-2 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-800 text-sm font-medium">
            <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
            Alcanzaste tu límite diario gratuito (10 mensajes).
          </div>
          <a
            href="/upgrade"
            className="text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors"
          >
            Ver Premium
          </a>
        </div>
      )}

      {/* Input area */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={limitReached ? 'Actualiza a Premium para seguir chateando' : '¿A dónde quieres ir? (ej: de Sacaba al centro)'}
            rows={1}
            className="flex-1 resize-none border border-gray-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50 placeholder:text-gray-400 max-h-28 overflow-y-auto"
            style={{ lineHeight: '1.5' }}
            disabled={loading || limitReached}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || limitReached}
            className="w-11 h-11 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-2xl flex items-center justify-center transition-colors flex-shrink-0 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
