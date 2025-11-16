'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { questionnaireService, Questionnaire } from '@/lib/services/questionnaire-service'
import { patientService, Patient } from '@/lib/services/patient-service'

export default function AssignQuestionnairePage() {
  const params = useParams()
  const router = useRouter()
  const questionnaireId = params.id as string

  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (questionnaireId) {
      loadData()
    }
  }, [questionnaireId])

  const loadData = async () => {
    try {
      const [questionnaireData, patientsData] = await Promise.all([
        questionnaireService.getById(questionnaireId),
        patientService.search({ _count: 100 }),
      ])
      setQuestionnaire(questionnaireData)
      setPatients(patientsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedPatientId) {
      alert('Please select a patient')
      return
    }

    setSubmitting(true)

    try {
      // Navigate to response page where patient can fill it out
      router.push(`/questionnaires/${questionnaireId}/respond?patientId=${selectedPatientId}`)
    } catch (error) {
      console.error('Error assigning questionnaire:', error)
      alert('Failed to assign questionnaire. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getPatientDisplayName = (patient: Patient): string => {
    const given = patient.name?.[0]?.given?.join(' ') || ''
    const family = patient.name?.[0]?.family || ''
    return `${given} ${family}`.trim() || `Patient ${patient.id?.substring(0, 8)}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!questionnaire) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Questionnaire not found</p>
        <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-700">
          ← Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Assign Questionnaire</h1>
      <p className="text-gray-600 mb-6">
        Assign &quot;{questionnaire.title || 'Untitled Questionnaire'}&quot; to a patient
      </p>

      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Patient *
          </label>
          {patients.length > 0 ? (
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Choose a patient...</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {getPatientDisplayName(patient)}
                  {patient.birthDate && ` (${new Date(patient.birthDate).toLocaleDateString()})`}
                  {patient.gender && ` - ${patient.gender}`}
                </option>
              ))}
            </select>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                No patients found. <a href="/patients/new" className="text-blue-600 hover:text-blue-700 underline">Create a patient first</a>
              </p>
            </div>
          )}
        </div>

        {questionnaire.item && questionnaire.item.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Questionnaire Preview</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {questionnaire.item.slice(0, 3).map((item, index) => (
                <p key={item.linkId} className="text-sm text-gray-600">
                  {index + 1}. {item.text}
                </p>
              ))}
              {questionnaire.item.length > 3 && (
                <p className="text-sm text-gray-500 italic">
                  ... and {questionnaire.item.length - 3} more questions
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={submitting || !selectedPatientId}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {submitting ? 'Assigning...' : 'Continue to Response Form'}
          </button>
        </div>
      </div>
    </div>
  )
}

