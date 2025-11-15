'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { observationService, Observation } from '@/lib/services/observation-service'

export default function ObservationsPage() {
  const searchParams = useSearchParams()
  const patientId = searchParams.get('patientId')
  
  const [observations, setObservations] = useState<Observation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadObservations()
  }, [patientId])

  const loadObservations = async () => {
    try {
      const data = patientId
        ? await observationService.getByPatient(patientId)
        : await observationService.search({ _count: 50 })
      setObservations(data)
    } catch (error) {
      console.error('Error loading observations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading observations...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Observations</h1>
          <p className="text-gray-600 mt-2">View and manage patient observations</p>
        </div>
        <Link
          href={`/observations/new${patientId ? `?patientId=${patientId}` : ''}`}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          + Add Observation
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {observations.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {observations.map((obs) => (
              <div key={obs.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {obs.code?.coding?.[0]?.display || 'Observation'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {obs.effectiveDateTime && new Date(obs.effectiveDateTime).toLocaleString()}
                    </p>
                    {obs.valueQuantity && (
                      <p className="text-sm text-gray-700 mt-2">
                        Value: <span className="font-medium">{obs.valueQuantity.value} {obs.valueQuantity.unit}</span>
                      </p>
                    )}
                    {obs.valueString && (
                      <p className="text-sm text-gray-700 mt-2">
                        Value: <span className="font-medium">{obs.valueString}</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      obs.status === 'final' ? 'bg-green-100 text-green-800' :
                      obs.status === 'preliminary' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {obs.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">No observations found</p>
            <Link
              href="/observations/new"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first observation →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

