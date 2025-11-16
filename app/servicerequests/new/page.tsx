'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { serviceRequestService } from '@/lib/services/servicerequest-service'
import { patientService, Patient } from '@/lib/services/patient-service'
import { encounterService, Encounter } from '@/lib/services/encounter-service'
import { conditionService, Condition } from '@/lib/services/condition-service'
import { getProfileId } from '@/lib/auth'

export default function NewServiceRequestPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientIdFromQuery = searchParams.get('patientId')
  const conditionIdFromQuery = searchParams.get('conditionId')
  
  const [patients, setPatients] = useState<Patient[]>([])
  const [conditions, setConditions] = useState<Condition[]>([])
  const [encounters, setEncounters] = useState<Encounter[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    patientId: patientIdFromQuery || '',
    conditionId: conditionIdFromQuery || '',
    encounterId: '',
    serviceName: '',
    serviceCode: '',
    category: 'procedure',
    status: 'active' as 'draft' | 'active' | 'on-hold' | 'revoked' | 'completed' | 'entered-in-error' | 'unknown',
    intent: 'order' as 'proposal' | 'plan' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option',
    priority: 'routine' as 'routine' | 'urgent' | 'asap' | 'stat',
    scheduledDate: '',
    scheduledTime: '',
    reason: '',
    note: '',
    patientInstruction: '',
  })

  useEffect(() => {
    loadPatients()
    if (patientIdFromQuery) {
      loadConditions(patientIdFromQuery)
      loadEncounters(patientIdFromQuery)
    }
  }, [])

  useEffect(() => {
    if (formData.patientId) {
      loadConditions(formData.patientId)
      loadEncounters(formData.patientId)
    } else {
      setConditions([])
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

  const loadConditions = async (patientId: string) => {
    try {
      const data = await conditionService.getByPatient(patientId)
      setConditions(data)
      if (conditionIdFromQuery && !formData.conditionId) {
        setFormData(prev => ({ ...prev, conditionId: conditionIdFromQuery }))
      }
    } catch (error) {
      console.error('Error loading conditions:', error)
    }
  }

  const loadEncounters = async (patientId: string) => {
    try {
      const data = await encounterService.getByPatient(patientId)
      setEncounters(data)
    } catch (error) {
      console.error('Error loading encounters:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const profileId = getProfileId()

      // Combine date and time if both are provided
      let occurrenceDateTime: string | undefined
      if (formData.scheduledDate) {
        if (formData.scheduledTime) {
          occurrenceDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString()
        } else {
          occurrenceDateTime = new Date(`${formData.scheduledDate}T00:00:00`).toISOString()
        }
      }

      const serviceRequest = await serviceRequestService.create({
        status: formData.status,
        intent: formData.intent,
        category: [{
          coding: [{
            system: 'http://snomed.info/sct',
            code: formData.category,
            display: formData.category === 'procedure' ? 'Procedure' : 
                     formData.category === 'laboratory' ? 'Laboratory Test' : 
                     formData.category === 'imaging' ? 'Imaging' : 
                     formData.category === 'referral' ? 'Referral' : 'Service',
          }],
          text: formData.category,
        }],
        priority: formData.priority,
        code: {
          text: formData.serviceName,
          coding: formData.serviceCode ? [{
            system: 'http://snomed.info/sct',
            code: formData.serviceCode,
            display: formData.serviceName,
          }] : undefined,
        },
        subject: {
          reference: `Patient/${formData.patientId}`,
        },
        encounter: formData.encounterId ? {
          reference: `Encounter/${formData.encounterId}`,
        } : undefined,
        occurrenceDateTime: occurrenceDateTime,
        authoredOn: new Date().toISOString(),
        requester: profileId ? {
          reference: `Practitioner/${profileId}`,
        } : undefined,
        reasonCode: formData.reason ? [{
          text: formData.reason,
        }] : undefined,
        reasonReference: formData.conditionId ? [{
          reference: `Condition/${formData.conditionId}`,
        }] : undefined,
        note: formData.note ? [{
          text: formData.note,
          time: new Date().toISOString(),
        }] : undefined,
        patientInstruction: formData.patientInstruction || undefined,
      })

      router.push(`/servicerequests/${serviceRequest.id}`)
    } catch (error) {
      console.error('Error creating service request:', error)
      alert('Failed to create service request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getPatientDisplayName = (patient: Patient): string => {
    const given = patient.name?.[0]?.given?.join(' ') || ''
    const family = patient.name?.[0]?.family || ''
    return `${given} ${family}`.trim() || `Patient ${patient.id?.substring(0, 8)}`
  }

  const getConditionDisplay = (condition: Condition): string => {
    return condition.code?.text || condition.code?.coding?.[0]?.display || 'Condition'
  }

  const getEncounterDisplay = (encounter: Encounter): string => {
    const date = encounter.period?.start ? new Date(encounter.period.start).toLocaleDateString() : ''
    return `${encounter.class?.display || 'Encounter'} ${date ? `(${date})` : ''}`
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Service Request</h1>

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
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value, conditionId: '', encounterId: '' })}
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service/Test Name *
          </label>
          <input
            type="text"
            required
            value={formData.serviceName}
            onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
            placeholder="e.g., Complete Blood Count, X-Ray Chest, Cardiology Consultation"
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
              <option value="procedure">Procedure</option>
              <option value="laboratory">Laboratory Test</option>
              <option value="imaging">Imaging</option>
              <option value="referral">Referral</option>
              <option value="consultation">Consultation</option>
            </select>
          </div>

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
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intent *
            </label>
            <select
              required
              value={formData.intent}
              onChange={(e) => setFormData({ ...formData, intent: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="order">Order</option>
              <option value="plan">Plan</option>
              <option value="proposal">Proposal</option>
              <option value="original-order">Original Order</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority *
            </label>
            <select
              required
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="asap">ASAP</option>
              <option value="stat">STAT</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Related Condition (Optional)
          </label>
          {formData.patientId ? (
            <select
              value={formData.conditionId}
              onChange={(e) => setFormData({ ...formData, conditionId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">No condition</option>
              {conditions.map((condition) => (
                <option key={condition.id} value={condition.id}>
                  {getConditionDisplay(condition)}
                  {condition.clinicalStatus?.coding?.[0]?.code === 'active' && ' (Active)'}
                </option>
              ))}
            </select>
          ) : (
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
              <span className="text-gray-500 text-sm">Select a patient first</span>
            </div>
          )}
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
              Scheduled Date
            </label>
            <input
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scheduled Time
            </label>
            <input
              type="time"
              value={formData.scheduledTime}
              onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional - leave empty if not scheduled
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason/Indication
          </label>
          <input
            type="text"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Reason for this service request..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Patient Instructions
          </label>
          <textarea
            value={formData.patientInstruction}
            onChange={(e) => setFormData({ ...formData, patientInstruction: e.target.value })}
            rows={2}
            placeholder="Instructions for the patient (e.g., fasting required, bring previous reports)..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            rows={3}
            placeholder="Additional notes about this service request..."
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
            <span>📋</span>
            {loading ? 'Creating...' : 'Create Service Request'}
          </button>
        </div>
      </form>
    </div>
  )
}

