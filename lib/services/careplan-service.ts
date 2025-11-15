/**
 * CarePlan Service
 * Handles CarePlan FHIR resource operations
 */

import apiClient from '../api-client';

export interface CarePlan {
  resourceType: 'CarePlan';
  id?: string;
  status: 'draft' | 'active' | 'on-hold' | 'revoked' | 'completed' | 'entered-in-error' | 'unknown';
  intent: 'proposal' | 'plan' | 'order' | 'option';
  category?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  }>;
  title?: string;
  description?: string;
  subject: {
    reference: string;
    display?: string;
  };
  encounter?: {
    reference: string;
    display?: string;
  };
  period?: {
    start?: string;
    end?: string;
  };
  created?: string;
  author?: {
    reference: string;
    display?: string;
  };
  addresses?: Array<{
    reference: string;
    display?: string;
  }>;
  goal?: Array<{
    reference?: string;
    display?: string;
  }>;
  activity?: Array<{
    id?: string;
    detail?: {
      kind?: 'Appointment' | 'CommunicationRequest' | 'DeviceRequest' | 'MedicationRequest' | 'NutritionOrder' | 'Task' | 'ServiceRequest' | 'VisionPrescription';
      code?: {
        coding?: Array<{
          system?: string;
          code?: string;
          display?: string;
        }>;
        text?: string;
      };
      status?: 'not-started' | 'scheduled' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled' | 'stopped' | 'unknown' | 'entered-in-error';
      statusReason?: {
        text?: string;
      };
      prohibited?: boolean;
      scheduledPeriod?: {
        start?: string;
        end?: string;
      };
      location?: {
        reference: string;
        display?: string;
      };
      performer?: Array<{
        reference: string;
        display?: string;
      }>;
      productCodeableConcept?: {
        coding?: Array<{
          system?: string;
          code?: string;
          display?: string;
        }>;
        text?: string;
      };
      dailyAmount?: {
        value?: number;
        unit?: string;
      };
      quantity?: {
        value?: number;
        unit?: string;
      };
      description?: string;
    };
  }>;
  note?: Array<{
    text?: string;
    time?: string;
    authorString?: string;
  }>;
}

export interface CarePlanSearchFilters {
  patient?: string;
  status?: string;
  category?: string;
  _count?: number;
}

export const carePlanService = {
  /**
   * Search for care plans
   */
  async search(filters: CarePlanSearchFilters = {}): Promise<CarePlan[]> {
    const params = new URLSearchParams();
    
    if (filters.patient) params.append('subject', filters.patient);
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters._count) params.append('_count', filters._count.toString());
    
    const response = await apiClient.get(`/fhir/CarePlan?${params.toString()}`);
    return response.data.entry?.map((entry: any) => entry.resource) || [];
  },

  /**
   * Get care plans for a specific patient
   */
  async getByPatient(patientId: string): Promise<CarePlan[]> {
    return this.search({ patient: `Patient/${patientId}`, _count: 50 });
  },

  /**
   * Get care plan by ID
   */
  async getById(carePlanId: string): Promise<CarePlan> {
    const response = await apiClient.get(`/fhir/CarePlan/${carePlanId}`);
    return response.data;
  },

  /**
   * Create a new care plan
   */
  async create(carePlanData: Partial<CarePlan>): Promise<CarePlan> {
    const fhirCarePlan: CarePlan = {
      resourceType: 'CarePlan',
      status: carePlanData.status || 'active',
      intent: carePlanData.intent || 'plan',
      category: carePlanData.category,
      title: carePlanData.title,
      description: carePlanData.description,
      subject: carePlanData.subject || { reference: '' },
      encounter: carePlanData.encounter,
      period: carePlanData.period,
      created: carePlanData.created || new Date().toISOString(),
      author: carePlanData.author,
      addresses: carePlanData.addresses,
      goal: carePlanData.goal,
      activity: carePlanData.activity,
      note: carePlanData.note,
    };

    const response = await apiClient.post('/fhir/CarePlan', fhirCarePlan);
    return response.data;
  },

  /**
   * Update a care plan
   */
  async update(carePlanId: string, updates: Partial<CarePlan>): Promise<CarePlan> {
    const current = await this.getById(carePlanId);
    const updated: CarePlan = {
      ...current,
      ...updates,
      id: carePlanId,
    };

    const response = await apiClient.put(`/fhir/CarePlan/${carePlanId}`, updated);
    return response.data;
  },

  /**
   * Complete a care plan
   */
  async complete(carePlanId: string): Promise<CarePlan> {
    return this.update(carePlanId, {
      status: 'completed',
      period: {
        ...(await this.getById(carePlanId)).period,
        end: new Date().toISOString(),
      },
    });
  },
};

