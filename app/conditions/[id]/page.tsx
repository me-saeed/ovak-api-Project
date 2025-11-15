'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { conditionService, Condition } from '@/lib/services/condition-service'
import { patientService, Patient } from '@/lib/services/patient-service'
import { encounterService, Encounter } from '@/lib/services/encounter-service'

export default function ConditionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const conditionId = params.id as string

  const [condition, setCondition] = useState<Condition | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [encounter, setEncounter] = useState<Encounter | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (conditionId) {
      loadCondition()
    }
  }, [conditionId])

  const loadCondition = async () => {
    try {
      const data = await conditionService.getById(conditionId)
      setCondition(data)

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
      console.error('Error loading condition:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async () => {
    if (!confirm('Mark this condition as resolved?')) {
      return
    }

    try {
      await conditionService.resolve(conditionId)
      loadCondition() // Reload to show updated status
    } catch (error) {
      console.error('Error resolving condition:', error)
      alert('Failed to resolve condition. Please try again.')
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
        <div className="text-gray-500">Loading condition...</div>
      </div>
    )
  }

  if (!condition) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Condition not found</p>
        <Link href="/conditions" className="text-blue-600 hover:text-blue-700">
          ← Back to Conditions
        </Link>
      </div>
    )
  }

  const status = condition.clinicalStatus?.coding?.[0]?.code || condition.clinicalStatus?.text || 'unknown'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/conditions" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-flex items-center gap-1">
            <span>←</span> Back to Conditions
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {condition.code?.text || condition.code?.coding?.[0]?.display || 'Condition'}
          </h1>
          <p className="text-gray-600 mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
              {condition.clinicalStatus?.coding?.[0]?.display || condition.clinicalStatus?.text || 'Unknown'}
            </span>
            {condition.severity && (
              <span className="ml-2 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                {condition.severity.coding?.[0]?.display || condition.severity.text}
              </span>
            )}
          </p>
        </div>
        {status === 'active' && (
          <button
            onClick={handleResolve}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
          >
            <span>✅</span> Mark as Resolved
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Condition Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Condition Details</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Diagnosis</dt>
              <dd className="text-sm text-gray-900">
                {condition.code?.text || condition.code?.coding?.[0]?.display || 'N/A'}
              </dd>
            </div>
            {condition.category && condition.category.length > 0 && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="text-sm text-gray-900">
                  {condition.category[0].text || condition.category[0].coding?.[0]?.display || 'N/A'}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Clinical Status</dt>
              <dd className="text-sm text-gray-900">
                {condition.clinicalStatus?.coding?.[0]?.display || condition.clinicalStatus?.text || 'N/A'}
              </dd>
            </div>
            {condition.verificationStatus && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Verification Status</dt>
                <dd className="text-sm text-gray-900">
                  {condition.verificationStatus.coding?.[0]?.display || condition.verificationStatus.text || 'N/A'}
                </dd>
              </div>
            )}
            {condition.severity && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Severity</dt>
                <dd className="text-sm text-gray-900">
                  {condition.severity.coding?.[0]?.display || condition.severity.text || 'N/A'}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Onset Date</dt>
              <dd className="text-sm text-gray-900">{formatDate(condition.onsetDateTime)}</dd>
            </div>
            {condition.abatementDateTime && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Resolved Date</dt>
                <dd className="text-sm text-gray-900">{formatDate(condition.abatementDateTime)}</dd>
              </div>
            )}
            {condition.recordedDate && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Recorded Date</dt>
                <dd className="text-sm text-gray-900">{formatDate(condition.recordedDate)}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Patient & Encounter */}
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
              Patient: {condition.subject?.reference || 'Unknown'}
            </p>
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
        {condition.note && condition.note.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            <div className="space-y-3">
              {condition.note.map((note, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
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

