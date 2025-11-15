/**
 * Dashboard Service
 * Aggregates data for dashboard view
 */

import apiClient from '../api-client';

export interface DashboardStats {
  totalPatients: number;
  totalObservations: number;
  totalAppointments: number;
  recentPatients: any[];
  recentObservations: any[];
}

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    try {
      // Fetch all data in parallel
      const [patientsRes, observationsRes, appointmentsRes] = await Promise.all([
        apiClient.get('/fhir/Patient?_count=1&_total=accurate'),
        apiClient.get('/fhir/Observation?_count=1&_total=accurate'),
        apiClient.get('/fhir/Appointment?_count=1&_total=accurate').catch(() => ({ data: { total: 0 } })),
      ]);

      // Get recent patients
      const recentPatientsRes = await apiClient.get('/fhir/Patient?_count=5&_sort=-_lastUpdated');
      const recentPatients = recentPatientsRes.data.entry?.map((entry: any) => entry.resource) || [];

      // Get recent observations
      const recentObservationsRes = await apiClient.get('/fhir/Observation?_count=5&_sort=-_lastUpdated');
      const recentObservations = recentObservationsRes.data.entry?.map((entry: any) => entry.resource) || [];

      return {
        totalPatients: patientsRes.data.total || 0,
        totalObservations: observationsRes.data.total || 0,
        totalAppointments: appointmentsRes.data.total || 0,
        recentPatients,
        recentObservations,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalPatients: 0,
        totalObservations: 0,
        totalAppointments: 0,
        recentPatients: [],
        recentObservations: [],
      };
    }
  },
};

