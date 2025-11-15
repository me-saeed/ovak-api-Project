'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { questionnaireService, Questionnaire } from '@/lib/services/questionnaire-service'

interface Question {
  linkId: string
  text: string
  type: 'string' | 'choice' | 'boolean' | 'date' | 'integer' | 'decimal'
  required: boolean
  options?: string[]
}

export default function NewQuestionnairePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<'draft' | 'active'>('draft')
  const [questions, setQuestions] = useState<Question[]>([
    {
      linkId: 'q1',
      text: '',
      type: 'string',
      required: false,
    },
  ])

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        linkId: `q${questions.length + 1}`,
        text: '',
        type: 'string',
        required: false,
      },
    ])
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], ...updates }
    setQuestions(updated)
  }

  const addOption = (questionIndex: number) => {
    const updated = [...questions]
    if (!updated[questionIndex].options) {
      updated[questionIndex].options = []
    }
    updated[questionIndex].options!.push('')
    setQuestions(updated)
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions]
    if (updated[questionIndex].options) {
      updated[questionIndex].options![optionIndex] = value
      setQuestions(updated)
    }
  }

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions]
    if (updated[questionIndex].options) {
      updated[questionIndex].options = updated[questionIndex].options!.filter(
        (_, i) => i !== optionIndex
      )
      setQuestions(updated)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const fhirItems = questions
        .filter((q) => q.text.trim() !== '')
        .map((q) => {
          const item: any = {
            linkId: q.linkId,
            text: q.text,
            type: q.type,
            required: q.required,
          }

          if (q.type === 'choice' && q.options && q.options.length > 0) {
            item.answerOption = q.options
              .filter((opt) => opt.trim() !== '')
              .map((opt) => ({
                valueString: opt,
              }))
          }

          return item
        })

      const questionnaire = await questionnaireService.create({
        title,
        status,
        item: fhirItems,
      })

      router.push(`/questionnaires/${questionnaire.id}`)
    } catch (error) {
      console.error('Error creating questionnaire:', error)
      alert('Failed to create questionnaire. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">New Questionnaire</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Patient Intake Form"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              required
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'active')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add Question
            </button>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Text *
                      </label>
                      <input
                        type="text"
                        value={question.text}
                        onChange={(e) => updateQuestion(index, { text: e.target.value })}
                        placeholder="Enter question text..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type
                        </label>
                        <select
                          value={question.type}
                          onChange={(e) =>
                            updateQuestion(index, { type: e.target.value as Question['type'] })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        >
                          <option value="string">Text</option>
                          <option value="choice">Multiple Choice</option>
                          <option value="boolean">Yes/No</option>
                          <option value="date">Date</option>
                          <option value="integer">Number (Integer)</option>
                          <option value="decimal">Number (Decimal)</option>
                        </select>
                      </div>

                      <div className="flex items-center pt-8">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={question.required}
                            onChange={(e) =>
                              updateQuestion(index, { required: e.target.checked })
                            }
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Required</span>
                        </label>
                      </div>
                    </div>

                    {question.type === 'choice' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Options
                        </label>
                        <div className="space-y-2">
                          {question.options?.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(index, optIndex, e.target.value)}
                                placeholder={`Option ${optIndex + 1}`}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => removeOption(index, optIndex)}
                                className="text-red-600 hover:text-red-700"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addOption(index)}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            + Add Option
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="ml-4 text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !title.trim() || questions.every((q) => !q.text.trim())}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Creating...' : 'Create Questionnaire'}
          </button>
        </div>
      </form>
    </div>
  )
}

