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
      title: 'Patients',
      value: stats.totalPatients,
      icon: '👥',
      color: 'bg-blue-500',
      href: '/patients',
    },
    {
      title: 'Appointments',
      value: stats.totalAppointments,
      icon: '📅',
      color: 'bg-purple-500',
      href: '/appointments',
    },
    {
      title: 'Encounters',
      value: stats.totalEncounters,
      icon: '🏥',
      color: 'bg-indigo-500',
      href: '/encounters',
    },
    {
      title: 'Conditions',
      value: stats.totalConditions,
      icon: '💊',
      color: 'bg-red-500',
      href: '/conditions',
    },
    {
      title: 'Care Plans',
      value: stats.totalCarePlans,
      icon: '📋',
      color: 'bg-teal-500',
      href: '/careplans',
    },
    {
      title: 'Service Requests',
      value: stats.totalServiceRequests,
      icon: '🔬',
      color: 'bg-cyan-500',
      href: '/servicerequests',
    },
    {
      title: 'Observations',
      value: stats.totalObservations,
      icon: '📋',
      color: 'bg-green-500',
      href: '/observations',
    },
    {
      title: 'Questionnaires',
      value: stats.totalQuestionnaires,
      icon: '📝',
      color: 'bg-yellow-500',
      href: '/questionnaires',
    },
    {
      title: 'Documents',
      value: stats.totalDocuments,
      icon: '📁',
      color: 'bg-orange-500',
      href: '/documents',
    },
  ]

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here&apos;s your overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className={`${card.color} w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-sm`}>
                {card.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Recent Patients */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">👥</span>
            <h2 className="text-lg font-semibold text-gray-900">Recent Patients</h2>
          </div>
          {stats.recentPatients.length > 0 ? (
            <div className="space-y-3">
              {stats.recentPatients.map((patient: any) => (
                <Link
                  key={patient.id}
                  href={`/patients/${patient.id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition border-l-4 border-blue-500"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {patient.name?.[0]?.given?.join(' ')} {patient.name?.[0]?.family}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {patient.gender} • {patient.birthDate ? formatDate(patient.birthDate) : 'N/A'}
                      </p>
                    </div>
                    <span className="text-blue-600 text-xl">→</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="text-4xl block mb-2">📭</span>
              <p className="text-gray-500 text-sm">No recent patients</p>
            </div>
          )}
          <Link
            href="/patients"
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all patients →
          </Link>
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📅</span>
            <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
          </div>
          {stats.recentAppointments.length > 0 ? (
            <div className="space-y-3">
              {stats.recentAppointments.map((appointment: any) => (
                <Link
                  key={appointment.id}
                  href={`/appointments/${appointment.id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition border-l-4 border-purple-500"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {appointment.description || 'Appointment'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {appointment.start ? formatDateTime(appointment.start) : 'N/A'}
                        {appointment.status && (
                          <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                            appointment.status === 'booked' ? 'bg-blue-100 text-blue-800' :
                            appointment.status === 'fulfilled' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {appointment.status}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="text-purple-600 text-xl">→</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="text-4xl block mb-2">📭</span>
              <p className="text-gray-500 text-sm">No recent appointments</p>
            </div>
          )}
          <Link
            href="/appointments"
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all appointments →
          </Link>
        </div>

        {/* Recent Encounters */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🏥</span>
            <h2 className="text-lg font-semibold text-gray-900">Recent Encounters</h2>
          </div>
          {stats.recentEncounters.length > 0 ? (
            <div className="space-y-3">
              {stats.recentEncounters.map((encounter: any) => (
                <Link
                  key={encounter.id}
                  href={`/encounters/${encounter.id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition border-l-4 border-indigo-500"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {encounter.class?.display || 'Encounter'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {encounter.period?.start ? formatDateTime(encounter.period.start) : 'N/A'}
                        {encounter.status && (
                          <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                            encounter.status === 'finished' ? 'bg-green-100 text-green-800' :
                            encounter.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {encounter.status}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="text-indigo-600 text-xl">→</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="text-4xl block mb-2">📭</span>
              <p className="text-gray-500 text-sm">No recent encounters</p>
            </div>
          )}
          <Link
            href="/encounters"
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all encounters →
          </Link>
        </div>

        {/* Recent Conditions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">💊</span>
            <h2 className="text-lg font-semibold text-gray-900">Recent Conditions</h2>
          </div>
          {stats.recentConditions.length > 0 ? (
            <div className="space-y-3">
              {stats.recentConditions.map((condition: any) => {
                const status = condition.clinicalStatus?.coding?.[0]?.code || condition.clinicalStatus?.text || 'unknown'
                const getStatusColor = (status: string) => {
                  switch (status.toLowerCase()) {
                    case 'active':
                      return 'border-red-500 bg-red-50'
                    case 'resolved':
                      return 'border-green-500 bg-green-50'
                    case 'remission':
                      return 'border-yellow-500 bg-yellow-50'
                    default:
                      return 'border-gray-500 bg-gray-50'
                  }
                }
                return (
                  <Link
                    key={condition.id}
                    href={`/conditions/${condition.id}`}
                    className={`block p-3 rounded-lg hover:opacity-80 transition border-l-4 ${getStatusColor(status)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {condition.code?.text || condition.code?.coding?.[0]?.display || 'Condition'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            status === 'active' ? 'bg-red-100 text-red-800' :
                            status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {condition.clinicalStatus?.coding?.[0]?.display || condition.clinicalStatus?.text || 'Unknown'}
                          </span>
                          {condition.onsetDateTime && (
                            <span className="ml-2">
                              Onset: {formatDate(condition.onsetDateTime)}
                            </span>
                          )}
                        </p>
                      </div>
                      <span className="text-red-600 text-xl">→</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="text-4xl block mb-2">📭</span>
              <p className="text-gray-500 text-sm">No recent conditions</p>
            </div>
          )}
          <Link
            href="/conditions"
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all conditions →
          </Link>
        </div>

        {/* Recent Care Plans */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📋</span>
            <h2 className="text-lg font-semibold text-gray-900">Recent Care Plans</h2>
          </div>
          {stats.recentCarePlans.length > 0 ? (
            <div className="space-y-3">
              {stats.recentCarePlans.map((carePlan: any) => {
                const status = carePlan.status || 'unknown'
                const getStatusColor = (status: string) => {
                  switch (status.toLowerCase()) {
                    case 'active':
                      return 'border-green-500 bg-green-50'
                    case 'completed':
                      return 'border-blue-500 bg-blue-50'
                    case 'on-hold':
                      return 'border-yellow-500 bg-yellow-50'
                    default:
                      return 'border-gray-500 bg-gray-50'
                  }
                }
                return (
                  <Link
                    key={carePlan.id}
                    href={`/careplans/${carePlan.id}`}
                    className={`block p-3 rounded-lg hover:opacity-80 transition border-l-4 ${getStatusColor(status)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {carePlan.title || 'Untitled Care Plan'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            status === 'active' ? 'bg-green-100 text-green-800' :
                            status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {status}
                          </span>
                          {carePlan.note && (() => {
                            const goalCount = carePlan.note.filter(note => 
                              note.text && note.text.match(/^Goal \d+:/i)
                            ).length
                            return goalCount > 0 ? (
                              <span className="ml-2">
                                {goalCount} {goalCount === 1 ? 'goal' : 'goals'}
                              </span>
                            ) : null
                          })()}
                          {carePlan.period?.start && (
                            <span className="ml-2">
                              Started: {formatDate(carePlan.period.start)}
                            </span>
                          )}
                        </p>
                      </div>
                      <span className="text-teal-600 text-xl">→</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="text-4xl block mb-2">📭</span>
              <p className="text-gray-500 text-sm">No recent care plans</p>
            </div>
          )}
          <Link
            href="/careplans"
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all care plans →
          </Link>
        </div>

        {/* Recent Service Requests */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🔬</span>
            <h2 className="text-lg font-semibold text-gray-900">Recent Service Requests</h2>
          </div>
          {stats.recentServiceRequests.length > 0 ? (
            <div className="space-y-3">
              {stats.recentServiceRequests.map((request: any) => {
                const status = request.status || 'unknown'
                const getStatusColor = (status: string) => {
                  switch (status.toLowerCase()) {
                    case 'active':
                      return 'border-blue-500 bg-blue-50'
                    case 'completed':
                      return 'border-green-500 bg-green-50'
                    case 'on-hold':
                      return 'border-yellow-500 bg-yellow-50'
                    case 'revoked':
                      return 'border-red-500 bg-red-50'
                    default:
                      return 'border-gray-500 bg-gray-50'
                  }
                }
                return (
                  <Link
                    key={request.id}
                    href={`/servicerequests/${request.id}`}
                    className={`block p-3 rounded-lg hover:opacity-80 transition border-l-4 ${getStatusColor(status)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {request.code?.text || request.code?.coding?.[0]?.display || 'Service Request'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            status === 'active' ? 'bg-blue-100 text-blue-800' :
                            status === 'completed' ? 'bg-green-100 text-green-800' :
                            status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' :
                            status === 'revoked' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {status}
                          </span>
                          {request.priority && (
                            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                              request.priority === 'stat' ? 'bg-red-100 text-red-800' :
                              request.priority === 'asap' ? 'bg-orange-100 text-orange-800' :
                              request.priority === 'urgent' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {request.priority.toUpperCase()}
                            </span>
                          )}
                          {request.occurrenceDateTime && (
                            <span className="ml-2">
                              Scheduled: {formatDate(request.occurrenceDateTime)}
                            </span>
                          )}
                        </p>
                      </div>
                      <span className="text-cyan-600 text-xl">→</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="text-4xl block mb-2">📭</span>
              <p className="text-gray-500 text-sm">No recent service requests</p>
            </div>
          )}
          <Link
            href="/servicerequests"
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all service requests →
          </Link>
        </div>

        {/* Recent Questionnaires */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📝</span>
            <h2 className="text-lg font-semibold text-gray-900">Recent Questionnaires</h2>
          </div>
          {stats.recentQuestionnaires.length > 0 ? (
            <div className="space-y-3">
              {stats.recentQuestionnaires.map((questionnaire: any) => (
                <Link
                  key={questionnaire.id}
                  href={`/questionnaires/${questionnaire.id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition border-l-4 border-yellow-500"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {questionnaire.title || 'Untitled Questionnaire'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {questionnaire.item?.length || 0} questions
                        {questionnaire.status && (
                          <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                            questionnaire.status === 'active' ? 'bg-green-100 text-green-800' :
                            questionnaire.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {questionnaire.status}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="text-yellow-600 text-xl">→</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="text-4xl block mb-2">📭</span>
              <p className="text-gray-500 text-sm">No recent questionnaires</p>
            </div>
          )}
          <Link
            href="/questionnaires"
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all questionnaires →
          </Link>
        </div>

        {/* Recent Documents */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📁</span>
            <h2 className="text-lg font-semibold text-gray-900">Recent Documents</h2>
          </div>
          {stats.recentDocuments.length > 0 ? (
            <div className="space-y-3">
              {stats.recentDocuments.map((doc: any) => {
                const attachment = doc.content?.[0]?.attachment
                const contentType = attachment?.contentType || 'application/pdf'
                const getFileIcon = (type: string) => {
                  if (type.includes('pdf')) return '📕'
                  if (type.includes('image')) return '🖼️'
                  if (type.includes('word')) return '📘'
                  return '📄'
                }
                return (
                  <Link
                    key={doc.id}
                    href={`/documents/${doc.id}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 transition border-l-4 border-orange-500"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        <span className="text-lg mt-0.5">{getFileIcon(contentType)}</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {attachment?.title || doc.description || 'Document'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {doc.type?.text || doc.type?.coding?.[0]?.display || 'Document'}
                            {doc.date && ` • ${formatDate(doc.date)}`}
                          </p>
                        </div>
                      </div>
                      <span className="text-orange-600 text-xl">→</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="text-4xl block mb-2">📭</span>
              <p className="text-gray-500 text-sm">No recent documents</p>
            </div>
          )}
          <Link
            href="/documents"
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all documents →
          </Link>
        </div>

        {/* Recent Observations */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📋</span>
            <h2 className="text-lg font-semibold text-gray-900">Recent Observations</h2>
          </div>
          {stats.recentObservations.length > 0 ? (
            <div className="space-y-3">
              {stats.recentObservations.slice(0, 5).map((obs: any) => (
                <div key={obs.id} className="p-3 rounded-lg bg-gray-50 border-l-4 border-green-500">
                  <p className="font-medium text-gray-900 text-sm">
                    {obs.code?.coding?.[0]?.display || 'Observation'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {obs.valueQuantity && `${obs.valueQuantity.value} ${obs.valueQuantity.unit}`}
                    {obs.valueString && obs.valueString}
                    {obs.effectiveDateTime && ` • ${formatDateTime(obs.effectiveDateTime)}`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="text-4xl block mb-2">📭</span>
              <p className="text-gray-500 text-sm">No recent observations</p>
            </div>
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
