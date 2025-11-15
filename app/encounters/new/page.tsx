'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { encounterService } from '@/lib/services/encounter-service'
import { patientService, Patient } from '@/lib/services/patient-service'
import { getProfileId } from '@/lib/auth'

export default function NewEncounterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientIdFromQuery = searchParams.get('patientId')
  
  const [patients, setPatients] = useState<Patient[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    patientId: patientIdFromQuery || '',
    status: 'in-progress' as 'planned' | 'arrived' | 'in-progress' | 'finished',
    classCode: 'AMB',
    classDisplay: 'Ambulatory',
    type: '',
    start: new Date().toISOString().slice(0, 16),
    end: '',
    reason: '',
  })

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      const data = await patientService.search({ _count: 100 })
      setPatients(data)
      if (patientIdFromQuery && !formData.patientId) {
        setFormData(prev => ({ ...prev, patientId: patientIdFromQuery }))
      }
    } catch (error) {
      console.error('Error loading patients:', error)
    } finally {
      setLoadingPatients(false)
    }
  }

  const handleStartTimeChange = (value: string) => {
    setFormData(prev => {
      const newStart = value
      let newEnd = prev.end
      
      // Auto-calculate end time (default 30 minutes)
      if (newStart && !prev.end) {
        const startDate = new Date(newStart)
        const endDate = new Date(startDate.getTime() + 30 * 60000)
        newEnd = endDate.toISOString().slice(0, 16)
      }
      
      return { ...prev, start: newStart, end: newEnd }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const profileId = getProfileId()
      const startDate = new Date(formData.start)
      const endDate = formData.end ? new Date(formData.end) : new Date(startDate.getTime() + 30 * 60000)

      const participants = []
      
      // Add practitioner if available
      if (profileId) {
        participants.push({
          individual: {
            reference: `Practitioner/${profileId}`,
          },
          type: [{
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
              code: 'ATND',
              display: 'attending',
            }],
          }],
        })
      }

      const encounter = await encounterService.create({
        status: formData.status,
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: formData.classCode,
          display: formData.classDisplay,
        },
        type: formData.type ? [{
          text: formData.type,
          coding: [{
            system: 'http://snomed.info/sct',
            code: formData.type,
            display: formData.type,
          }],
        }] : undefined,
        subject: {
          reference: `Patient/${formData.patientId}`,
        },
        participant: participants,
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        reasonCode: formData.reason ? [{
          text: formData.reason,
        }] : undefined,
      })

      router.push(`/encounters/${encounter.id}`)
    } catch (error) {
      console.error('Error creating encounter:', error)
      alert('Failed to create encounter. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getPatientDisplayName = (patient: Patient): string => {
    const given = patient.name?.[0]?.given?.join(' ') || ''
    const family = patient.name?.[0]?.family || ''
    return `${given} ${family}`.trim() || `Patient ${patient.id?.substring(0, 8)}`
  }

  const encounterClasses = [
    { code: 'AMB', display: 'Ambulatory' },
    { code: 'EMER', display: 'Emergency' },
    { code: 'IMP', display: 'Inpatient' },
    { code: 'OBSENC', display: 'Observation Encounter' },
    { code: 'PRENC', display: 'Pre-admission' },
    { code: 'SS', display: 'Short Stay' },
    { code: 'VR', display: 'Virtual' },
  ]

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">New Encounter</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Patient *
          </label>
          {loadingPatients ? (
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
              <span className="text-gray-500 text-sm">Loading patients...</span>
            </div>
          ) : (
            <select
              required
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">Select a patient...</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {getPatientDisplayName(patient)}
                  {patient.birthDate && ` (${new Date(patient.birthDate).toLocaleDateString()})`}
                  {patient.gender && ` - ${patient.gender}`}
                </option>
              ))}
            </select>
          )}
          {patients.length === 0 && !loadingPatients && (
            <p className="mt-2 text-sm text-gray-500">
              No patients found. <a href="/patients/new" className="text-blue-600 hover:text-blue-700">Create a patient first</a>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="planned">Planned</option>
              <option value="arrived">Arrived</option>
              <option value="in-progress">In Progress</option>
              <option value="finished">Finished</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Encounter Class *
            </label>
            <select
              required
              value={formData.classCode}
              onChange={(e) => {
                const selected = encounterClasses.find(c => c.code === e.target.value)
                setFormData({
                  ...formData,
                  classCode: e.target.value,
                  classDisplay: selected?.display || ''
                })
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {encounterClasses.map((cls) => (
                <option key={cls.code} value={cls.code}>
                  {cls.display}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Encounter Type
          </label>
          <input
            type="text"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            placeholder="e.g., Routine visit, Follow-up, Consultation"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.start}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              value={formData.end}
              onChange={(e) => setFormData({ ...formData, end: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Auto-calculated from start time (30 min default)
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Visit
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            rows={3}
            placeholder="Reason for the encounter..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="flex items-center justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Creating...' : 'Create Encounter'}
          </button>
        </div>
      </form>
    </div>
  )
}

