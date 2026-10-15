'use client'

import { useState, useCallback } from 'react'
import { reportsApi, Report } from '@/services/api'

export function useReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = useCallback(async (status?: string) => {
    setLoading(true)
    try {
      const data = await reportsApi.list(status)
      setReports(data.reports)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const createReport = useCallback(async (
    reportData: Partial<Report>,
    userId?: string,
  ) => {
    try {
      const newReport = await reportsApi.create(reportData, userId)
      setReports(prev => [newReport, ...prev])
      return newReport
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [])

  const updateStatus = useCallback(async (id: string, status: string) => {
    try {
      await reportsApi.updateStatus(id, status)
      setReports(prev =>
        prev.map(r => (r.id === id ? { ...r, status } : r))
      )
    } catch (err: any) {
      setError(err.message)
    }
  }, [])

  const deleteReport = useCallback(async (id: string) => {
    try {
      await reportsApi.delete(id)
      setReports(prev => prev.filter(r => r.id !== id))
    } catch (err: any) {
      setError(err.message)
    }
  }, [])

  return { reports, loading, error, fetchReports, createReport, updateStatus, deleteReport }
}
