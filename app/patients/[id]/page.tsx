'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { patientService, Patient } from '@/lib/services/patient-service'
import { observationService, Observation } from '@/lib/services/observation-service'
import { questionnaireService, QuestionnaireResponse } from '@/lib/services/questionnaire-service'
import { appointmentService, Appointment } from '@/lib/services/appointment-service'
import { encounterService, Encounter } from '@/lib/services/encounter-service'
import { documentService, DocumentReference } from '@/lib/services/document-service'
import { conditionService, Condition } from '@/lib/services/condition-service'
import { carePlanService, CarePlan } from '@/lib/services/careplan-service'

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string
  
  const [patient, setPatient] = useState<Patient | null>(null)
  const [observations, setObservations] = useState<Observation[]>([])
  const [questionnaireResponses, setQuestionnaireResponses] = useState<QuestionnaireResponse[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [encounters, setEncounters] = useState<Encounter[]>([])
  const [documents, setDocuments] = useState<DocumentReference[]>([])
  const [conditions, setConditions] = useState<Condition[]>([])
  const [carePlans, setCarePlans] = useState<CarePlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (patientId) {
      loadPatient()
      loadObservations()
      loadQuestionnaireResponses()
      loadAppointments()
      loadEncounters()
      loadDocuments()
      loadConditions()
      loadCarePlans()
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

  const loadEncounters = async () => {
    try {
      const data = await encounterService.getByPatient(patientId)
      setEncounters(data)
    } catch (error) {
      console.error('Error loading encounters:', error)
    }
  }

  const loadDocuments = async () => {
    try {
      const data = await documentService.getByPatient(patientId)
      setDocuments(data)
    } catch (error) {
      console.error('Error loading documents:', error)
    }
  }

  const loadConditions = async () => {
    try {
      const data = await conditionService.getByPatient(patientId)
      setConditions(data)
    } catch (error) {
      console.error('Error loading conditions:', error)
    }
  }

  const loadCarePlans = async () => {
    try {
      const data = await carePlanService.getByPatient(patientId)
      setCarePlans(data)
    } catch (error) {
      console.error('Error loading care plans:', error)
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
          <Link href="/patients" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-flex items-center gap-1">
            <span>←</span> Back to Patients
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {patient.name?.[0]?.given?.[0]?.[0] || 'P'}{patient.name?.[0]?.family?.[0] || ''}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {patient.name?.[0]?.given?.join(' ')} {patient.name?.[0]?.family}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Patient ID: {patientId.substring(0, 8)}...
              </p>
            </div>
          </div>
        </div>
        <Link
          href={`/patients/${patientId}/edit`}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <span>✏️</span> Edit Patient
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patient Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">👤</span>
            <h2 className="text-lg font-semibold text-gray-900">Patient Information</h2>
          </div>
          <dl className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">⚧️</span>
              <div>
                <dt className="text-sm font-medium text-gray-500">Gender</dt>
                <dd className="text-sm text-gray-900 capitalize mt-1">{patient.gender || 'N/A'}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">🎂</span>
              <div>
                <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : 'N/A'}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">📧</span>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {patient.telecom?.find(t => t.system === 'email')?.value || 'N/A'}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">📱</span>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {patient.telecom?.find(t => t.system === 'phone')?.value || 'N/A'}
                </dd>
              </div>
            </div>
            {patient.address && patient.address.length > 0 && (
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">📍</span>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {patient.address[0].line?.join(', ')}
                    {patient.address[0].city && `, ${patient.address[0].city}`}
                    {patient.address[0].state && `, ${patient.address[0].state}`}
                  </dd>
                </div>
              </div>
            )}
          </dl>
        </div>

        {/* Observations */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📋</span>
              <h2 className="text-lg font-semibold text-gray-900">Observations</h2>
            </div>
            <Link
              href={`/observations/new?patientId=${patientId}`}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <span>➕</span> Add Observation
            </Link>
          </div>
          {observations.length > 0 ? (
            <div className="space-y-3">
              {observations.slice(0, 5).map((obs) => (
                <div key={obs.id} className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500 hover:bg-gray-100 transition">
                  <div className="flex items-start gap-2">
                    <span className="text-lg mt-0.5">📊</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {obs.code?.coding?.[0]?.display || 'Observation'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {obs.valueQuantity && `${obs.valueQuantity.value} ${obs.valueQuantity.unit}`}
                        {obs.valueString && obs.valueString}
                        {obs.effectiveDateTime && ` • ${new Date(obs.effectiveDateTime).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="text-4xl block mb-2">📭</span>
              <p className="text-gray-500 text-sm">No observations yet</p>
            </div>
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
            <div className="flex items-center gap-2">
              <span className="text-2xl">📝</span>
              <h2 className="text-lg font-semibold text-gray-900">Questionnaire Responses</h2>
            </div>
            <Link
              href={`/questionnaires?assignTo=${patientId}`}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <span>➕</span> Assign Questionnaire
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
                    className="block p-3 bg-gray-50 rounded-lg border-l-4 border-green-500 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        <span className="text-lg mt-0.5">📋</span>
                        <div className="flex-1">
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
                      </div>
                      <span className="text-blue-600 text-xl">→</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="text-4xl block mb-2">📭</span>
              <p className="text-gray-500 text-sm mb-4">
                No questionnaire responses yet for this patient
              </p>
              <Link
                href="/questionnaires"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                <span>🔍</span> Browse questionnaires to assign →
              </Link>
            </div>
          )}
        </div>

        {/* Appointments */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📅</span>
              <h2 className="text-lg font-semibold text-gray-900">Appointments</h2>
            </div>
            <Link
              href={`/appointments/new?patientId=${patientId}`}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <span>➕</span> Schedule Appointment
            </Link>
          </div>
          {appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.slice(0, 5).map((appointment) => (
                <Link
                  key={appointment.id}
                  href={`/appointments/${appointment.id}`}
                  className="block p-3 bg-gray-50 rounded-lg border-l-4 border-purple-500 hover:bg-gray-100 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-2 flex-1">
                      <span className="text-lg mt-0.5">📆</span>
                      <div className="flex-1">
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
                    </div>
                    <span className="text-blue-600 text-xl">→</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="text-4xl block mb-2">📭</span>
              <p className="text-gray-500 text-sm">No appointments scheduled</p>
            </div>
          )}
          <Link
            href={`/appointments?patientId=${patientId}`}
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all appointments →
          </Link>
        </div>

        {/* Encounters */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏥</span>
              <h2 className="text-lg font-semibold text-gray-900">Encounters</h2>
            </div>
            <Link
              href={`/encounters/new?patientId=${patientId}`}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <span>➕</span> Create Encounter
            </Link>
          </div>
          {encounters.length > 0 ? (
            <div className="space-y-3">
              {encounters.slice(0, 5).map((encounter) => (
                <Link
                  key={encounter.id}
                  href={`/encounters/${encounter.id}`}
                  className="block p-3 bg-gray-50 rounded-lg border-l-4 border-indigo-500 hover:bg-gray-100 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-2 flex-1">
                      <span className="text-lg mt-0.5">🏨</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {encounter.class?.display || 'Encounter'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {encounter.period?.start && new Date(encounter.period.start).toLocaleString()}
                          {encounter.status && (
                            <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                              encounter.status === 'finished' ? 'bg-green-100 text-green-800' :
                              encounter.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              encounter.status === 'arrived' ? 'bg-yellow-100 text-yellow-800' :
                              encounter.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {encounter.status}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className="text-blue-600 text-xl">→</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="text-4xl block mb-2">📭</span>
              <p className="text-gray-500 text-sm">No encounters recorded</p>
            </div>
          )}
          <Link
            href={`/encounters?patientId=${patientId}`}
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all encounters →
          </Link>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📁</span>
              <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
            </div>
            <Link
              href={`/documents/upload?patientId=${patientId}`}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <span>➕</span> Upload Document
            </Link>
          </div>
          {documents.length > 0 ? (
            <div className="space-y-3">
              {documents.slice(0, 5).map((doc) => {
                const attachment = doc.content?.[0]?.attachment
                const contentType = attachment?.contentType || 'application/pdf'
                const getFileIcon = (type: string) => {
                  if (type.includes('pdf')) return '📕'
                  if (type.includes('image')) return '🖼️'
                  if (type.includes('word')) return '📘'
                  return '📄'
                }
                return (
                  <Link
                    key={doc.id}
                    href={`/documents/${doc.id}`}
                    className="block p-3 bg-gray-50 rounded-lg border-l-4 border-orange-500 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        <span className="text-lg mt-0.5">{getFileIcon(contentType)}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {attachment?.title || doc.description || 'Document'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {doc.type?.text || doc.type?.coding?.[0]?.display || 'Document'}
                            {doc.date && ` • ${new Date(doc.date).toLocaleDateString()}`}
                            {attachment?.size && ` • ${(attachment.size / 1024).toFixed(1)} KB`}
                          </p>
                        </div>
                      </div>
                      <span className="text-blue-600 text-xl">→</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="text-4xl block mb-2">📭</span>
              <p className="text-gray-500 text-sm">No documents uploaded</p>
            </div>
          )}
          <Link
            href={`/documents?patientId=${patientId}`}
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all documents →
          </Link>
        </div>

        {/* Conditions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💊</span>
              <h2 className="text-lg font-semibold text-gray-900">Conditions</h2>
            </div>
            <Link
              href={`/conditions/new?patientId=${patientId}`}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <span>➕</span> Record Condition
            </Link>
          </div>
          {conditions.length > 0 ? (
            <div className="space-y-3">
              {conditions.slice(0, 5).map((condition) => {
                const status = condition.clinicalStatus?.coding?.[0]?.code || condition.clinicalStatus?.text || 'unknown'
                const getStatusColor = (status: string) => {
                  switch (status.toLowerCase()) {
                    case 'active':
                      return 'border-red-500 bg-red-50'
                    case 'resolved':
                      return 'border-green-500 bg-green-50'
                    case 'remission':
                      return 'border-yellow-500 bg-yellow-50'
                    default:
                      return 'border-gray-500 bg-gray-50'
                  }
                }
                return (
                  <Link
                    key={condition.id}
                    href={`/conditions/${condition.id}`}
                    className={`block p-3 rounded-lg border-l-4 hover:opacity-80 transition ${getStatusColor(status)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        <span className="text-lg mt-0.5">🏥</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {condition.code?.text || condition.code?.coding?.[0]?.display || 'Condition'}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              status === 'active' ? 'bg-red-100 text-red-800' :
                              status === 'resolved' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {condition.clinicalStatus?.coding?.[0]?.display || condition.clinicalStatus?.text || 'Unknown'}
                            </span>
                            {condition.severity && (
                              <span className="ml-2 px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-800">
                                {condition.severity.coding?.[0]?.display || condition.severity.text}
                              </span>
                            )}
                            {condition.onsetDateTime && (
                              <span className="ml-2">
                                Onset: {new Date(condition.onsetDateTime).toLocaleDateString()}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <span className="text-blue-600 text-xl">→</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="text-4xl block mb-2">💊</span>
              <p className="text-gray-500 text-sm">No conditions recorded</p>
            </div>
          )}
          <Link
            href={`/conditions?patientId=${patientId}`}
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all conditions →
          </Link>
        </div>

        {/* Care Plans */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📋</span>
              <h2 className="text-lg font-semibold text-gray-900">Care Plans</h2>
            </div>
            <Link
              href={`/careplans/new?patientId=${patientId}`}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <span>➕</span> Create Care Plan
            </Link>
          </div>
          {carePlans.length > 0 ? (
            <div className="space-y-3">
              {carePlans.slice(0, 5).map((carePlan) => {
                const getStatusColor = (status?: string) => {
                  switch (status?.toLowerCase()) {
                    case 'active':
                      return 'border-green-500 bg-green-50'
                    case 'completed':
                      return 'border-blue-500 bg-blue-50'
                    case 'on-hold':
                      return 'border-yellow-500 bg-yellow-50'
                    default:
                      return 'border-gray-500 bg-gray-50'
                  }
                }
                return (
                  <Link
                    key={carePlan.id}
                    href={`/careplans/${carePlan.id}`}
                    className={`block p-3 rounded-lg border-l-4 hover:opacity-80 transition ${getStatusColor(carePlan.status)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        <span className="text-lg mt-0.5">📋</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {carePlan.title || 'Untitled Care Plan'}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              carePlan.status === 'active' ? 'bg-green-100 text-green-800' :
                              carePlan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              carePlan.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {carePlan.status || 'Unknown'}
                            </span>
                            {carePlan.note && (() => {
                              const goalCount = carePlan.note.filter(note => 
                                note.text && note.text.match(/^Goal \d+:/i)
                              ).length
                              return goalCount > 0 ? (
                                <span className="ml-2">
                                  {goalCount} {goalCount === 1 ? 'goal' : 'goals'}
                                </span>
                              ) : null
                            })()}
                            {carePlan.activity && carePlan.activity.length > 0 && (
                              <span className="ml-2">
                                {carePlan.activity.length} {carePlan.activity.length === 1 ? 'activity' : 'activities'}
                              </span>
                            )}
                            {carePlan.period?.start && (
                              <span className="ml-2">
                                Started: {new Date(carePlan.period.start).toLocaleDateString()}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <span className="text-blue-600 text-xl">→</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="text-4xl block mb-2">📋</span>
              <p className="text-gray-500 text-sm">No care plans created</p>
            </div>
          )}
          <Link
            href={`/careplans?patientId=${patientId}`}
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all care plans →
          </Link>
        </div>
      </div>
    </div>
  )
}

