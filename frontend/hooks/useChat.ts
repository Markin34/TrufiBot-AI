'use client'

import { useState, useCallback, useRef } from 'react'
import { chatApi, RouteData } from '@/services/api'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  route_data?: RouteData
  is_night_mode?: boolean
  isStreaming?: boolean
  timestamp: Date
}

function cleanDisplayText(raw: string): string {
  return raw.replace(/```(?:json)?\s*[\s\S]*?```/g, '').trim()
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const historyRef = useRef<{ role: string; content: string }[]>([])

  const sendMessage = useCallback(async (
    content: string,
    userId?: string,
    origin?: string,
    destination?: string,
  ) => {
    if (!content.trim() && !origin) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content || `Ir desde ${origin} hasta ${destination}`,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    setError(null)

    historyRef.current = [
      ...historyRef.current.slice(-8),
      { role: 'user', content: userMsg.content },
    ]

    const botId = crypto.randomUUID()
    setStreaming(true)
    setMessages(prev => [...prev, {
      id: botId,
      role: 'assistant',
      content: '',
      isStreaming: true,
      timestamp: new Date(),
    }])

    let rawAccum = ''

    try {
      for await (const event of chatApi.stream({
        message: content,
        user_id: userId,
        conversation_history: historyRef.current.slice(0, -1),
        origin,
        destination,
      })) {
        if (event.error) throw new Error(event.error)

        if (event.chunk != null) {
          rawAccum += event.chunk
          const displayText = cleanDisplayText(rawAccum)
          setMessages(prev => prev.map(m =>
            m.id === botId ? { ...m, content: displayText } : m
          ))
        }

        if (event.done) {
          const finalText = cleanDisplayText(rawAccum)
          historyRef.current = [
            ...historyRef.current,
            { role: 'assistant', content: finalText },
          ]
          setMessages(prev => prev.map(m =>
            m.id === botId
              ? {
                  ...m,
                  content: finalText,
                  route_data: event.route_data,
                  is_night_mode: event.is_night_mode ?? false,
                  isStreaming: false,
                }
              : m
          ))
        }
      }
    } catch (err: any) {
      setMessages(prev => prev.filter(m => m.id !== botId))
      const msg: string = err.message || ''
      if (msg.includes('límite') || msg.includes('limit_reached') || msg.includes('Premium')) {
        setLimitReached(true)
        setError(msg)
      } else {
        setError(
          msg.includes('Failed to fetch')
            ? 'No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo en localhost:8000.'
            : (msg || 'Error al conectar con WAYRA')
        )
      }
    } finally {
      setStreaming(false)
      setLoading(false)
    }
  }, [])

  const clearChat = useCallback(() => {
    setMessages([])
    historyRef.current = []
    setError(null)
    setLimitReached(false)
  }, [])

  return { messages, loading, streaming, error, limitReached, sendMessage, clearChat }
}
