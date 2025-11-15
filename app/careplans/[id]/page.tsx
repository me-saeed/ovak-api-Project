'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { carePlanService, CarePlan } from '@/lib/services/careplan-service'
import { patientService, Patient } from '@/lib/services/patient-service'
import { conditionService, Condition } from '@/lib/services/condition-service'
import { encounterService, Encounter } from '@/lib/services/encounter-service'

export default function CarePlanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const carePlanId = params.id as string

  const [carePlan, setCarePlan] = useState<CarePlan | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [conditions, setConditions] = useState<Condition[]>([])
  const [encounter, setEncounter] = useState<Encounter | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (carePlanId) {
      loadCarePlan()
    }
  }, [carePlanId])

  const loadCarePlan = async () => {
    try {
      const data = await carePlanService.getById(carePlanId)
      setCarePlan(data)

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
      if (data.addresses && data.addresses.length > 0) {
        const conditionPromises = data.addresses
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
      console.error('Error loading care plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!confirm('Mark this care plan as completed?')) {
      return
    }

    try {
      await carePlanService.complete(carePlanId)
      loadCarePlan() // Reload to show updated status
    } catch (error) {
      console.error('Error completing care plan:', error)
      alert('Failed to complete care plan. Please try again.')
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

  const getActivityStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'scheduled':
        return 'bg-purple-100 text-purple-800'
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
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
        <div className="text-gray-500">Loading care plan...</div>
      </div>
    )
  }

  if (!carePlan) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Care plan not found</p>
        <Link href="/careplans" className="text-blue-600 hover:text-blue-700">
          ← Back to Care Plans
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/careplans" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-flex items-center gap-1">
            <span>←</span> Back to Care Plans
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {carePlan.title || 'Untitled Care Plan'}
          </h1>
          <p className="text-gray-600 mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(carePlan.status)}`}>
              {carePlan.status || 'Unknown'}
            </span>
            <span className="ml-2 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {carePlan.intent || 'Unknown'}
            </span>
          </p>
        </div>
        {carePlan.status === 'active' && (
          <button
            onClick={handleComplete}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
          >
            <span>✅</span> Mark as Completed
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Care Plan Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Care Plan Details</h2>
          <dl className="space-y-3">
            {carePlan.description && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="text-sm text-gray-900 mt-1">{carePlan.description}</dd>
              </div>
            )}
            {carePlan.category && carePlan.category.length > 0 && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="text-sm text-gray-900">
                  {carePlan.category[0].text || carePlan.category[0].coding?.[0]?.display || 'N/A'}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="text-sm text-gray-900">
                {carePlan.status || 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Intent</dt>
              <dd className="text-sm text-gray-900">
                {carePlan.intent || 'N/A'}
              </dd>
            </div>
            {carePlan.period?.start && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                <dd className="text-sm text-gray-900">{formatDate(carePlan.period.start)}</dd>
              </div>
            )}
            {carePlan.period?.end && (
              <div>
                <dt className="text-sm font-medium text-gray-500">End Date</dt>
                <dd className="text-sm text-gray-900">{formatDate(carePlan.period.end)}</dd>
              </div>
            )}
            {carePlan.created && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="text-sm text-gray-900">{formatDate(carePlan.created)}</dd>
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
              Patient: {carePlan.subject?.reference || 'Unknown'}
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

        {/* Goals - Extract from notes (stored as "Goal 1: ...", "Goal 2: ...") */}
        {carePlan.note && (() => {
          const goalNotes = carePlan.note.filter(note => 
            note.text && note.text.match(/^Goal \d+:/i)
          )
          return goalNotes.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Care Goals</h2>
              <div className="space-y-3">
                {goalNotes.map((note, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-gray-900">
                      {note.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null
        })()}

        {/* Activities */}
        {carePlan.activity && carePlan.activity.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Activities & Tasks</h2>
            <div className="space-y-3">
              {carePlan.activity.map((activity, index) => {
                const status = activity.detail?.status || 'unknown'
                return (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {activity.detail?.description || activity.detail?.code?.text || `Activity ${index + 1}`}
                        </p>
                        {activity.detail?.code?.coding?.[0]?.display && (
                          <p className="text-xs text-gray-500 mb-2">
                            Type: {activity.detail.code.coding[0].display}
                          </p>
                        )}
                        {activity.detail?.scheduledPeriod && (
                          <p className="text-xs text-gray-500">
                            Scheduled: {formatDate(activity.detail.scheduledPeriod.start)}
                            {activity.detail.scheduledPeriod.end && ` - ${formatDate(activity.detail.scheduledPeriod.end)}`}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActivityStatusColor(status)}`}>
                        {status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Notes - Exclude goal notes (they're shown in Goals section) */}
        {carePlan.note && (() => {
          const regularNotes = carePlan.note.filter(note => 
            !note.text || !note.text.match(/^Goal \d+:/i)
          )
          return regularNotes.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <div className="space-y-3">
                {regularNotes.map((note, index) => (
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
          ) : null
        })()}
      </div>
    </div>
  )
}

