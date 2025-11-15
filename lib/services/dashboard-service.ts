/**
 * Dashboard Service
 * Aggregates data for dashboard view
 */

import apiClient from '../api-client';

export interface DashboardStats {
  totalPatients: number;
  totalObservations: number;
  totalAppointments: number;
  totalEncounters: number;
  totalConditions: number;
  totalCarePlans: number;
  totalQuestionnaires: number;
  totalDocuments: number;
  recentPatients: any[];
  recentObservations: any[];
  recentAppointments: any[];
  recentEncounters: any[];
  recentConditions: any[];
  recentCarePlans: any[];
  recentQuestionnaires: any[];
  recentDocuments: any[];
}

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    try {
      // Fetch all data in parallel
      const [
        patientsRes,
        observationsRes,
        appointmentsRes,
        encountersRes,
        conditionsRes,
        carePlansRes,
        questionnairesRes,
        documentsRes,
      ] = await Promise.all([
        apiClient.get('/fhir/Patient?_count=1&_total=accurate'),
        apiClient.get('/fhir/Observation?_count=1&_total=accurate'),
        apiClient.get('/fhir/Appointment?_count=1&_total=accurate').catch(() => ({ data: { total: 0 } })),
        apiClient.get('/fhir/Encounter?_count=1&_total=accurate').catch(() => ({ data: { total: 0 } })),
        apiClient.get('/fhir/Condition?_count=1&_total=accurate').catch(() => ({ data: { total: 0 } })),
        apiClient.get('/fhir/CarePlan?_count=1&_total=accurate').catch(() => ({ data: { total: 0 } })),
        apiClient.get('/fhir/Questionnaire?_count=1&_total=accurate').catch(() => ({ data: { total: 0 } })),
        apiClient.get('/fhir/DocumentReference?_count=1&_total=accurate').catch(() => ({ data: { total: 0 } })),
      ]);

      // Get recent resources
      const [
        recentPatientsRes,
        recentObservationsRes,
        recentAppointmentsRes,
        recentEncountersRes,
        recentConditionsRes,
        recentCarePlansRes,
        recentQuestionnairesRes,
        recentDocumentsRes,
      ] = await Promise.all([
        apiClient.get('/fhir/Patient?_count=5&_sort=-_lastUpdated'),
        apiClient.get('/fhir/Observation?_count=5&_sort=-_lastUpdated'),
        apiClient.get('/fhir/Appointment?_count=5&_sort=-_lastUpdated').catch(() => ({ data: { entry: [] } })),
        apiClient.get('/fhir/Encounter?_count=5&_sort=-_lastUpdated').catch(() => ({ data: { entry: [] } })),
        apiClient.get('/fhir/Condition?_count=5&_sort=-_lastUpdated').catch(() => ({ data: { entry: [] } })),
        apiClient.get('/fhir/CarePlan?_count=5&_sort=-_lastUpdated').catch(() => ({ data: { entry: [] } })),
        apiClient.get('/fhir/Questionnaire?_count=5&_sort=-_lastUpdated').catch(() => ({ data: { entry: [] } })),
        apiClient.get('/fhir/DocumentReference?_count=5&_sort=-_lastUpdated').catch(() => ({ data: { entry: [] } })),
      ]);

      return {
        totalPatients: patientsRes.data.total || 0,
        totalObservations: observationsRes.data.total || 0,
        totalAppointments: appointmentsRes.data.total || 0,
        totalEncounters: encountersRes.data.total || 0,
        totalConditions: conditionsRes.data.total || 0,
        totalCarePlans: carePlansRes.data.total || 0,
        totalQuestionnaires: questionnairesRes.data.total || 0,
        totalDocuments: documentsRes.data.total || 0,
        recentPatients: recentPatientsRes.data.entry?.map((entry: any) => entry.resource) || [],
        recentObservations: recentObservationsRes.data.entry?.map((entry: any) => entry.resource) || [],
        recentAppointments: recentAppointmentsRes.data.entry?.map((entry: any) => entry.resource) || [],
        recentEncounters: recentEncountersRes.data.entry?.map((entry: any) => entry.resource) || [],
        recentConditions: recentConditionsRes.data.entry?.map((entry: any) => entry.resource) || [],
        recentCarePlans: recentCarePlansRes.data.entry?.map((entry: any) => entry.resource) || [],
        recentQuestionnaires: recentQuestionnairesRes.data.entry?.map((entry: any) => entry.resource) || [],
        recentDocuments: recentDocumentsRes.data.entry?.map((entry: any) => entry.resource) || [],
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalPatients: 0,
        totalObservations: 0,
        totalAppointments: 0,
        totalEncounters: 0,
        totalConditions: 0,
        totalCarePlans: 0,
        totalQuestionnaires: 0,
        totalDocuments: 0,
        recentPatients: [],
        recentObservations: [],
        recentAppointments: [],
        recentEncounters: [],
        recentConditions: [],
        recentCarePlans: [],
        recentQuestionnaires: [],
        recentDocuments: [],
      };
    }
  },
};

