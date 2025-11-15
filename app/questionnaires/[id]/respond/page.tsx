'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { questionnaireService, Questionnaire } from '@/lib/services/questionnaire-service'
import { patientService, Patient } from '@/lib/services/patient-service'

export default function RespondQuestionnairePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const questionnaireId = params.id as string
  const patientId = searchParams.get('patientId')

  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (questionnaireId && patientId) {
      loadData()
    }
  }, [questionnaireId, patientId])

  const loadData = async () => {
    try {
      const [questionnaireData, patientData] = await Promise.all([
        questionnaireService.getById(questionnaireId),
        patientService.getById(patientId!),
      ])
      setQuestionnaire(questionnaireData)
      setPatient(patientData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (linkId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [linkId]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const answerArray = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value,
      }))

      await questionnaireService.submitResponse(questionnaireId, patientId!, answerArray)

      router.push(`/patients/${patientId}`)
    } catch (error) {
      console.error('Error submitting response:', error)
      alert('Failed to submit response. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getPatientName = (): string => {
    if (!patient) return 'Patient'
    const given = patient.name?.[0]?.given?.join(' ') || ''
    const family = patient.name?.[0]?.family || ''
    return `${given} ${family}`.trim() || 'Patient'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading questionnaire...</div>
      </div>
    )
  }

  if (!questionnaire || !patient) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Questionnaire or patient not found</p>
        <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-700">
          ← Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{questionnaire.title || 'Questionnaire'}</h1>
        <p className="text-gray-600 mt-2">Patient: {getPatientName()}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {questionnaire.item && questionnaire.item.length > 0 ? (
          questionnaire.item.map((item, index) => (
            <div key={item.linkId} className="border-b border-gray-200 pb-6 last:border-b-0">
              <label className="block text-lg font-medium text-gray-900 mb-3">
                {index + 1}. {item.text}
                {item.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {item.type === 'string' && (
                <input
                  type="text"
                  required={item.required}
                  value={answers[item.linkId] || ''}
                  onChange={(e) => handleAnswerChange(item.linkId, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter your answer..."
                />
              )}

              {item.type === 'choice' && item.answerOption && (
                <div className="space-y-2">
                  {item.answerOption.map((opt, optIndex) => {
                    const optionValue = opt.valueString || opt.valueCoding?.display || ''
                    return (
                      <label key={optIndex} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name={item.linkId}
                          required={item.required}
                          value={optionValue}
                          checked={answers[item.linkId] === optionValue}
                          onChange={(e) => handleAnswerChange(item.linkId, e.target.value)}
                          className="mr-3"
                        />
                        <span>{optionValue}</span>
                      </label>
                    )
                  })}
                </div>
              )}

              {item.type === 'boolean' && (
                <div className="flex space-x-4">
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name={item.linkId}
                      required={item.required}
                      value="true"
                      checked={answers[item.linkId] === 'true'}
                      onChange={(e) => handleAnswerChange(item.linkId, e.target.value)}
                      className="mr-3"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name={item.linkId}
                      required={item.required}
                      value="false"
                      checked={answers[item.linkId] === 'false'}
                      onChange={(e) => handleAnswerChange(item.linkId, e.target.value)}
                      className="mr-3"
                    />
                    <span>No</span>
                  </label>
                </div>
              )}

              {item.type === 'date' && (
                <input
                  type="date"
                  required={item.required}
                  value={answers[item.linkId] || ''}
                  onChange={(e) => handleAnswerChange(item.linkId, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              )}

              {(item.type === 'integer' || item.type === 'decimal') && (
                <input
                  type="number"
                  step={item.type === 'decimal' ? '0.01' : '1'}
                  required={item.required}
                  value={answers[item.linkId] || ''}
                  onChange={(e) => handleAnswerChange(item.linkId, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter a number..."
                />
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No questions in this questionnaire</p>
        )}

        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {submitting ? 'Submitting...' : 'Submit Response'}
          </button>
        </div>
      </form>
    </div>
  )
}

