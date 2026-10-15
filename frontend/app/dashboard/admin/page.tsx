'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { usersApi, routesApi, reportsApi } from '@/services/api'
import type { Route, Report, Stats } from '@/services/api'
import type { Profile } from '@/services/supabase'
import { StatSkeleton, CardSkeleton } from '@/components/ui/SkeletonLoader'
import {
  Users, Bus, AlertCircle, CheckCircle,
  TrendingUp, ShieldCheck, Trash2, ToggleLeft,
  RefreshCw, WifiOff, UserX, Zap,
} from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<Profile[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [pendingDrivers, setPendingDrivers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'users' | 'drivers' | 'routes' | 'reports'>('users')

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [s, u, r, rep, pd] = await Promise.all([
        usersApi.getStats(),
        usersApi.list(),
        routesApi.list(false),
        reportsApi.list(),
        usersApi.list('chofer'),
      ])
      setStats(s ?? null)
      setUsers(u?.users ?? [])
      setRoutes(r?.routes ?? [])
      setReports(rep?.reports ?? [])
      setPendingDrivers((pd?.users ?? []).filter((d: Profile) => !d.approved))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : ''
      setError(
        message.includes('Failed to fetch')
          ? 'No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo en localhost:8000.'
          : (message || 'Error desconocido al cargar los datos.')
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const handleToggleUser = async (id: string) => {
    try {
      await usersApi.toggleActive(id)
      fetchAll()
    } catch { /* silent */ }
  }

  const handleApproveDriver = async (id: string) => {
    try {
      await usersApi.approveDriver(id)
      fetchAll()
    } catch { /* silent */ }
  }

  const handleDeleteReport = async (id: string) => {
    try {
      await reportsApi.delete(id)
      setReports(prev => prev.filter(r => r.id !== id))
    } catch { /* silent */ }
  }

  const handleMarkReport = async (id: string, status: string) => {
    try {
      await reportsApi.updateStatus(id, status)
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    } catch { /* silent */ }
  }

  const handleToggleRoute = async (id: string, active: boolean) => {
    try {
      await routesApi.update(id, { active: !active })
      fetchAll()
    } catch { /* silent */ }
  }

  const STAT_CARDS = [
    { label: 'Usuarios totales', value: stats?.total_users ?? '—', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Choferes activos', value: stats?.active_drivers ?? '—', icon: Bus, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Reportes pendientes', value: stats?.pending_reports ?? '—', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Rutas registradas', value: stats?.total_routes ?? '—', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  const TABS = [
    { id: 'users', label: 'Usuarios', count: users.length },
    { id: 'drivers', label: 'Choferes pendientes', count: pendingDrivers.length },
    { id: 'routes', label: 'Rutas', count: routes.length },
    { id: 'reports', label: 'Reportes', count: reports.filter(r => r.status === 'pendiente').length },
  ] as const

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Panel Administrador</h1>
            <p className="text-gray-500 text-sm mt-1">Gestiona usuarios, rutas y reportes de WAYRA</p>
          </div>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
            <WifiOff className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700 mb-1">Error al cargar datos</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <button
              onClick={fetchAll}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors flex-shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reintentar
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? [...Array(4)].map((_, i) => <StatSkeleton key={i} />)
            : STAT_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-gray-900">{value}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              </div>
            ))
          }
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeTab === t.id
                    ? 'border-b-2 border-red-600 text-red-700 bg-red-50'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {t.label}
                {t.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === t.id ? 'bg-red-200 text-red-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-4">
            {/* Users */}
            {activeTab === 'users' && (
              loading ? <CardSkeleton /> :
              users.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <UserX className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium">No hay usuarios registrados</p>
                  <p className="text-xs text-gray-400 mt-1">Los usuarios aparecerán aquí cuando se registren en la app</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 font-semibold border-b border-gray-100">
                        <th className="pb-3 pr-4">Nombre</th>
                        <th className="pb-3 pr-4">Email</th>
                        <th className="pb-3 pr-4">Rol</th>
                        <th className="pb-3 pr-4">Plan</th>
                        <th className="pb-3 pr-4">Estado</th>
                        <th className="pb-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="py-3 pr-4 font-medium text-gray-800">{u.full_name || '—'}</td>
                          <td className="py-3 pr-4 text-gray-500 text-xs truncate max-w-[160px]">{u.email}</td>
                          <td className="py-3 pr-4">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                              u.role === 'chofer' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>{u.role}</span>
                          </td>
                          <td className="py-3 pr-4">
                            {u.plan === 'premium' ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                <Zap className="w-3 h-3" /> Premium
                              </span>
                            ) : (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                Gratuito
                              </span>
                            )}
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                            }`}>
                              {u.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() => handleToggleUser(u.id)}
                              className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                                u.is_active
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                  : 'bg-green-50 text-green-700 hover:bg-green-100'
                              }`}
                            >
                              <ToggleLeft className="w-3.5 h-3.5" />
                              {u.is_active ? 'Desactivar' : 'Activar'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* Pending drivers */}
            {activeTab === 'drivers' && (
              pendingDrivers.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-red-300" />
                  <p className="text-sm">No hay choferes pendientes de aprobación</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingDrivers.map(d => (
                    <div key={d.id} className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{d.full_name || 'Sin nombre'}</p>
                        <p className="text-xs text-gray-500">{d.email}</p>
                      </div>
                      <button
                        onClick={() => handleApproveDriver(d.id)}
                        className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Aprobar
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Routes */}
            {activeTab === 'routes' && (
              loading ? <CardSkeleton /> :
              routes.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Bus className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium">No hay rutas registradas</p>
                  <p className="text-xs text-gray-400 mt-1">Ejecuta el seed.sql en Supabase para cargar las rutas de Cochabamba</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {routes.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center font-bold text-red-700 text-sm">
                          {r.numero}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{r.name}</p>
                          <p className="text-xs text-gray-500">Bs {r.price} · Seguridad: {r.security}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {r.active ? 'Activa' : 'Inactiva'}
                        </span>
                        <button
                          onClick={() => handleToggleRoute(r.id, r.active)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                          {r.active ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Reports */}
            {activeTab === 'reports' && (
              loading ? <CardSkeleton /> :
              reports.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2 text-red-300" />
                  <p className="text-sm">Sin reportes activos</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map(rep => (
                    <div key={rep.id} className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-orange-600 uppercase">{rep.type}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              rep.status === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                              rep.status === 'revisado' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>{rep.status}</span>
                          </div>
                          <p className="text-sm text-gray-700">{rep.description}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(rep.created_at).toLocaleString('es-BO')}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {rep.status === 'pendiente' && (
                            <button
                              onClick={() => handleMarkReport(rep.id, 'revisado')}
                              className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                              title="Marcar como revisado"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteReport(rep.id)}
                            className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                            title="Eliminar reporte"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
