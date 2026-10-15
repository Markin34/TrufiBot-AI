'use client'

import { Message } from '@/hooks/useChat'
import RouteCard from './RouteCard'
import { Bus } from 'lucide-react'
import { Route, RouteData } from '@/services/api'
import { routesApi } from '@/services/api'
import { findStaticRoute } from '@/data/routeData'

interface MessageBubbleProps {
  message: Message
  onViewMap?: (route: Route) => void
}

interface ParsedContent {
  segments: Array<{ type: 'text'; value: string } | { type: 'route'; data: RouteData }>
}

function parseContent(content: string): ParsedContent {
  const segments: ParsedContent['segments'] = []
  const codeBlockRegex = /```(?:json)?\s*\n?([\s\S]*?)\n?```/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const before = content.slice(lastIndex, match.index).trim()
    if (before) segments.push({ type: 'text', value: before })

    try {
      const parsed = JSON.parse(match[1].trim())
      if (parsed && typeof parsed === 'object' && parsed.tipo === 'ruta') {
        segments.push({ type: 'route', data: parsed as RouteData })
      } else {
        segments.push({ type: 'text', value: match[0] })
      }
    } catch {
      segments.push({ type: 'text', value: match[0] })
    }

    lastIndex = match.index + match[0].length
  }

  const remaining = content.slice(lastIndex).trim()
  if (remaining) segments.push({ type: 'text', value: remaining })

  return { segments }
}

export default function MessageBubble({ message, onViewMap }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const time = message.timestamp.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })

  const handleViewMap = async (routeData?: RouteData) => {
    if (!onViewMap) return
    const data = routeData ?? message.route_data
    if (!data) return

    const trufiNum = (data.trufi ?? '').match(/\d+/)?.[0] ?? ''

    // 1. Buscar en datos estáticos embebidos (funciona sin backend)
    const staticMatch = findStaticRoute(trufiNum)
    if (staticMatch) {
      onViewMap(staticMatch)
      return
    }

    // 2. Intentar con el backend/Supabase
    try {
      const list = await routesApi.list()
      const match = list.routes.find((r: Route) => r.numero === trufiNum)
      if (match) {
        onViewMap(match)
        return
      }
    } catch { /* backend no disponible */ }

    // 3. Último recurso: ruta sintética sin coordenadas
    onViewMap({
      id: `ai-${trufiNum}`,
      numero: trufiNum,
      name: data.trufi ?? 'Ruta sugerida',
      origin: data.paradas?.[0] ?? '',
      destination: data.paradas?.[data.paradas.length - 1] ?? '',
      price: 3,
      security: data.seguridad ?? 'media',
      stops: data.paradas ?? [],
      coordinates: [],
      active: true,
    })
  }

  if (isUser) {
    return (
      <div className="flex justify-end px-4 py-1 animate-slide-right">
        <div className="max-w-[78%]">
          <div className="bg-red-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-sm">
            <p className="text-sm leading-relaxed">{message.content}</p>
          </div>
          <div className="text-right mt-1">
            <span className="text-[10px] text-gray-400">{time}</span>
          </div>
        </div>
      </div>
    )
  }

  const { segments } = parseContent(message.content)
  const hasInlineRoute = segments.some(s => s.type === 'route')

  return (
    <div className="flex gap-2.5 px-4 py-1 animate-slide-left">
      <div className="w-9 h-9 bg-trufi-gradient rounded-full flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
        <Bus className="w-4 h-4 text-white" />
      </div>

      <div className="max-w-[78%]">
        {message.is_night_mode && (
          <div className="flex items-center gap-1.5 mb-2 text-amber-600 text-xs font-semibold">
            🌙 Modo nocturno activo — consulta rutas seguras
          </div>
        )}

        {segments.map((seg, i) => {
          if (seg.type === 'text') {
            const isLast = i === segments.length - 1
            return (
              <div
                key={i}
                className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-sm mb-1.5"
              >
                {seg.value ? (
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {seg.value}
                    {message.isStreaming && isLast && (
                      <span className="ml-0.5 inline-block w-0.5 h-4 bg-red-500 align-middle animate-pulse" />
                    )}
                  </p>
                ) : message.isStreaming ? (
                  <div className="flex gap-1 items-center py-0.5">
                    {[0, 150, 300].map(delay => (
                      <span
                        key={delay}
                        className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            )
          }
          return (
            <RouteCard
              key={i}
              data={seg.data}
              onViewMap={onViewMap ? () => handleViewMap(seg.data) : undefined}
            />
          )
        })}

        {/* fallback: route_data attached to message but no inline JSON block */}
        {!hasInlineRoute && message.route_data && (
          <RouteCard
            data={message.route_data}
            onViewMap={onViewMap ? () => handleViewMap() : undefined}
          />
        )}

        <div className="mt-1">
          <span className="text-[10px] text-gray-400">{time}</span>
        </div>
      </div>
    </div>
  )
}
