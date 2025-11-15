'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { appointmentService } from '@/lib/services/appointment-service'
import { patientService, Patient } from '@/lib/services/patient-service'
import { getProfileId } from '@/lib/auth'

export default function NewAppointmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientIdFromQuery = searchParams.get('patientId')
  
  const [patients, setPatients] = useState<Patient[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    patientId: patientIdFromQuery || '',
    description: '',
    start: '',
    end: '',
    minutesDuration: '30',
    status: 'proposed' as 'proposed' | 'pending' | 'booked',
    comment: '',
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

  const handleStartTimeChange = (value: string) => {
    setFormData(prev => {
      const newStart = value
      let newEnd = prev.end
      
      // Auto-calculate end time if duration is set
      if (newStart && prev.minutesDuration) {
        const startDate = new Date(newStart)
        const duration = parseInt(prev.minutesDuration) || 30
        const endDate = new Date(startDate.getTime() + duration * 60000)
        newEnd = endDate.toISOString().slice(0, 16)
      }
      
      return { ...prev, start: newStart, end: newEnd }
    })
  }

  const handleDurationChange = (value: string) => {
    setFormData(prev => {
      const duration = parseInt(value) || 30
      let newEnd = prev.end
      
      // Auto-calculate end time if start time is set
      if (prev.start) {
        const startDate = new Date(prev.start)
        const endDate = new Date(startDate.getTime() + duration * 60000)
        newEnd = endDate.toISOString().slice(0, 16)
      }
      
      return { ...prev, minutesDuration: value, end: newEnd }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const profileId = getProfileId()
      const startDate = new Date(formData.start)
      const endDate = formData.end ? new Date(formData.end) : new Date(startDate.getTime() + parseInt(formData.minutesDuration) * 60000)

      const participants = [
        {
          actor: {
            reference: `Patient/${formData.patientId}`,
          },
          status: 'accepted' as const,
          type: [{
            coding: [{
              code: 'PPRF',
              display: 'Primary Performer',
            }],
          }],
        },
      ]

      // Add practitioner if available
      if (profileId) {
        participants.push({
          actor: {
            reference: `Practitioner/${profileId}`,
          },
          status: 'accepted' as const,
          type: [{
            coding: [{
              code: 'ATND',
              display: 'Attender',
            }],
          }],
        })
      }

      const appointment = await appointmentService.create({
        status: formData.status,
        description: formData.description,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        minutesDuration: parseInt(formData.minutesDuration),
        participant: participants,
        comment: formData.comment || undefined,
      })

      router.push(`/appointments/${appointment.id}`)
    } catch (error) {
      console.error('Error creating appointment:', error)
      alert('Failed to create appointment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getPatientDisplayName = (patient: Patient): string => {
    const given = patient.name?.[0]?.given?.join(' ') || ''
    const family = patient.name?.[0]?.family || ''
    return `${given} ${family}`.trim() || `Patient ${patient.id?.substring(0, 8)}`
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">New Appointment</h1>

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
            Description
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g., Annual checkup, Follow-up visit"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.start}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes) *
            </label>
            <input
              type="number"
              required
              min="5"
              step="5"
              value={formData.minutesDuration}
              onChange={(e) => handleDurationChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date & Time
          </label>
          <input
            type="datetime-local"
            value={formData.end}
            onChange={(e) => setFormData({ ...formData, end: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Auto-calculated from start time and duration, or set manually
          </p>
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
            <option value="proposed">Proposed</option>
            <option value="pending">Pending</option>
            <option value="booked">Booked</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comments / Notes
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            rows={3}
            placeholder="Additional notes about the appointment..."
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
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Creating...' : 'Create Appointment'}
          </button>
        </div>
      </form>
    </div>
  )
}

