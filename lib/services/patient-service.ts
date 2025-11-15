/**
 * Patient Service
 * Handles all Patient FHIR resource operations
 */

import apiClient from '../api-client';

export interface Patient {
  resourceType: 'Patient';
  id?: string;
  name?: Array<{
    given?: string[];
    family?: string;
    text?: string;
  }>;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  telecom?: Array<{
    system?: string;
    value?: string;
    use?: string;
  }>;
  address?: Array<{
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
}

export interface PatientSearchFilters {
  name?: string;
  gender?: string;
  birthdate?: string;
  _count?: number;
  _sort?: string;
}

export const patientService = {
  /**
   * Search for patients
   */
  async search(filters: PatientSearchFilters = {}): Promise<Patient[]> {
    const params = new URLSearchParams();
    
    if (filters.name) params.append('name', filters.name);
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.birthdate) params.append('birthdate', filters.birthdate);
    if (filters._count) params.append('_count', filters._count.toString());
    if (filters._sort) params.append('_sort', filters._sort);
    
    const response = await apiClient.get(`/fhir/Patient?${params.toString()}`);
    return response.data.entry?.map((entry: any) => entry.resource) || [];
  },

  /**
   * Get patient by ID
   */
  async getById(patientId: string): Promise<Patient> {
    const response = await apiClient.get(`/fhir/Patient/${patientId}`);
    return response.data;
  },

  /**
   * Create a new patient
   */
  async create(patientData: Partial<Patient>): Promise<Patient> {
    const fhirPatient: Patient = {
      resourceType: 'Patient',
      name: patientData.name || [{
        given: patientData.name?.[0]?.given || [],
        family: patientData.name?.[0]?.family || '',
      }],
      gender: patientData.gender,
      birthDate: patientData.birthDate,
      telecom: patientData.telecom,
      address: patientData.address,
    };

    const response = await apiClient.post('/fhir/Patient', fhirPatient);
    return response.data;
  },

  /**
   * Update an existing patient
   */
  async update(patientId: string, updates: Partial<Patient>): Promise<Patient> {
    const current = await this.getById(patientId);
    const updated: Patient = {
      ...current,
      ...updates,
      id: patientId,
    };

    const response = await apiClient.put(`/fhir/Patient/${patientId}`, updated);
    return response.data;
  },

  /**
   * Delete a patient
   */
  async delete(patientId: string): Promise<void> {
    await apiClient.delete(`/fhir/Patient/${patientId}`);
  },
};

