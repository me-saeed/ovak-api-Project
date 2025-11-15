'use client'

import { useEffect, useState } from 'react'
import { dashboardService, DashboardStats } from '@/lib/services/dashboard-service'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await dashboardService.getStats()
      setStats(data)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Failed to load dashboard data</div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: '👥',
      color: 'bg-blue-500',
      href: '/patients',
    },
    {
      title: 'Observations',
      value: stats.totalObservations,
      icon: '📋',
      color: 'bg-green-500',
      href: '/observations',
    },
    {
      title: 'Appointments',
      value: stats.totalAppointments,
      icon: '📅',
      color: 'bg-purple-500',
      href: '/appointments',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className={`${card.color} w-16 h-16 rounded-lg flex items-center justify-center text-3xl`}>
                {card.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Patients</h2>
          {stats.recentPatients.length > 0 ? (
            <div className="space-y-3">
              {stats.recentPatients.map((patient: any) => (
                <Link
                  key={patient.id}
                  href={`/patients/${patient.id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {patient.name?.[0]?.given?.join(' ')} {patient.name?.[0]?.family}
                      </p>
                      <p className="text-sm text-gray-500">
                        {patient.gender} • {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <span className="text-blue-600">→</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No recent patients</p>
          )}
          <Link
            href="/patients"
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all patients →
          </Link>
        </div>

        {/* Recent Observations */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Observations</h2>
          {stats.recentObservations.length > 0 ? (
            <div className="space-y-3">
              {stats.recentObservations.slice(0, 5).map((obs: any) => (
                <div key={obs.id} className="p-3 rounded-lg bg-gray-50">
                  <p className="font-medium text-gray-900 text-sm">
                    {obs.code?.coding?.[0]?.display || 'Observation'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {obs.effectiveDateTime ? new Date(obs.effectiveDateTime).toLocaleString() : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No recent observations</p>
          )}
          <Link
            href="/observations"
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all observations →
          </Link>
        </div>
      </div>
    </div>
  )
}

