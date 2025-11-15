'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { patientService, Patient } from '@/lib/services/patient-service'
import { observationService, Observation } from '@/lib/services/observation-service'
import { questionnaireService, QuestionnaireResponse } from '@/lib/services/questionnaire-service'
import { appointmentService, Appointment } from '@/lib/services/appointment-service'

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string
  
  const [patient, setPatient] = useState<Patient | null>(null)
  const [observations, setObservations] = useState<Observation[]>([])
  const [questionnaireResponses, setQuestionnaireResponses] = useState<QuestionnaireResponse[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (patientId) {
      loadPatient()
      loadObservations()
      loadQuestionnaireResponses()
      loadAppointments()
    }
  }, [patientId])

  const loadPatient = async () => {
    try {
      const data = await patientService.getById(patientId)
      setPatient(data)
    } catch (error) {
      console.error('Error loading patient:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadObservations = async () => {
    try {
      const data = await observationService.getByPatient(patientId)
      setObservations(data)
    } catch (error) {
      console.error('Error loading observations:', error)
    }
  }

  const loadQuestionnaireResponses = async () => {
    try {
      const data = await questionnaireService.getResponsesByPatient(patientId)
      setQuestionnaireResponses(data)
    } catch (error) {
      console.error('Error loading questionnaire responses:', error)
    }
  }

  const loadAppointments = async () => {
    try {
      const data = await appointmentService.getByPatient(patientId)
      setAppointments(data)
    } catch (error) {
      console.error('Error loading appointments:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading patient...</div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Patient not found</p>
        <Link href="/patients" className="text-blue-600 hover:text-blue-700">
          ← Back to Patients
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/patients" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
            ← Back to Patients
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {patient.name?.[0]?.given?.join(' ')} {patient.name?.[0]?.family}
          </h1>
        </div>
        <Link
          href={`/patients/${patientId}/edit`}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Edit Patient
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patient Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Gender</dt>
              <dd className="text-sm text-gray-900 capitalize">{patient.gender || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
              <dd className="text-sm text-gray-900">
                {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="text-sm text-gray-900">
                {patient.telecom?.find(t => t.system === 'email')?.value || 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="text-sm text-gray-900">
                {patient.telecom?.find(t => t.system === 'phone')?.value || 'N/A'}
              </dd>
            </div>
            {patient.address && patient.address.length > 0 && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="text-sm text-gray-900">
                  {patient.address[0].line?.join(', ')}
                  {patient.address[0].city && `, ${patient.address[0].city}`}
                  {patient.address[0].state && `, ${patient.address[0].state}`}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Observations */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Observations</h2>
            <Link
              href={`/observations/new?patientId=${patientId}`}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add Observation
            </Link>
          </div>
          {observations.length > 0 ? (
            <div className="space-y-3">
              {observations.slice(0, 5).map((obs) => (
                <div key={obs.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    {obs.code?.coding?.[0]?.display || 'Observation'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {obs.valueQuantity && `${obs.valueQuantity.value} ${obs.valueQuantity.unit}`}
                    {obs.valueString && obs.valueString}
                    {obs.effectiveDateTime && ` • ${new Date(obs.effectiveDateTime).toLocaleDateString()}`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No observations yet</p>
          )}
          <Link
            href={`/observations?patientId=${patientId}`}
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all observations →
          </Link>
        </div>

        {/* Questionnaires */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Questionnaire Responses</h2>
            <Link
              href={`/questionnaires?assignTo=${patientId}`}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Assign Questionnaire
            </Link>
          </div>
          {questionnaireResponses.length > 0 ? (
            <div className="space-y-3">
              {questionnaireResponses.map((response) => {
                const questionnaireId = response.questionnaire?.split('/')[1] || ''
                return (
                  <Link
                    key={response.id}
                    href={`/questionnaires/${questionnaireId}/responses/${response.id}`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Questionnaire Response
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Status: {response.status} • {response.id?.substring(0, 8)}
                          {response.item && response.item.length > 0 && (
                            <span> • {response.item.length} answers</span>
                          )}
                        </p>
                      </div>
                      <span className="text-blue-600">→</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div>
              <p className="text-gray-500 text-sm mb-4">
                No questionnaire responses yet for this patient
              </p>
              <Link
                href="/questionnaires"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Browse questionnaires to assign →
              </Link>
            </div>
          )}
        </div>

        {/* Appointments */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Appointments</h2>
            <Link
              href={`/appointments/new?patientId=${patientId}`}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Schedule Appointment
            </Link>
          </div>
          {appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.slice(0, 5).map((appointment) => (
                <Link
                  key={appointment.id}
                  href={`/appointments/${appointment.id}`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {appointment.description || 'Appointment'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {appointment.start && new Date(appointment.start).toLocaleString()}
                        {appointment.status && (
                          <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                            appointment.status === 'booked' ? 'bg-blue-100 text-blue-800' :
                            appointment.status === 'fulfilled' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {appointment.status}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="text-blue-600">→</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No appointments scheduled</p>
          )}
          <Link
            href={`/appointments?patientId=${patientId}`}
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all appointments →
          </Link>
        </div>
      </div>
    </div>
  )
}

