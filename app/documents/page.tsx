'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { documentService, DocumentReference } from '@/lib/services/document-service'

export default function DocumentsPage() {
  const searchParams = useSearchParams()
  const patientId = searchParams.get('patientId')
  
  const [documents, setDocuments] = useState<DocumentReference[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDocuments()
  }, [patientId])

  const loadDocuments = async () => {
    try {
      const filters: any = { _count: 50 }
      if (patientId) {
        filters.patient = `Patient/${patientId}`
      }
      const data = await documentService.search(filters)
      setDocuments(data)
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFileIcon = (contentType?: string) => {
    if (!contentType) return '📄'
    if (contentType.includes('pdf')) return '📕'
    if (contentType.includes('image')) return '🖼️'
    if (contentType.includes('word')) return '📘'
    if (contentType.includes('excel') || contentType.includes('spreadsheet')) return '📗'
    return '📄'
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading documents...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-2">Manage patient documents and files</p>
        </div>
        <Link
          href={`/documents/upload${patientId ? `?patientId=${patientId}` : ''}`}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <span>📤</span> Upload Document
        </Link>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {documents.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {documents.map((doc) => {
              const patientRef = doc.subject?.reference
              const patientId = patientRef?.split('/')[1]
              const attachment = doc.content?.[0]?.attachment
              const contentType = attachment?.contentType || 'application/pdf'
              
              return (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}`}
                  className="block p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <span className="text-4xl">{getFileIcon(contentType)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {attachment?.title || doc.description || 'Untitled Document'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            doc.status === 'current' ? 'bg-green-100 text-green-800' :
                            doc.status === 'superseded' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {doc.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          {doc.type && (
                            <div>
                              <span className="font-medium">Type:</span>{' '}
                              {doc.type.text || doc.type.coding?.[0]?.display || 'N/A'}
                            </div>
                          )}
                          {attachment?.size && (
                            <div>
                              <span className="font-medium">Size:</span>{' '}
                              {formatFileSize(attachment.size)}
                            </div>
                          )}
                          {doc.date && (
                            <div>
                              <span className="font-medium">Date:</span>{' '}
                              {formatDate(doc.date)}
                            </div>
                          )}
                        </div>
                        {patientId && (
                          <p className="text-sm text-gray-500 mt-2">
                            Patient: {patientId.substring(0, 8)}...
                          </p>
                        )}
                        {doc.description && (
                          <p className="text-sm text-gray-600 mt-2">{doc.description}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-blue-600 ml-4 text-xl">→</span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <span className="text-6xl block mb-4">📁</span>
            <p className="text-gray-500 mb-4">No documents found</p>
            <Link
              href="/documents/upload"
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
            >
              <span>📤</span> Upload your first document →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

