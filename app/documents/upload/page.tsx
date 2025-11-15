'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { documentService } from '@/lib/services/document-service'
import { patientService, Patient } from '@/lib/services/patient-service'

export default function UploadDocumentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientIdFromQuery = searchParams.get('patientId')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [patients, setPatients] = useState<Patient[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    patientId: patientIdFromQuery || '',
    title: '',
    description: '',
    type: 'Clinical Note',
  })

  useEffect(() => {
    loadPatients()
  }, [])

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: file.name }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      alert('Please select a file to upload')
      return
    }

    if (!formData.patientId) {
      alert('Please select a patient')
      return
    }

    setLoading(true)
    setUploadProgress(0)

    try {
      // Step 1: Upload the document
      const uploadResponse = await documentService.upload(selectedFile, {
        title: formData.title,
        description: formData.description,
      })

      setUploadProgress(50)

      // Step 2: Create DocumentReference linking to patient
      const documentReference = await documentService.createReference(
        uploadResponse.id,
        uploadResponse.url,
        formData.patientId,
        {
          title: formData.title || selectedFile.name,
          description: formData.description,
          type: formData.type,
          contentType: selectedFile.type,
          size: selectedFile.size,
        }
      )

      setUploadProgress(100)

      // Navigate to document detail or patient page
      if (formData.patientId) {
        router.push(`/patients/${formData.patientId}`)
      } else {
        router.push(`/documents/${documentReference.id}`)
      }
    } catch (error: any) {
      console.error('Error uploading document:', error)
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to upload document. Please try again.'
      alert(errorMessage)
      setUploadProgress(0)
    } finally {
      setLoading(false)
    }
  }

  const getPatientDisplayName = (patient: Patient): string => {
    const given = patient.name?.[0]?.given?.join(' ') || ''
    const family = patient.name?.[0]?.family || ''
    return `${given} ${family}`.trim() || `Patient ${patient.id?.substring(0, 8)}`
  }

  const documentTypes = [
    'Clinical Note',
    'Lab Report',
    'Imaging Report',
    'Prescription',
    'Referral Letter',
    'Discharge Summary',
    'Consent Form',
    'Insurance Document',
    'Other',
  ]

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Upload Document</h1>

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
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
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
          {patients.length === 0 && !loadingPatients && (
            <p className="mt-2 text-sm text-gray-500">
              No patients found. <a href="/patients/new" className="text-blue-600 hover:text-blue-700">Create a patient first</a>
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document File *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
            />
            {selectedFile ? (
              <div className="space-y-2">
                <span className="text-4xl block">📄</span>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Unknown type'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="text-sm text-red-600 hover:text-red-700 mt-2"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div>
                <span className="text-4xl block mb-2">📤</span>
                <p className="text-sm text-gray-600 mb-2">
                  Click to select a file or drag and drop
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Choose File
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  PDF, DOC, DOCX, JPG, PNG, GIF, TXT (Max 10MB)
                </p>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Lab Report - Blood Test"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            {documentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="Additional notes about this document..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">Uploading...</span>
              <span className="text-sm text-blue-700">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

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
            disabled={loading || !selectedFile}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
          >
            <span>📤</span>
            {loading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </form>
    </div>
  )
}

