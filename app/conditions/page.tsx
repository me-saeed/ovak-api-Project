'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { conditionService, Condition } from '@/lib/services/condition-service'

export default function ConditionsPage() {
  const searchParams = useSearchParams()
  const patientId = searchParams.get('patientId')
  
  const [conditions, setConditions] = useState<Condition[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('')

  useEffect(() => {
    loadConditions()
  }, [patientId, filterStatus])

  const loadConditions = async () => {
    try {
      const filters: any = { _count: 50 }
      if (patientId) {
        filters.patient = `Patient/${patientId}`
      }
      if (filterStatus) {
        filters.clinicalStatus = filterStatus
      }
      const data = await conditionService.search(filters)
      setConditions(data)
    } catch (error) {
      console.error('Error loading conditions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-red-100 text-red-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'remission':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
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
        <div className="text-gray-500">Loading conditions...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Conditions</h1>
          <p className="text-gray-600 mt-2">Manage patient diagnoses and medical conditions</p>
        </div>
        <Link
          href={`/conditions/new${patientId ? `?patientId=${patientId}` : ''}`}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <span>➕</span> Record Condition
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
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="remission">Remission</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Conditions List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {conditions.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {conditions.map((condition) => {
              const patientRef = condition.subject?.reference
              const patientId = patientRef?.split('/')[1]
              const status = condition.clinicalStatus?.coding?.[0]?.code || condition.clinicalStatus?.text || 'unknown'
              
              return (
                <Link
                  key={condition.id}
                  href={`/conditions/${condition.id}`}
                  className="block p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {condition.code?.text || condition.code?.coding?.[0]?.display || 'Condition'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {condition.clinicalStatus?.coding?.[0]?.display || condition.clinicalStatus?.text || 'Unknown'}
                        </span>
                        {condition.severity && (
                          <span className="px-2 py-1 rounded text-xs bg-orange-100 text-orange-800">
                            {condition.severity.coding?.[0]?.display || condition.severity.text}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        {condition.onsetDateTime && (
                          <div>
                            <span className="font-medium">Onset:</span>{' '}
                            {formatDate(condition.onsetDateTime)}
                          </div>
                        )}
                        {condition.abatementDateTime && (
                          <div>
                            <span className="font-medium">Resolved:</span>{' '}
                            {formatDate(condition.abatementDateTime)}
                          </div>
                        )}
                        {condition.category && condition.category.length > 0 && (
                          <div>
                            <span className="font-medium">Category:</span>{' '}
                            {condition.category[0].text || condition.category[0].coding?.[0]?.display || 'N/A'}
                          </div>
                        )}
                      </div>
                      {patientId && (
                        <p className="text-sm text-gray-500 mt-2">
                          Patient: {patientId.substring(0, 8)}...
                        </p>
                      )}
                      {condition.note && condition.note.length > 0 && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          {condition.note[0].text}
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
            <span className="text-6xl block mb-4">🏥</span>
            <p className="text-gray-500 mb-4">No conditions found</p>
            <Link
              href="/conditions/new"
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
            >
              <span>➕</span> Record your first condition →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

