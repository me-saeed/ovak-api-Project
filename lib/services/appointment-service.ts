/**
 * Appointment Service
 * Handles Appointment FHIR resource operations
 */

import apiClient from '../api-client';

export interface Appointment {
  resourceType: 'Appointment';
  id?: string;
  status: 'proposed' | 'pending' | 'booked' | 'arrived' | 'fulfilled' | 'cancelled' | 'noshow' | 'entered-in-error' | 'checked-in' | 'waitlist';
  serviceType?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  }>;
  start?: string;
  end?: string;
  minutesDuration?: number;
  participant: Array<{
    actor?: {
      reference: string;
      display?: string;
    };
    status: 'accepted' | 'declined' | 'tentative' | 'needs-action';
    type?: Array<{
      coding?: Array<{
        code?: string;
        display?: string;
      }>;
    }>;
  }>;
  description?: string;
  created?: string;
  comment?: string;
}

export interface AppointmentSearchFilters {
  patient?: string;
  practitioner?: string;
  date?: string;
  status?: string;
  _count?: number;
}

export const appointmentService = {
  /**
   * Search for appointments
   */
  async search(filters: AppointmentSearchFilters = {}): Promise<Appointment[]> {
    const params = new URLSearchParams();
    
    if (filters.patient) params.append('patient', filters.patient);
    if (filters.practitioner) params.append('practitioner', filters.practitioner);
    if (filters.date) params.append('date', filters.date);
    if (filters.status) params.append('status', filters.status);
    if (filters._count) params.append('_count', filters._count.toString());
    
    const response = await apiClient.get(`/fhir/Appointment?${params.toString()}`);
    return response.data.entry?.map((entry: any) => entry.resource) || [];
  },

  /**
   * Get appointments for a specific patient
   */
  async getByPatient(patientId: string): Promise<Appointment[]> {
    return this.search({ patient: `Patient/${patientId}`, _count: 50 });
  },

  /**
   * Get appointments for a specific practitioner
   */
  async getByPractitioner(practitionerId: string): Promise<Appointment[]> {
    return this.search({ practitioner: `Practitioner/${practitionerId}`, _count: 50 });
  },

  /**
   * Get appointment by ID
   */
  async getById(appointmentId: string): Promise<Appointment> {
    const response = await apiClient.get(`/fhir/Appointment/${appointmentId}`);
    return response.data;
  },

  /**
   * Create a new appointment
   */
  async create(appointmentData: Partial<Appointment>): Promise<Appointment> {
    const fhirAppointment: Appointment = {
      resourceType: 'Appointment',
      status: appointmentData.status || 'proposed',
      serviceType: appointmentData.serviceType,
      start: appointmentData.start,
      end: appointmentData.end,
      minutesDuration: appointmentData.minutesDuration,
      participant: appointmentData.participant || [],
      description: appointmentData.description,
      comment: appointmentData.comment,
      created: new Date().toISOString(),
    };

    const response = await apiClient.post('/fhir/Appointment', fhirAppointment);
    return response.data;
  },

  /**
   * Update an appointment
   */
  async update(appointmentId: string, updates: Partial<Appointment>): Promise<Appointment> {
    const current = await this.getById(appointmentId);
    const updated: Appointment = {
      ...current,
      ...updates,
      id: appointmentId,
    };

    const response = await apiClient.put(`/fhir/Appointment/${appointmentId}`, updated);
    return response.data;
  },

  /**
   * Cancel an appointment
   */
  async cancel(appointmentId: string): Promise<Appointment> {
    return this.update(appointmentId, { status: 'cancelled' });
  },
};

