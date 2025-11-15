'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { carePlanService } from '@/lib/services/careplan-service'
import { patientService, Patient } from '@/lib/services/patient-service'
import { conditionService, Condition } from '@/lib/services/condition-service'
import { encounterService, Encounter } from '@/lib/services/encounter-service'
import { getProfileId } from '@/lib/auth'

export default function NewCarePlanPage() {
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
    title: '',
    description: '',
    status: 'active' as 'draft' | 'active' | 'on-hold' | 'revoked' | 'completed' | 'entered-in-error' | 'unknown',
    intent: 'plan' as 'proposal' | 'plan' | 'order' | 'option',
    category: 'assess-plan',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    goals: [{ description: '' }],
    activities: [{ description: '', status: 'not-started' as const }],
    note: '',
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

      const carePlan = await carePlanService.create({
        status: formData.status,
        intent: formData.intent,
        category: [{
          coding: [{
            system: 'http://hl7.org/fhir/us/core/CodeSystem/careplan-category',
            code: formData.category,
            display: formData.category === 'assess-plan' ? 'Assessment and Plan' : 
                     formData.category === 'assess' ? 'Assessment' : 
                     formData.category === 'plan' ? 'Plan' : 'Care Plan',
          }],
          text: formData.category,
        }],
        title: formData.title,
        description: formData.description,
        subject: {
          reference: `Patient/${formData.patientId}`,
        },
        encounter: formData.encounterId ? {
          reference: `Encounter/${formData.encounterId}`,
        } : undefined,
        addresses: formData.conditionId ? [{
          reference: `Condition/${formData.conditionId}`,
        }] : undefined,
        period: {
          start: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
          end: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        },
        created: new Date().toISOString(),
        author: profileId ? {
          reference: `Practitioner/${profileId}`,
        } : undefined,
        goal: [], // Goals should be references to Goal resources, but we'll store descriptions in notes instead
        activity: formData.activities.filter(a => a.description.trim()).map((activity, index) => ({
          id: `activity-${index}`,
          detail: {
            kind: 'Task',
            code: {
              text: activity.description,
            },
            status: activity.status,
            description: activity.description,
          },
        })),
        note: [
          // Store goals as notes
          ...formData.goals.filter(g => g.description.trim()).map((goal, index) => ({
            text: `Goal ${index + 1}: ${goal.description}`,
            time: new Date().toISOString(),
          })),
          // Store additional notes if provided
          ...(formData.note ? [{
            text: formData.note,
            time: new Date().toISOString(),
          }] : []),
        ],
      })

      router.push(`/careplans/${carePlan.id}`)
    } catch (error) {
      console.error('Error creating care plan:', error)
      alert('Failed to create care plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const addGoal = () => {
    setFormData({
      ...formData,
      goals: [...formData.goals, { description: '' }],
    })
  }

  const removeGoal = (index: number) => {
    setFormData({
      ...formData,
      goals: formData.goals.filter((_, i) => i !== index),
    })
  }

  const updateGoal = (index: number, description: string) => {
    const newGoals = [...formData.goals]
    newGoals[index].description = description
    setFormData({ ...formData, goals: newGoals })
  }

  const addActivity = () => {
    setFormData({
      ...formData,
      activities: [...formData.activities, { description: '', status: 'not-started' }],
    })
  }

  const removeActivity = (index: number) => {
    setFormData({
      ...formData,
      activities: formData.activities.filter((_, i) => i !== index),
    })
  }

  const updateActivity = (index: number, field: 'description' | 'status', value: string) => {
    const newActivities = [...formData.activities]
    newActivities[index][field] = value as any
    setFormData({ ...formData, activities: newActivities })
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
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Care Plan</h1>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Diabetes Management Plan"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
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
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="Describe the care plan..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
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
              <option value="proposal">Proposal</option>
              <option value="plan">Plan</option>
              <option value="order">Order</option>
              <option value="option">Option</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="assess-plan">Assessment and Plan</option>
              <option value="assess">Assessment</option>
              <option value="plan">Plan</option>
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
              Start Date *
            </label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for ongoing care plans
            </p>
          </div>
        </div>

        {/* Goals */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Care Goals
            </label>
            <button
              type="button"
              onClick={addGoal}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add Goal
            </button>
          </div>
          <div className="space-y-3">
            {formData.goals.map((goal, index) => (
              <div key={index} className="flex items-start gap-2">
                <input
                  type="text"
                  value={goal.description}
                  onChange={(e) => updateGoal(index, e.target.value)}
                  placeholder={`Goal ${index + 1}`}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                {formData.goals.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeGoal(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Activities */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Activities/Tasks
            </label>
            <button
              type="button"
              onClick={addActivity}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add Activity
            </button>
          </div>
          <div className="space-y-3">
            {formData.activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-2">
                <input
                  type="text"
                  value={activity.description}
                  onChange={(e) => updateActivity(index, 'description', e.target.value)}
                  placeholder={`Activity ${index + 1}`}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <select
                  value={activity.status}
                  onChange={(e) => updateActivity(index, 'status', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="not-started">Not Started</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in-progress">In Progress</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
                {formData.activities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeActivity(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
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
            placeholder="Additional notes about this care plan..."
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
            {loading ? 'Creating...' : 'Create Care Plan'}
          </button>
        </div>
      </form>
    </div>
  )
}

