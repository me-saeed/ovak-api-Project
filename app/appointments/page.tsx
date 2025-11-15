'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { appointmentService, Appointment } from '@/lib/services/appointment-service'

export default function AppointmentsPage() {
  const searchParams = useSearchParams()
  const patientId = searchParams.get('patientId')
  
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('')

  useEffect(() => {
    loadAppointments()
  }, [patientId, filterStatus])

  const loadAppointments = async () => {
    try {
      const filters: any = { _count: 50 }
      if (patientId) {
        filters.patient = `Patient/${patientId}`
      }
      if (filterStatus) {
        filters.status = filterStatus
      }
      const data = await appointmentService.search(filters)
      setAppointments(data)
    } catch (error) {
      console.error('Error loading appointments:', error)
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading appointments...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-2">Manage patient appointments</p>
        </div>
        <Link
          href={`/appointments/new${patientId ? `?patientId=${patientId}` : ''}`}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          + Create Appointment
        </Link>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">All Statuses</option>
            <option value="proposed">Proposed</option>
            <option value="pending">Pending</option>
            <option value="booked">Booked</option>
            <option value="arrived">Arrived</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
            <option value="noshow">No Show</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {appointments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {appointments.map((appointment) => {
              const patientRef = appointment.participant?.find(
                (p) => p.actor?.reference?.startsWith('Patient/')
              )?.actor?.reference
              const patientId = patientRef?.split('/')[1]
              
              return (
                <Link
                  key={appointment.id}
                  href={`/appointments/${appointment.id}`}
                  className="block p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {appointment.description || 'Appointment'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Start:</span>{' '}
                          {formatDateTime(appointment.start)}
                        </div>
                        <div>
                          <span className="font-medium">End:</span>{' '}
                          {formatDateTime(appointment.end)}
                        </div>
                        {appointment.minutesDuration && (
                          <div>
                            <span className="font-medium">Duration:</span>{' '}
                            {appointment.minutesDuration} minutes
                          </div>
                        )}
                      </div>
                      {patientId && (
                        <p className="text-sm text-gray-500 mt-2">
                          Patient: {patientId.substring(0, 8)}...
                        </p>
                      )}
                    </div>
                    <span className="text-blue-600 ml-4">→</span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">No appointments found</p>
            <Link
              href="/appointments/new"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first appointment →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

