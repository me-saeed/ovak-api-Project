'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { serviceRequestService, ServiceRequest } from '@/lib/services/servicerequest-service'
import { patientService, Patient } from '@/lib/services/patient-service'
import { conditionService, Condition } from '@/lib/services/condition-service'
import { encounterService, Encounter } from '@/lib/services/encounter-service'

export default function ServiceRequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const serviceRequestId = params.id as string

  const [serviceRequest, setServiceRequest] = useState<ServiceRequest | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [conditions, setConditions] = useState<Condition[]>([])
  const [encounter, setEncounter] = useState<Encounter | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (serviceRequestId) {
      loadServiceRequest()
    }
  }, [serviceRequestId])

  const loadServiceRequest = async () => {
    try {
      const data = await serviceRequestService.getById(serviceRequestId)
      setServiceRequest(data)

      // Load patient if reference exists
      const patientRef = data.subject?.reference
      if (patientRef) {
        const patientId = patientRef.split('/')[1]
        try {
          const patientData = await patientService.getById(patientId)
          setPatient(patientData)
        } catch (error) {
          console.error('Error loading patient:', error)
        }
      }

      // Load conditions if references exist
      if (data.reasonReference && data.reasonReference.length > 0) {
        const conditionPromises = data.reasonReference
          .map(ref => {
            const conditionId = ref.reference?.split('/')[1]
            return conditionId ? conditionService.getById(conditionId).catch(() => null) : null
          })
          .filter(Boolean)
        const conditionData = await Promise.all(conditionPromises)
        setConditions(conditionData.filter(Boolean) as Condition[])
      }

      // Load encounter if reference exists
      const encounterRef = data.encounter?.reference
      if (encounterRef) {
        const encounterId = encounterRef.split('/')[1]
        try {
          const encounterData = await encounterService.getById(encounterId)
          setEncounter(encounterData)
        } catch (error) {
          console.error('Error loading encounter:', error)
        }
      }
    } catch (error) {
      console.error('Error loading service request:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!confirm('Mark this service request as completed?')) {
      return
    }

    try {
      await serviceRequestService.complete(serviceRequestId)
      loadServiceRequest() // Reload to show updated status
    } catch (error) {
      console.error('Error completing service request:', error)
      alert('Failed to complete service request. Please try again.')
    }
  }

  const handleCancel = async () => {
    if (!confirm('Cancel this service request?')) {
      return
    }

    try {
      await serviceRequestService.cancel(serviceRequestId)
      loadServiceRequest() // Reload to show updated status
    } catch (error) {
      console.error('Error canceling service request:', error)
      alert('Failed to cancel service request. Please try again.')
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
    return new Date(dateString).toLocaleString()
  }

  const getPatientName = (): string => {
    if (!patient) return 'Unknown Patient'
    const given = patient.name?.[0]?.given?.join(' ') || ''
    const family = patient.name?.[0]?.family || ''
    return `${given} ${family}`.trim() || 'Patient'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading service request...</div>
      </div>
    )
  }

  if (!serviceRequest) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Service request not found</p>
        <Link href="/servicerequests" className="text-blue-600 hover:text-blue-700">
          ← Back to Service Requests
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/servicerequests" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-flex items-center gap-1">
            <span>←</span> Back to Service Requests
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {serviceRequest.code?.text || serviceRequest.code?.coding?.[0]?.display || 'Service Request'}
          </h1>
          <p className="text-gray-600 mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(serviceRequest.status)}`}>
              {serviceRequest.status || 'Unknown'}
            </span>
            {serviceRequest.priority && (
              <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(serviceRequest.priority)}`}>
                {serviceRequest.priority.toUpperCase()}
              </span>
            )}
            {serviceRequest.intent && (
              <span className="ml-2 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {serviceRequest.intent}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {serviceRequest.status === 'active' && (
            <>
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
              >
                <span>✅</span> Mark as Completed
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2"
              >
                <span>❌</span> Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service Request Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Request Details</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Service/Test</dt>
              <dd className="text-sm text-gray-900">
                {serviceRequest.code?.text || serviceRequest.code?.coding?.[0]?.display || 'N/A'}
              </dd>
            </div>
            {serviceRequest.category && serviceRequest.category.length > 0 && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="text-sm text-gray-900">
                  {serviceRequest.category[0].text || serviceRequest.category[0].coding?.[0]?.display || 'N/A'}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="text-sm text-gray-900">
                {serviceRequest.status || 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Intent</dt>
              <dd className="text-sm text-gray-900">
                {serviceRequest.intent || 'N/A'}
              </dd>
            </div>
            {serviceRequest.priority && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Priority</dt>
                <dd className="text-sm text-gray-900">
                  {serviceRequest.priority.toUpperCase()}
                </dd>
              </div>
            )}
            {serviceRequest.occurrenceDateTime && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Scheduled</dt>
                <dd className="text-sm text-gray-900">{formatDate(serviceRequest.occurrenceDateTime)}</dd>
              </div>
            )}
            {serviceRequest.authoredOn && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Ordered</dt>
                <dd className="text-sm text-gray-900">{formatDate(serviceRequest.authoredOn)}</dd>
              </div>
            )}
            {serviceRequest.reasonCode && serviceRequest.reasonCode.length > 0 && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Reason</dt>
                <dd className="text-sm text-gray-900">
                  {serviceRequest.reasonCode[0].text || serviceRequest.reasonCode[0].coding?.[0]?.display || 'N/A'}
                </dd>
              </div>
            )}
            {serviceRequest.patientInstruction && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Patient Instructions</dt>
                <dd className="text-sm text-gray-900">{serviceRequest.patientInstruction}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Patient & Context */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient & Context</h2>
          {patient ? (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <Link
                href={`/patients/${patient.id}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {getPatientName()} →
              </Link>
              <p className="text-xs text-gray-500 mt-1">
                {patient.gender} • {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm mb-4">
              Patient: {serviceRequest.subject?.reference || 'Unknown'}
            </p>
          )}
          
          {conditions.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Related Conditions:</p>
              <div className="space-y-2">
                {conditions.map((condition) => (
                  <Link
                    key={condition.id}
                    href={`/conditions/${condition.id}`}
                    className="block p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <p className="text-sm text-blue-600 hover:text-blue-700">
                      {condition.code?.text || condition.code?.coding?.[0]?.display || 'Condition'} →
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {encounter && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <Link
                href={`/encounters/${encounter.id}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {encounter.class?.display || 'Encounter'} →
              </Link>
              <p className="text-xs text-gray-500 mt-1">
                {encounter.period?.start && formatDate(encounter.period.start)}
                {encounter.status && ` • ${encounter.status}`}
              </p>
            </div>
          )}
        </div>

        {/* Notes */}
        {serviceRequest.note && serviceRequest.note.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            <div className="space-y-3">
              {serviceRequest.note.map((note, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border-l-4 border-yellow-500">
                  <p className="text-sm text-gray-900">{note.text}</p>
                  {note.time && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(note.time)}
                      {note.authorString && ` • ${note.authorString}`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

