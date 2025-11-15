'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { encounterService, Encounter } from '@/lib/services/encounter-service'
import { patientService, Patient } from '@/lib/services/patient-service'
import { observationService, Observation } from '@/lib/services/observation-service'

export default function EncounterDetailPage() {
  const params = useParams()
  const router = useRouter()
  const encounterId = params.id as string

  const [encounter, setEncounter] = useState<Encounter | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [observations, setObservations] = useState<Observation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (encounterId) {
      loadEncounter()
    }
  }, [encounterId])

  const loadEncounter = async () => {
    try {
      const data = await encounterService.getById(encounterId)
      setEncounter(data)

      // Load patient if reference exists
      const patientRef = data.subject?.reference

      if (patientRef) {
        const patientId = patientRef.split('/')[1]
        try {
          const patientData = await patientService.getById(patientId)
          setPatient(patientData)
          
          // Load observations for this encounter
          try {
            const obsData = await observationService.search({
              subject: `Patient/${patientId}`,
              _count: 20,
            })
            // Filter observations that might be related to this encounter
            setObservations(obsData)
          } catch (error) {
            console.error('Error loading observations:', error)
          }
        } catch (error) {
          console.error('Error loading patient:', error)
        }
      }
    } catch (error) {
      console.error('Error loading encounter:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = async () => {
    if (!confirm('Mark this encounter as finished?')) {
      return
    }

    try {
      await encounterService.finish(encounterId)
      loadEncounter() // Reload to show updated status
    } catch (error) {
      console.error('Error finishing encounter:', error)
      alert('Failed to finish encounter. Please try again.')
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

  const formatDateTime = (dateString?: string) => {
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
        <div className="text-gray-500">Loading encounter...</div>
      </div>
    )
  }

  if (!encounter) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Encounter not found</p>
        <Link href="/encounters" className="text-blue-600 hover:text-blue-700">
          ← Back to Encounters
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/encounters" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
            ← Back to Encounters
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {encounter.class?.display || 'Encounter'}
          </h1>
          <p className="text-gray-600 mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(encounter.status)}`}>
              {encounter.status}
            </span>
          </p>
        </div>
        {encounter.status !== 'finished' && encounter.status !== 'cancelled' && (
          <button
            onClick={handleFinish}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
          >
            Finish Encounter
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Encounter Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Encounter Details</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="text-sm text-gray-900 capitalize">{encounter.status}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Class</dt>
              <dd className="text-sm text-gray-900">{encounter.class?.display || encounter.class?.code}</dd>
            </div>
            {encounter.type && encounter.type.length > 0 && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="text-sm text-gray-900">
                  {encounter.type[0].text || encounter.type[0].coding?.[0]?.display || 'N/A'}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Start Time</dt>
              <dd className="text-sm text-gray-900">{formatDateTime(encounter.period?.start)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">End Time</dt>
              <dd className="text-sm text-gray-900">{formatDateTime(encounter.period?.end)}</dd>
            </div>
            {encounter.reasonCode && encounter.reasonCode.length > 0 && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Reason</dt>
                <dd className="text-sm text-gray-900">
                  {encounter.reasonCode[0].text || encounter.reasonCode[0].coding?.[0]?.display || 'N/A'}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Patient & Participants */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient & Participants</h2>
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
              Patient: {encounter.subject?.reference || 'Unknown'}
            </p>
          )}
          
          {encounter.participant && encounter.participant.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Participants</h3>
              <div className="space-y-2">
                {encounter.participant.map((participant, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    {participant.individual?.display || participant.individual?.reference || 'Unknown'}
                    {participant.type?.[0]?.coding?.[0]?.display && (
                      <span className="text-gray-500"> • {participant.type[0].coding[0].display}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Observations During Encounter */}
        {observations.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Observations</h2>
              {patient && (
                <Link
                  href={`/observations/new?patientId=${patient.id}&encounterId=${encounterId}`}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Add Observation
                </Link>
              )}
            </div>
            <div className="space-y-3">
              {observations.slice(0, 10).map((obs) => (
                <div key={obs.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    {obs.code?.coding?.[0]?.display || 'Observation'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {obs.valueQuantity && `${obs.valueQuantity.value} ${obs.valueQuantity.unit}`}
                    {obs.valueString && obs.valueString}
                    {obs.effectiveDateTime && ` • ${new Date(obs.effectiveDateTime).toLocaleDateString()}`}
                  </p>
                </div>
              ))}
            </div>
            {patient && (
              <Link
                href={`/observations?patientId=${patient.id}`}
                className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all observations →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

