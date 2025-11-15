'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { carePlanService, CarePlan } from '@/lib/services/careplan-service'

export default function CarePlansPage() {
  const searchParams = useSearchParams()
  const patientId = searchParams.get('patientId')
  
  const [carePlans, setCarePlans] = useState<CarePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('')

  useEffect(() => {
    loadCarePlans()
  }, [patientId, filterStatus])

  const loadCarePlans = async () => {
    try {
      const filters: any = { _count: 50 }
      if (patientId) {
        filters.patient = `Patient/${patientId}`
      }
      if (filterStatus) {
        filters.status = filterStatus
      }
      const data = await carePlanService.search(filters)
      setCarePlans(data)
    } catch (error) {
      console.error('Error loading care plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800'
      case 'revoked':
        return 'bg-red-100 text-red-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getIntentColor = (intent?: string) => {
    if (!intent) return 'bg-gray-100 text-gray-800'
    switch (intent.toLowerCase()) {
      case 'plan':
        return 'bg-purple-100 text-purple-800'
      case 'order':
        return 'bg-indigo-100 text-indigo-800'
      case 'proposal':
        return 'bg-pink-100 text-pink-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading care plans...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Care Plans</h1>
          <p className="text-gray-600 mt-2">Manage patient treatment plans and care goals</p>
        </div>
        <Link
          href={`/careplans/new${patientId ? `?patientId=${patientId}` : ''}`}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <span>➕</span> Create Care Plan
        </Link>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>
      </div>

      {/* Care Plans List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {carePlans.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {carePlans.map((carePlan) => {
              const patientRef = carePlan.subject?.reference
              const patientId = patientRef?.split('/')[1]
              
              return (
                <Link
                  key={carePlan.id}
                  href={`/careplans/${carePlan.id}`}
                  className="block p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {carePlan.title || 'Untitled Care Plan'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(carePlan.status)}`}>
                          {carePlan.status || 'Unknown'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getIntentColor(carePlan.intent)}`}>
                          {carePlan.intent || 'Unknown'}
                        </span>
                      </div>
                      {carePlan.description && (
                        <p className="text-sm text-gray-600 mb-3">{carePlan.description}</p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        {carePlan.period?.start && (
                          <div>
                            <span className="font-medium">Start:</span>{' '}
                            {formatDate(carePlan.period.start)}
                          </div>
                        )}
                        {carePlan.period?.end && (
                          <div>
                            <span className="font-medium">End:</span>{' '}
                            {formatDate(carePlan.period.end)}
                          </div>
                        )}
                        {carePlan.note && (() => {
                          const goalCount = carePlan.note.filter(note => 
                            note.text && note.text.match(/^Goal \d+:/i)
                          ).length
                          return goalCount > 0 ? (
                            <div>
                              <span className="font-medium">Goals:</span>{' '}
                              {goalCount}
                            </div>
                          ) : null
                        })()}
                      </div>
                      {carePlan.activity && carePlan.activity.length > 0 && (
                        <p className="text-sm text-gray-500 mt-2">
                          {carePlan.activity.length} {carePlan.activity.length === 1 ? 'activity' : 'activities'}
                        </p>
                      )}
                      {patientId && (
                        <p className="text-sm text-gray-500 mt-2">
                          Patient: {patientId.substring(0, 8)}...
                        </p>
                      )}
                    </div>
                    <span className="text-blue-600 ml-4 text-xl">→</span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <span className="text-6xl block mb-4">📋</span>
            <p className="text-gray-500 mb-4">No care plans found</p>
            <Link
              href="/careplans/new"
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
            >
              <span>➕</span> Create your first care plan →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

