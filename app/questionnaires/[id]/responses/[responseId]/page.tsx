'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { questionnaireService, Questionnaire, QuestionnaireResponse } from '@/lib/services/questionnaire-service'
import { patientService, Patient } from '@/lib/services/patient-service'
import apiClient from '@/lib/api-client'

export default function QuestionnaireResponsePage() {
  const params = useParams()
  const router = useRouter()
  const questionnaireId = params.id as string
  const responseId = params.responseId as string

  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null)
  const [response, setResponse] = useState<QuestionnaireResponse | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (questionnaireId && responseId) {
      loadData()
    }
  }, [questionnaireId, responseId])

  const loadData = async () => {
    try {
      // Load questionnaire response
      const responseData = await apiClient.get(`/fhir/QuestionnaireResponse/${responseId}`)
      const responseResource = responseData.data
      setResponse(responseResource)

      // Load questionnaire
      const questionnaireData = await questionnaireService.getById(questionnaireId)
      setQuestionnaire(questionnaireData)

      // Load patient if subject reference exists
      if (responseResource.subject?.reference) {
        const patientId = responseResource.subject.reference.split('/')[1]
        try {
          const patientData = await patientService.getById(patientId)
          setPatient(patientData)
        } catch (error) {
          console.error('Error loading patient:', error)
        }
      }
    } catch (error) {
      console.error('Error loading response:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPatientName = (): string => {
    if (!patient) return 'Unknown Patient'
    const given = patient.name?.[0]?.given?.join(' ') || ''
    const family = patient.name?.[0]?.family || ''
    return `${given} ${family}`.trim() || 'Patient'
  }

  const getQuestionText = (linkId: string): string => {
    if (!questionnaire?.item) return linkId
    const question = questionnaire.item.find((item) => item.linkId === linkId)
    return question?.text || linkId
  }

  const getAnswerDisplay = (answer: any): string => {
    if (answer.valueString) return answer.valueString
    if (answer.valueCoding?.display) return answer.valueCoding.display
    if (answer.valueCoding?.code) return answer.valueCoding.code
    if (answer.valueBoolean !== undefined) return answer.valueBoolean ? 'Yes' : 'No'
    if (answer.valueDate) return new Date(answer.valueDate).toLocaleDateString()
    if (answer.valueInteger !== undefined) return answer.valueInteger.toString()
    if (answer.valueDecimal !== undefined) return answer.valueDecimal.toString()
    return 'N/A'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading response...</div>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Response not found</p>
        <Link href={`/questionnaires/${questionnaireId}`} className="text-blue-600 hover:text-blue-700">
          ← Back to Questionnaire
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/questionnaires/${questionnaireId}`}
          className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block"
        >
          ← Back to Questionnaire
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Questionnaire Response</h1>
        <p className="text-gray-600 mt-2">
          {questionnaire?.title || 'Questionnaire'} • {getPatientName()}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b">
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  response.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : response.status === 'in-progress'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {response.status}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Patient</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {patient ? (
                <Link
                  href={`/patients/${patient.id}`}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {getPatientName()} →
                </Link>
              ) : (
                response.subject?.reference || 'Unknown'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Response ID</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono">{response.id}</dd>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-4">Answers</h2>
        {response.item && response.item.length > 0 ? (
          <div className="space-y-4">
            {response.item.map((item, index) => (
              <div key={item.linkId} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {index + 1}. {getQuestionText(item.linkId)}
                    </p>
                    {item.answer && item.answer.length > 0 ? (
                      <div className="mt-2 space-y-1">
                        {item.answer.map((answer, ansIndex) => (
                          <p key={ansIndex} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            {getAnswerDisplay(answer)}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic mt-2">No answer provided</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No answers in this response</p>
        )}
      </div>
    </div>
  )
}

