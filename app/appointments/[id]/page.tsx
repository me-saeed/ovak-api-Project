'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { appointmentService, Appointment } from '@/lib/services/appointment-service'
import { patientService, Patient } from '@/lib/services/patient-service'

export default function AppointmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const appointmentId = params.id as string

  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (appointmentId) {
      loadAppointment()
    }
  }, [appointmentId])

  const loadAppointment = async () => {
    try {
      const data = await appointmentService.getById(appointmentId)
      setAppointment(data)

      // Load patient if reference exists
      const patientRef = data.participant?.find(
        (p) => p.actor?.reference?.startsWith('Patient/')
      )?.actor?.reference

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
      console.error('Error loading appointment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return
    }

    try {
      await appointmentService.cancel(appointmentId)
      loadAppointment() // Reload to show updated status
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      alert('Failed to cancel appointment. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked':
        return 'bg-blue-100 text-blue-800'
      case 'fulfilled':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'noshow':
        return 'bg-orange-100 text-orange-800'
      case 'proposed':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDateTime = (dateString?: string) => {
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
        <div className="text-gray-500">Loading appointment...</div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Appointment not found</p>
        <Link href="/appointments" className="text-blue-600 hover:text-blue-700">
          ← Back to Appointments
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/appointments" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
            ← Back to Appointments
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {appointment.description || 'Appointment'}
          </h1>
          <p className="text-gray-600 mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
              {appointment.status}
            </span>
          </p>
        </div>
        {appointment.status !== 'cancelled' && appointment.status !== 'fulfilled' && (
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
          >
            Cancel Appointment
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appointment Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Start Time</dt>
              <dd className="text-sm text-gray-900">{formatDateTime(appointment.start)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">End Time</dt>
              <dd className="text-sm text-gray-900">{formatDateTime(appointment.end)}</dd>
            </div>
            {appointment.minutesDuration && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Duration</dt>
                <dd className="text-sm text-gray-900">{appointment.minutesDuration} minutes</dd>
              </div>
            )}
            {appointment.description && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="text-sm text-gray-900">{appointment.description}</dd>
              </div>
            )}
            {appointment.comment && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Comments</dt>
                <dd className="text-sm text-gray-900">{appointment.comment}</dd>
              </div>
            )}
            {appointment.created && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="text-sm text-gray-900">{formatDateTime(appointment.created)}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Participants */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Participants</h2>
          {appointment.participant && appointment.participant.length > 0 ? (
            <div className="space-y-3">
              {appointment.participant.map((participant, index) => {
                const isPatient = participant.actor?.reference?.startsWith('Patient/')
                const isPractitioner = participant.actor?.reference?.startsWith('Practitioner/')
                
                return (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {isPatient && patient ? (
                            <Link
                              href={`/patients/${patient.id}`}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              {getPatientName()} →
                            </Link>
                          ) : isPatient ? (
                            `Patient: ${participant.actor?.reference?.split('/')[1] || 'Unknown'}`
                          ) : isPractitioner ? (
                            `Practitioner: ${participant.actor?.reference?.split('/')[1] || 'Unknown'}`
                          ) : (
                            participant.actor?.display || participant.actor?.reference || 'Unknown'
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Status: {participant.status}
                          {participant.type?.[0]?.coding?.[0]?.display && (
                            <span> • {participant.type[0].coding[0].display}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No participants</p>
          )}
        </div>
      </div>
    </div>
  )
}

