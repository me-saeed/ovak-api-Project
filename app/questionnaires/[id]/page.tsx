'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { questionnaireService, Questionnaire, QuestionnaireResponse } from '@/lib/services/questionnaire-service'

export default function QuestionnaireDetailPage() {
  const params = useParams()
  const router = useRouter()
  const questionnaireId = params.id as string

  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null)
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (questionnaireId) {
      loadQuestionnaire()
      loadResponses()
    }
  }, [questionnaireId])

  const loadQuestionnaire = async () => {
    try {
      const data = await questionnaireService.getById(questionnaireId)
      setQuestionnaire(data)
    } catch (error) {
      console.error('Error loading questionnaire:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadResponses = async () => {
    try {
      const data = await questionnaireService.getResponses(questionnaireId)
      setResponses(data)
    } catch (error) {
      console.error('Error loading responses:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading questionnaire...</div>
      </div>
    )
  }

  if (!questionnaire) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Questionnaire not found</p>
        <Link href="/questionnaires" className="text-blue-600 hover:text-blue-700">
          ← Back to Questionnaires
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/questionnaires" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
            ← Back to Questionnaires
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{questionnaire.title || 'Untitled Questionnaire'}</h1>
          <p className="text-gray-600 mt-2">
            {questionnaire.item?.length || 0} questions • Status: {questionnaire.status}
          </p>
        </div>
        <Link
          href={`/questionnaires/${questionnaireId}/assign`}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Assign to Patient
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Questions Preview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Questions</h2>
          {questionnaire.item && questionnaire.item.length > 0 ? (
            <div className="space-y-4">
              {questionnaire.item.map((item, index) => (
                <div key={item.linkId} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {index + 1}. {item.text}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Type: {item.type} {item.required && '• Required'}
                      </p>
                      {item.answerOption && item.answerOption.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {item.answerOption.map((opt, optIndex) => (
                            <p key={optIndex} className="text-sm text-gray-600">
                              • {opt.valueString || opt.valueCoding?.display}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No questions defined</p>
          )}
        </div>

        {/* Responses */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Responses ({responses.length})</h2>
          {responses.length > 0 ? (
            <div className="space-y-3">
              {responses.map((response) => (
                <Link
                  key={response.id}
                  href={`/questionnaires/${questionnaireId}/responses/${response.id}`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Patient: {response.subject?.reference?.split('/')[1] || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Status: {response.status} • {response.id?.substring(0, 8)}
                      </p>
                    </div>
                    <span className="text-blue-600">→</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No responses yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

