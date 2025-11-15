'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { questionnaireService, Questionnaire } from '@/lib/services/questionnaire-service'

export default function QuestionnairesPage() {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuestionnaires()
  }, [])

  const loadQuestionnaires = async () => {
    try {
      const data = await questionnaireService.search()
      setQuestionnaires(data)
    } catch (error) {
      console.error('Error loading questionnaires:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading questionnaires...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Questionnaires</h1>
          <p className="text-gray-600 mt-2">Manage patient questionnaires</p>
        </div>
        <Link
          href="/questionnaires/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          + Create Questionnaire
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {questionnaires.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {questionnaires.map((questionnaire) => (
              <Link
                key={questionnaire.id}
                href={`/questionnaires/${questionnaire.id}`}
                className="block p-6 hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {questionnaire.title || 'Untitled Questionnaire'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {questionnaire.item?.length || 0} questions
                    </p>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      questionnaire.status === 'active' ? 'bg-green-100 text-green-800' :
                      questionnaire.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {questionnaire.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500">No questionnaires found</p>
          </div>
        )}
      </div>
    </div>
  )
}

