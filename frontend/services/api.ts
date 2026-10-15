const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || `HTTP ${res.status}`)
  }
  return res.json()
}

// ─── Chat ────────────────────────────────────────────────────
export interface ChatPayload {
  message: string
  user_id?: string
  conversation_history?: { role: string; content: string }[]
  origin?: string
  destination?: string
}

export interface ChatResponse {
  text: string
  route_data?: RouteData
  is_night_mode: boolean
}

export interface StreamEvent {
  chunk?: string
  done?: boolean
  route_data?: RouteData
  is_night_mode?: boolean
  error?: string
}

export interface RouteData {
  tipo: string
  trufi: string
  tiempo_espera: string
  tiempo_viaje: string
  precio?: string
  precio_adulto?: string
  precio_estudiante?: string
  precio_tercera_edad?: string
  precio_nino?: string
  seguridad: 'alta' | 'media' | 'baja'
  paradas: string[]
  consejo: string
  modo_seguro: boolean
}

export const chatApi = {
  send: (payload: ChatPayload) =>
    request<ChatResponse>('/api/chat/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  stream: async function* (payload: ChatPayload): AsyncGenerator<StreamEvent> {
    const res = await fetch(`${API_URL}/api/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const body = await res.text()
      let message = `HTTP ${res.status}`
      try {
        const parsed = JSON.parse(body)
        if (parsed?.detail?.message) message = parsed.detail.message
        else if (typeof parsed?.detail === 'string') message = parsed.detail
      } catch { /* not json */ }
      throw new Error(message)
    }

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const parts = buffer.split('\n\n')
      buffer = parts.pop() ?? ''

      for (const part of parts) {
        const line = part.trim()
        if (!line.startsWith('data: ')) continue
        try {
          yield JSON.parse(line.slice(6)) as StreamEvent
        } catch {
          // ignorar eventos mal formados
        }
      }
    }
  },

  getRoutesContext: () => request<{ routes: Route[] }>('/api/chat/routes-context'),
}

// ─── Routes ─────────────────────────────────────────────────
export interface Route {
  id: string
  numero: string
  name: string
  origin: string
  destination: string
  price: number
  security: 'alta' | 'media' | 'baja'
  stops: string[]
  coordinates: { lat: number; lng: number }[]
  active: boolean
}

export const routesApi = {
  list: (activeOnly = true) =>
    request<{ routes: Route[] }>(`/api/routes/?active_only=${activeOnly}`),
  get: (id: string) => request<Route>(`/api/routes/${id}`),
  create: (data: Partial<Route>) =>
    request<Route>('/api/routes/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Route>) =>
    request<Route>(`/api/routes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<{ message: string }>(`/api/routes/${id}`, { method: 'DELETE' }),
}

// ─── Reports ─────────────────────────────────────────────────
export interface Report {
  id: string
  user_id: string
  route_id?: string
  type: string
  description: string
  location_lat?: number
  location_lng?: number
  status: string
  created_at: string
  profiles?: { full_name: string; email: string }
  routes?: { number: string; name: string }
}

export const reportsApi = {
  list: (status?: string) =>
    request<{ reports: Report[] }>(`/api/reports/${status ? `?status=${status}` : ''}`),
  create: (data: Partial<Report>, userId?: string) =>
    request<Report>(`/api/reports/${userId ? `?user_id=${userId}` : ''}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateStatus: (id: string, status: string) =>
    request<Report>(`/api/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  delete: (id: string) =>
    request<{ message: string }>(`/api/reports/${id}`, { method: 'DELETE' }),
}

// ─── Users ───────────────────────────────────────────────────
export interface Stats {
  total_users: number
  active_drivers: number
  pending_reports: number
  total_routes: number
  pending_drivers: number
}

export const usersApi = {
  list: (role?: string) =>
    request<{ users: any[] }>(`/api/users/${role ? `?role=${role}` : ''}`),
  get: (id: string) => request<any>(`/api/users/${id}`),
  update: (id: string, data: any) =>
    request<any>(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  toggleActive: (id: string) =>
    request<any>(`/api/users/${id}/toggle-active`, { method: 'PATCH' }),
  approveDriver: (id: string) =>
    request<any>(`/api/users/${id}/approve-driver`, { method: 'PATCH' }),
  updateDriverStatus: (driverId: string, data: any) =>
    request<any>(`/api/users/${driverId}/status`, { method: 'POST', body: JSON.stringify(data) }),
  getStats: () => request<Stats>('/api/users/stats'),
  upgradePlan: (userId: string) =>
    request<{ message: string; plan: string }>(`/api/users/${userId}/upgrade`, { method: 'PATCH' }),
  getFavorites: (userId: string) =>
    request<{ favorites: any[] }>(`/api/users/${userId}/favorites`),
  addFavorite: (userId: string, routeId: string) =>
    request<any>(`/api/users/${userId}/favorites/${routeId}`, { method: 'POST' }),
  removeFavorite: (userId: string, routeId: string) =>
    request<any>(`/api/users/${userId}/favorites/${routeId}`, { method: 'DELETE' }),
  getTrips: (userId: string) =>
    request<{ trips: any[] }>(`/api/users/${userId}/trips`),
}
