'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { conditionService } from '@/lib/services/condition-service'
import { patientService, Patient } from '@/lib/services/patient-service'
import { encounterService, Encounter } from '@/lib/services/encounter-service'
import { getProfileId } from '@/lib/auth'

export default function NewConditionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientIdFromQuery = searchParams.get('patientId')
  const encounterIdFromQuery = searchParams.get('encounterId')
  
  const [patients, setPatients] = useState<Patient[]>([])
  const [encounters, setEncounters] = useState<Encounter[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    patientId: patientIdFromQuery || '',
    encounterId: encounterIdFromQuery || '',
    conditionName: '',
    code: '',
    category: 'problem-list-item',
    clinicalStatus: 'active',
    severity: '',
    onsetDate: new Date().toISOString().slice(0, 10),
    abatementDate: '',
    note: '',
  })

  useEffect(() => {
    loadPatients()
    if (patientIdFromQuery) {
      loadEncounters(patientIdFromQuery)
    }
  }, [])

  useEffect(() => {
    if (formData.patientId) {
      loadEncounters(formData.patientId)
    } else {
      setEncounters([])
    }
  }, [formData.patientId])

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

  const loadEncounters = async (patientId: string) => {
    try {
      const data = await encounterService.getByPatient(patientId)
      setEncounters(data)
      if (encounterIdFromQuery && !formData.encounterId) {
        setFormData(prev => ({ ...prev, encounterId: encounterIdFromQuery }))
      }
    } catch (error) {
      console.error('Error loading encounters:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const profileId = getProfileId()

      const condition = await conditionService.create({
        code: {
          text: formData.conditionName,
          coding: formData.code ? [{
            system: 'http://snomed.info/sct',
            code: formData.code,
            display: formData.conditionName,
          }] : undefined,
        },
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/condition-category',
            code: formData.category,
            display: formData.category === 'problem-list-item' ? 'Problem List Item' : 
                     formData.category === 'encounter-diagnosis' ? 'Encounter Diagnosis' : 
                     'Condition',
          }],
          text: formData.category,
        }],
        clinicalStatus: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: formData.clinicalStatus,
            display: formData.clinicalStatus.charAt(0).toUpperCase() + formData.clinicalStatus.slice(1),
          }],
          text: formData.clinicalStatus,
        },
        severity: formData.severity ? {
          coding: [{
            system: 'http://snomed.info/sct',
            code: formData.severity,
            display: formData.severity,
          }],
          text: formData.severity,
        } : undefined,
        subject: {
          reference: `Patient/${formData.patientId}`,
        },
        encounter: formData.encounterId ? {
          reference: `Encounter/${formData.encounterId}`,
        } : undefined,
        onsetDateTime: formData.onsetDate ? new Date(formData.onsetDate).toISOString() : undefined,
        abatementDateTime: formData.abatementDate ? new Date(formData.abatementDate).toISOString() : undefined,
        recordedDate: new Date().toISOString(),
        recorder: profileId ? {
          reference: `Practitioner/${profileId}`,
        } : undefined,
        note: formData.note ? [{
          text: formData.note,
          time: new Date().toISOString(),
        }] : undefined,
      })

      router.push(`/conditions/${condition.id}`)
    } catch (error) {
      console.error('Error creating condition:', error)
      alert('Failed to create condition. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getPatientDisplayName = (patient: Patient): string => {
    const given = patient.name?.[0]?.given?.join(' ') || ''
    const family = patient.name?.[0]?.family || ''
    return `${given} ${family}`.trim() || `Patient ${patient.id?.substring(0, 8)}`
  }

  const getEncounterDisplay = (encounter: Encounter): string => {
    const date = encounter.period?.start ? new Date(encounter.period.start).toLocaleDateString() : ''
    return `${encounter.class?.display || 'Encounter'} ${date ? `(${date})` : ''}`
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Record Condition</h1>

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
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value, encounterId: '' })}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Condition/Diagnosis *
          </label>
          <input
            type="text"
            required
            value={formData.conditionName}
            onChange={(e) => setFormData({ ...formData, conditionName: e.target.value })}
            placeholder="e.g., Type 2 Diabetes, Hypertension, Asthma"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="problem-list-item">Problem List Item</option>
              <option value="encounter-diagnosis">Encounter Diagnosis</option>
              <option value="health-concern">Health Concern</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clinical Status *
            </label>
            <select
              required
              value={formData.clinicalStatus}
              onChange={(e) => setFormData({ ...formData, clinicalStatus: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
              <option value="remission">Remission</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Severity
          </label>
          <select
            value={formData.severity}
            onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Not specified</option>
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Related Encounter (Optional)
          </label>
          {formData.patientId ? (
            <select
              value={formData.encounterId}
              onChange={(e) => setFormData({ ...formData, encounterId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">No encounter</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {getEncounterDisplay(encounter)}
                </option>
              ))}
            </select>
          ) : (
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
              <span className="text-gray-500 text-sm">Select a patient first</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Onset Date *
            </label>
            <input
              type="date"
              required
              value={formData.onsetDate}
              onChange={(e) => setFormData({ ...formData, onsetDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resolved Date
            </label>
            <input
              type="date"
              value={formData.abatementDate}
              onChange={(e) => setFormData({ ...formData, abatementDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty if condition is still active
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            rows={3}
            placeholder="Additional notes about this condition..."
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
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
          >
            <span>💊</span>
            {loading ? 'Recording...' : 'Record Condition'}
          </button>
        </div>
      </form>
    </div>
  )
}

