'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { documentService, DocumentReference } from '@/lib/services/document-service'
import { patientService, Patient } from '@/lib/services/patient-service'

export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const documentId = params.id as string

  const [documentRef, setDocumentRef] = useState<DocumentReference | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (documentId) {
      loadDocument()
    }
  }, [documentId])

  const loadDocument = async () => {
    try {
      const data = await documentService.getById(documentId)
      setDocumentRef(data)

      // Load patient if reference exists
      const patientRef = data.subject?.reference

      if (patientRef) {
        const patientId = patientRef.split('/')[1]
        try {
          const patientData = await patientService.getById(patientId)
          setPatient(patientData)
        } catch (error) {
          console.error('Error loading patient:', error)
        }
      }
    } catch (error) {
      console.error('Error loading document:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    const attachment = documentRef?.content?.[0]?.attachment
    if (!attachment?.url) {
      alert('Document URL not available')
      return
    }

    try {
      // Get the access token
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('accessToken')
      }

      if (!token) {
        alert('Authentication required. Please log in again.')
        return
      }

      // If it's a Binary resource URL, fetch it with authentication
      if (attachment.url.includes('/fhir/Binary/')) {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ovok.com'
        const binaryUrl = attachment.url.startsWith('http') 
          ? attachment.url 
          : `${API_BASE_URL}${attachment.url.startsWith('/') ? '' : '/'}${attachment.url}`

        // Fetch the binary with authentication
        const response = await fetch(binaryUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': attachment.contentType || 'application/octet-stream',
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to download: ${response.statusText}`)
        }

        // Get the blob
        const blob = await response.blob()
        
        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = window.document.createElement('a')
        link.href = downloadUrl
        link.download = attachment.title || documentRef?.description || 'document'
        window.document.body.appendChild(link)
        link.click()
        window.document.body.removeChild(link)
        window.URL.revokeObjectURL(downloadUrl)
      } else {
        // For other URLs, try to open with token in header
        // Or just open directly if it's a public URL
        window.open(attachment.url, '_blank')
      }
    } catch (error: any) {
      console.error('Error downloading document:', error)
      alert(`Failed to download document: ${error.message || 'Unknown error'}`)
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
    return new Date(dateString).toLocaleString()
  }

  const getPatientName = (): string => {
    if (!patient) return 'Unknown Patient'
    const given = patient.name?.[0]?.given?.join(' ') || ''
    const family = patient.name?.[0]?.family || ''
    return `${given} ${family}`.trim() || 'Patient'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading document...</div>
      </div>
    )
  }

  if (!documentRef) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Document not found</p>
        <Link href="/documents" className="text-blue-600 hover:text-blue-700">
          ← Back to Documents
        </Link>
      </div>
    )
  }

  const attachment = documentRef.content?.[0]?.attachment
  const contentType = attachment?.contentType || 'application/pdf'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/documents" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-flex items-center gap-1">
            <span>←</span> Back to Documents
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-6xl">{getFileIcon(contentType)}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {attachment?.title || documentRef.description || 'Document'}
              </h1>
              <p className="text-gray-600 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  documentRef.status === 'current' ? 'bg-green-100 text-green-800' :
                  documentRef.status === 'superseded' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {documentRef.status}
                </span>
              </p>
            </div>
          </div>
        </div>
        {attachment?.url && (
          <button
            onClick={handleDownload}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
          >
            <span>⬇️</span> Download
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Details</h2>
          <dl className="space-y-3">
            {documentRef.type && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="text-sm text-gray-900">
                  {documentRef.type.text || documentRef.type.coding?.[0]?.display || 'N/A'}
                </dd>
              </div>
            )}
            {documentRef.description && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="text-sm text-gray-900">{documentRef.description}</dd>
              </div>
            )}
            {attachment && (
              <>
                {attachment.contentType && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Content Type</dt>
                    <dd className="text-sm text-gray-900">{attachment.contentType}</dd>
                  </div>
                )}
                {attachment.size && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">File Size</dt>
                    <dd className="text-sm text-gray-900">{formatFileSize(attachment.size)}</dd>
                  </div>
                )}
              </>
            )}
            {documentRef.date && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Date</dt>
                <dd className="text-sm text-gray-900">{formatDate(documentRef.date)}</dd>
              </div>
            )}
            {documentRef.id && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Document ID</dt>
                <dd className="text-sm text-gray-900 font-mono">{documentRef.id}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Patient & Context */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient & Context</h2>
          {patient ? (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <Link
                href={`/patients/${patient.id}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {getPatientName()} →
              </Link>
              <p className="text-xs text-gray-500 mt-1">
                {patient.gender} • {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm mb-4">
              Patient: {documentRef.subject?.reference || 'Unknown'}
            </p>
          )}
          
          {documentRef.context && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Context</h3>
              {documentRef.context.encounter && documentRef.context.encounter.length > 0 && (
                <p className="text-sm text-gray-600 mb-2">
                  Encounter: {documentRef.context.encounter[0].reference}
                </p>
              )}
              {documentRef.context.period && (
                <p className="text-sm text-gray-600">
                  Period: {formatDate(documentRef.context.period.start)} - {formatDate(documentRef.context.period.end)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Document Preview/Download */}
      {attachment?.url && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Access</h2>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{attachment.title || 'Document'}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {attachment.contentType} • {formatFileSize(attachment.size)}
                </p>
              </div>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
              >
                <span>⬇️</span> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

