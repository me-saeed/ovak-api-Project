/**
 * Encounter Service
 * Handles Encounter FHIR resource operations
 */

import apiClient from '../api-client';

export interface Encounter {
  resourceType: 'Encounter';
  id?: string;
  status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled' | 'entered-in-error' | 'unknown';
  class: {
    system?: string;
    code: string;
    display?: string;
  };
  type?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  }>;
  subject?: {
    reference: string;
    display?: string;
  };
  participant?: Array<{
    individual?: {
      reference: string;
      display?: string;
    };
    type?: Array<{
      coding?: Array<{
        code?: string;
        display?: string;
      }>;
    }>;
  }>;
  period?: {
    start?: string;
    end?: string;
  };
  length?: {
    value?: number;
    unit?: string;
    system?: string;
    code?: string;
  };
  reasonCode?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  }>;
  diagnosis?: Array<{
    condition?: {
      reference: string;
      display?: string;
    };
    use?: {
      coding?: Array<{
        code?: string;
        display?: string;
      }>;
    };
  }>;
  serviceType?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  };
}

export interface EncounterSearchFilters {
  patient?: string;
  practitioner?: string;
  date?: string;
  status?: string;
  _count?: number;
}

export const encounterService = {
  /**
   * Search for encounters
   */
  async search(filters: EncounterSearchFilters = {}): Promise<Encounter[]> {
    const params = new URLSearchParams();
    
    if (filters.patient) params.append('patient', filters.patient);
    if (filters.practitioner) params.append('practitioner', filters.practitioner);
    if (filters.date) params.append('date', filters.date);
    if (filters.status) params.append('status', filters.status);
    if (filters._count) params.append('_count', filters._count.toString());
    
    const response = await apiClient.get(`/fhir/Encounter?${params.toString()}`);
    return response.data.entry?.map((entry: any) => entry.resource) || [];
  },

  /**
   * Get encounters for a specific patient
   */
  async getByPatient(patientId: string): Promise<Encounter[]> {
    return this.search({ patient: `Patient/${patientId}`, _count: 50 });
  },

  /**
   * Get encounters for a specific practitioner
   */
  async getByPractitioner(practitionerId: string): Promise<Encounter[]> {
    return this.search({ practitioner: `Practitioner/${practitionerId}`, _count: 50 });
  },

  /**
   * Get encounter by ID
   */
  async getById(encounterId: string): Promise<Encounter> {
    const response = await apiClient.get(`/fhir/Encounter/${encounterId}`);
    return response.data;
  },

  /**
   * Create a new encounter
   */
  async create(encounterData: Partial<Encounter>): Promise<Encounter> {
    const fhirEncounter: Encounter = {
      resourceType: 'Encounter',
      status: encounterData.status || 'in-progress',
      class: encounterData.class || {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'AMB',
        display: 'ambulatory',
      },
      type: encounterData.type,
      subject: encounterData.subject,
      participant: encounterData.participant || [],
      period: encounterData.period,
      length: encounterData.length,
      reasonCode: encounterData.reasonCode,
      diagnosis: encounterData.diagnosis,
      serviceType: encounterData.serviceType,
    };

    const response = await apiClient.post('/fhir/Encounter', fhirEncounter);
    return response.data;
  },

  /**
   * Update an encounter
   */
  async update(encounterId: string, updates: Partial<Encounter>): Promise<Encounter> {
    const current = await this.getById(encounterId);
    const updated: Encounter = {
      ...current,
      ...updates,
      id: encounterId,
    };

    const response = await apiClient.put(`/fhir/Encounter/${encounterId}`, updated);
    return response.data;
  },

  /**
   * Finish an encounter
   */
  async finish(encounterId: string): Promise<Encounter> {
    return this.update(encounterId, { status: 'finished' });
  },

  /**
   * Cancel an encounter
   */
  async cancel(encounterId: string): Promise<Encounter> {
    return this.update(encounterId, { status: 'cancelled' });
  },
};

