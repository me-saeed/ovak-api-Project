'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { encounterService, Encounter } from '@/lib/services/encounter-service'

export default function EncountersPage() {
  const searchParams = useSearchParams()
  const patientId = searchParams.get('patientId')
  
  const [encounters, setEncounters] = useState<Encounter[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('')

  useEffect(() => {
    loadEncounters()
  }, [patientId, filterStatus])

  const loadEncounters = async () => {
    try {
      const filters: any = { _count: 50 }
      if (patientId) {
        filters.patient = `Patient/${patientId}`
      }
      if (filterStatus) {
        filters.status = filterStatus
      }
      const data = await encounterService.search(filters)
      setEncounters(data)
    } catch (error) {
      console.error('Error loading encounters:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finished':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'arrived':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'planned':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getClassDisplay = (encounter: Encounter) => {
    return encounter.class?.display || encounter.class?.code || 'Unknown'
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading encounters...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Encounters</h1>
          <p className="text-gray-600 mt-2">Manage patient visits and interactions</p>
        </div>
        <Link
          href={`/encounters/new${patientId ? `?patientId=${patientId}` : ''}`}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          + Create Encounter
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
            <option value="planned">Planned</option>
            <option value="arrived">Arrived</option>
            <option value="triaged">Triaged</option>
            <option value="in-progress">In Progress</option>
            <option value="onleave">On Leave</option>
            <option value="finished">Finished</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Encounters List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {encounters.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {encounters.map((encounter) => {
              const patientRef = encounter.subject?.reference
              const patientId = patientRef?.split('/')[1]
              
              return (
                <Link
                  key={encounter.id}
                  href={`/encounters/${encounter.id}`}
                  className="block p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {getClassDisplay(encounter)} Encounter
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(encounter.status)}`}>
                          {encounter.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        {encounter.period?.start && (
                          <div>
                            <span className="font-medium">Start:</span>{' '}
                            {formatDateTime(encounter.period.start)}
                          </div>
                        )}
                        {encounter.period?.end && (
                          <div>
                            <span className="font-medium">End:</span>{' '}
                            {formatDateTime(encounter.period.end)}
                          </div>
                        )}
                        {encounter.type && encounter.type.length > 0 && (
                          <div>
                            <span className="font-medium">Type:</span>{' '}
                            {encounter.type[0].text || encounter.type[0].coding?.[0]?.display || 'N/A'}
                          </div>
                        )}
                      </div>
                      {patientId && (
                        <p className="text-sm text-gray-500 mt-2">
                          Patient: {patientId.substring(0, 8)}...
                        </p>
                      )}
                    </div>
                    <span className="text-blue-600 ml-4">→</span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">No encounters found</p>
            <Link
              href="/encounters/new"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first encounter →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

