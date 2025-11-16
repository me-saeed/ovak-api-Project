'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { serviceRequestService, ServiceRequest } from '@/lib/services/servicerequest-service'

export default function ServiceRequestsPage() {
  const searchParams = useSearchParams()
  const patientId = searchParams.get('patientId')
  
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterIntent, setFilterIntent] = useState<string>('')

  useEffect(() => {
    loadServiceRequests()
  }, [patientId, filterStatus, filterIntent])

  const loadServiceRequests = async () => {
    try {
      const filters: any = { _count: 50 }
      if (patientId) {
        filters.patient = `Patient/${patientId}`
      }
      if (filterStatus) {
        filters.status = filterStatus
      }
      if (filterIntent) {
        filters.intent = filterIntent
      }
      const data = await serviceRequestService.search(filters)
      setServiceRequests(data)
    } catch (error) {
      console.error('Error loading service requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
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

  const getPriorityColor = (priority?: string) => {
    if (!priority) return 'bg-gray-100 text-gray-800'
    switch (priority.toLowerCase()) {
      case 'stat':
        return 'bg-red-100 text-red-800'
      case 'asap':
        return 'bg-orange-100 text-orange-800'
      case 'urgent':
        return 'bg-yellow-100 text-yellow-800'
      case 'routine':
        return 'bg-green-100 text-green-800'
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
        <div className="text-gray-500">Loading service requests...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Requests</h1>
          <p className="text-gray-600 mt-2">Manage orders, referrals, and service requests</p>
        </div>
        <Link
          href={`/servicerequests/new${patientId ? `?patientId=${patientId}` : ''}`}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <span>➕</span> Create Service Request
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Intent:</label>
            <select
              value={filterIntent}
              onChange={(e) => setFilterIntent(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">All Intents</option>
              <option value="order">Order</option>
              <option value="plan">Plan</option>
              <option value="proposal">Proposal</option>
              <option value="original-order">Original Order</option>
            </select>
          </div>
        </div>
      </div>

      {/* Service Requests List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {serviceRequests.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {serviceRequests.map((request) => {
              const patientRef = request.subject?.reference
              const patientId = patientRef?.split('/')[1]
              
              return (
                <Link
                  key={request.id}
                  href={`/servicerequests/${request.id}`}
                  className="block p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {request.code?.text || request.code?.coding?.[0]?.display || 'Service Request'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status || 'Unknown'}
                        </span>
                        {request.priority && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                            {request.priority.toUpperCase()}
                          </span>
                        )}
                        {request.intent && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {request.intent}
                          </span>
                        )}
                      </div>
                      {request.category && request.category.length > 0 && (
                        <p className="text-sm text-gray-600 mb-2">
                          Category: {request.category[0].text || request.category[0].coding?.[0]?.display || 'N/A'}
                        </p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        {request.occurrenceDateTime && (
                          <div>
                            <span className="font-medium">Scheduled:</span>{' '}
                            {formatDate(request.occurrenceDateTime)}
                          </div>
                        )}
                        {request.authoredOn && (
                          <div>
                            <span className="font-medium">Ordered:</span>{' '}
                            {formatDate(request.authoredOn)}
                          </div>
                        )}
                        {request.category && request.category.length > 0 && (
                          <div>
                            <span className="font-medium">Type:</span>{' '}
                            {request.category[0].text || request.category[0].coding?.[0]?.display || 'N/A'}
                          </div>
                        )}
                      </div>
                      {patientId && (
                        <p className="text-sm text-gray-500 mt-2">
                          Patient: {patientId.substring(0, 8)}...
                        </p>
                      )}
                      {request.note && request.note.length > 0 && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          {request.note[0].text}
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
            <p className="text-gray-500 mb-4">No service requests found</p>
            <Link
              href="/servicerequests/new"
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
            >
              <span>➕</span> Create your first service request →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

