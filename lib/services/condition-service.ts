/**
 * Condition Service
 * Handles Condition FHIR resource operations
 */

import apiClient from '../api-client';

export interface Condition {
  resourceType: 'Condition';
  id?: string;
  clinicalStatus?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  verificationStatus?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  category?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  }>;
  severity?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  code: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  subject: {
    reference: string;
    display?: string;
  };
  encounter?: {
    reference: string;
    display?: string;
  };
  onsetDateTime?: string;
  abatementDateTime?: string;
  recordedDate?: string;
  recorder?: {
    reference: string;
    display?: string;
  };
  note?: Array<{
    text?: string;
    authorString?: string;
    time?: string;
  }>;
}

export interface ConditionSearchFilters {
  patient?: string;
  category?: string;
  clinicalStatus?: string;
  _count?: number;
}

export const conditionService = {
  /**
   * Search for conditions
   */
  async search(filters: ConditionSearchFilters = {}): Promise<Condition[]> {
    const params = new URLSearchParams();
    
    if (filters.patient) params.append('subject', filters.patient);
    if (filters.category) params.append('category', filters.category);
    if (filters.clinicalStatus) params.append('clinical-status', filters.clinicalStatus);
    if (filters._count) params.append('_count', filters._count.toString());
    
    const response = await apiClient.get(`/fhir/Condition?${params.toString()}`);
    return response.data.entry?.map((entry: any) => entry.resource) || [];
  },

  /**
   * Get conditions for a specific patient
   */
  async getByPatient(patientId: string): Promise<Condition[]> {
    return this.search({ patient: `Patient/${patientId}`, _count: 50 });
  },

  /**
   * Get condition by ID
   */
  async getById(conditionId: string): Promise<Condition> {
    const response = await apiClient.get(`/fhir/Condition/${conditionId}`);
    return response.data;
  },

  /**
   * Create a new condition
   */
  async create(conditionData: Partial<Condition>): Promise<Condition> {
    const fhirCondition: Condition = {
      resourceType: 'Condition',
      clinicalStatus: conditionData.clinicalStatus || {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: 'active',
          display: 'Active',
        }],
        text: 'Active',
      },
      verificationStatus: conditionData.verificationStatus || {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
          code: 'confirmed',
          display: 'Confirmed',
        }],
        text: 'Confirmed',
      },
      category: conditionData.category,
      severity: conditionData.severity,
      code: conditionData.code || {
        text: 'Condition',
      },
      subject: conditionData.subject || { reference: '' },
      encounter: conditionData.encounter,
      onsetDateTime: conditionData.onsetDateTime,
      abatementDateTime: conditionData.abatementDateTime,
      recordedDate: conditionData.recordedDate || new Date().toISOString(),
      recorder: conditionData.recorder,
      note: conditionData.note,
    };

    const response = await apiClient.post('/fhir/Condition', fhirCondition);
    return response.data;
  },

  /**
   * Update a condition
   */
  async update(conditionId: string, updates: Partial<Condition>): Promise<Condition> {
    const current = await this.getById(conditionId);
    const updated: Condition = {
      ...current,
      ...updates,
      id: conditionId,
    };

    const response = await apiClient.put(`/fhir/Condition/${conditionId}`, updated);
    return response.data;
  },

  /**
   * Resolve a condition (mark as resolved)
   */
  async resolve(conditionId: string): Promise<Condition> {
    return this.update(conditionId, {
      clinicalStatus: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: 'resolved',
          display: 'Resolved',
        }],
        text: 'Resolved',
      },
      abatementDateTime: new Date().toISOString(),
    });
  },
};

