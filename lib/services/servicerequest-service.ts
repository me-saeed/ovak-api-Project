/**
 * ServiceRequest Service
 * Handles ServiceRequest FHIR resource operations
 */

import apiClient from '../api-client';

export interface ServiceRequest {
  resourceType: 'ServiceRequest';
  id?: string;
  status: 'draft' | 'active' | 'on-hold' | 'revoked' | 'completed' | 'entered-in-error' | 'unknown';
  intent: 'proposal' | 'plan' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';
  category?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  }>;
  priority?: 'routine' | 'urgent' | 'asap' | 'stat';
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
  occurrenceDateTime?: string;
  occurrencePeriod?: {
    start?: string;
    end?: string;
  };
  authoredOn?: string;
  requester?: {
    reference: string;
    display?: string;
  };
  performer?: Array<{
    reference: string;
    display?: string;
  }>;
  locationReference?: Array<{
    reference: string;
    display?: string;
  }>;
  reasonCode?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  }>;
  reasonReference?: Array<{
    reference: string;
    display?: string;
  }>;
  note?: Array<{
    text?: string;
    time?: string;
    authorString?: string;
  }>;
  patientInstruction?: string;
}

export interface ServiceRequestSearchFilters {
  patient?: string;
  status?: string;
  intent?: string;
  category?: string;
  _count?: number;
}

export const serviceRequestService = {
  /**
   * Search for service requests
   */
  async search(filters: ServiceRequestSearchFilters = {}): Promise<ServiceRequest[]> {
    const params = new URLSearchParams();
    
    if (filters.patient) params.append('subject', filters.patient);
    if (filters.status) params.append('status', filters.status);
    if (filters.intent) params.append('intent', filters.intent);
    if (filters.category) params.append('category', filters.category);
    if (filters._count) params.append('_count', filters._count.toString());
    
    const response = await apiClient.get(`/fhir/ServiceRequest?${params.toString()}`);
    return response.data.entry?.map((entry: any) => entry.resource) || [];
  },

  /**
   * Get service requests for a specific patient
   */
  async getByPatient(patientId: string): Promise<ServiceRequest[]> {
    return this.search({ patient: `Patient/${patientId}`, _count: 50 });
  },

  /**
   * Get service request by ID
   */
  async getById(serviceRequestId: string): Promise<ServiceRequest> {
    const response = await apiClient.get(`/fhir/ServiceRequest/${serviceRequestId}`);
    return response.data;
  },

  /**
   * Create a new service request
   */
  async create(serviceRequestData: Partial<ServiceRequest>): Promise<ServiceRequest> {
    const fhirServiceRequest: ServiceRequest = {
      resourceType: 'ServiceRequest',
      status: serviceRequestData.status || 'active',
      intent: serviceRequestData.intent || 'order',
      category: serviceRequestData.category,
      priority: serviceRequestData.priority,
      code: serviceRequestData.code || {
        text: 'Service Request',
      },
      subject: serviceRequestData.subject || { reference: '' },
      encounter: serviceRequestData.encounter,
      occurrenceDateTime: serviceRequestData.occurrenceDateTime,
      occurrencePeriod: serviceRequestData.occurrencePeriod,
      authoredOn: serviceRequestData.authoredOn || new Date().toISOString(),
      requester: serviceRequestData.requester,
      performer: serviceRequestData.performer,
      locationReference: serviceRequestData.locationReference,
      reasonCode: serviceRequestData.reasonCode,
      reasonReference: serviceRequestData.reasonReference,
      note: serviceRequestData.note,
      patientInstruction: serviceRequestData.patientInstruction,
    };

    const response = await apiClient.post('/fhir/ServiceRequest', fhirServiceRequest);
    return response.data;
  },

  /**
   * Update a service request
   */
  async update(serviceRequestId: string, updates: Partial<ServiceRequest>): Promise<ServiceRequest> {
    const current = await this.getById(serviceRequestId);
    const updated: ServiceRequest = {
      ...current,
      ...updates,
      id: serviceRequestId,
    };

    const response = await apiClient.put(`/fhir/ServiceRequest/${serviceRequestId}`, updated);
    return response.data;
  },

  /**
   * Complete a service request
   */
  async complete(serviceRequestId: string): Promise<ServiceRequest> {
    return this.update(serviceRequestId, {
      status: 'completed',
    });
  },

  /**
   * Cancel a service request
   */
  async cancel(serviceRequestId: string): Promise<ServiceRequest> {
    return this.update(serviceRequestId, {
      status: 'revoked',
    });
  },
};

