/**
 * Observation Service
 * Handles all Observation FHIR resource operations
 */

import apiClient from '../api-client';

export interface Observation {
  resourceType: 'Observation';
  id?: string;
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown';
  code: {
    coding: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  };
  subject: {
    reference: string;
    display?: string;
  };
  effectiveDateTime?: string;
  valueQuantity?: {
    value: number;
    unit?: string;
    system?: string;
    code?: string;
  };
  valueString?: string;
  valueCodeableConcept?: {
    coding: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  };
  performer?: Array<{
    reference: string;
    display?: string;
  }>;
}

export interface ObservationSearchFilters {
  subject?: string;
  code?: string;
  date?: string;
  _count?: number;
}

export const observationService = {
  /**
   * Search for observations
   */
  async search(filters: ObservationSearchFilters = {}): Promise<Observation[]> {
    const params = new URLSearchParams();
    
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.code) params.append('code', filters.code);
    if (filters.date) params.append('date', filters.date);
    if (filters._count) params.append('_count', filters._count.toString());
    
    const response = await apiClient.get(`/fhir/Observation?${params.toString()}`);
    return response.data.entry?.map((entry: any) => entry.resource) || [];
  },

  /**
   * Get observations for a specific patient
   */
  async getByPatient(patientId: string): Promise<Observation[]> {
    return this.search({ subject: `Patient/${patientId}`, _count: 50 });
  },

  /**
   * Get observation by ID
   */
  async getById(observationId: string): Promise<Observation> {
    const response = await apiClient.get(`/fhir/Observation/${observationId}`);
    return response.data;
  },

  /**
   * Create a new observation
   */
  async create(observationData: Partial<Observation>): Promise<Observation> {
    const fhirObservation: Observation = {
      resourceType: 'Observation',
      status: observationData.status || 'final',
      code: observationData.code || {
        coding: [{
          system: 'http://loinc.org',
          code: '',
          display: '',
        }],
      },
      subject: observationData.subject || { reference: '' },
      effectiveDateTime: observationData.effectiveDateTime || new Date().toISOString(),
      valueQuantity: observationData.valueQuantity,
      valueString: observationData.valueString,
      valueCodeableConcept: observationData.valueCodeableConcept,
      performer: observationData.performer,
    };

    const response = await apiClient.post('/fhir/Observation', fhirObservation);
    return response.data;
  },

  /**
   * Update an observation
   */
  async update(observationId: string, updates: Partial<Observation>): Promise<Observation> {
    const current = await this.getById(observationId);
    const updated: Observation = {
      ...current,
      ...updates,
      id: observationId,
    };

    const response = await apiClient.put(`/fhir/Observation/${observationId}`, updated);
    return response.data;
  },
};

