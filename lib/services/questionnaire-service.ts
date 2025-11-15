/**
 * Questionnaire Service
 * Handles Questionnaire and QuestionnaireResponse FHIR resources
 */

import apiClient from '../api-client';

export interface Questionnaire {
  resourceType: 'Questionnaire';
  id?: string;
  title?: string;
  status: 'draft' | 'active' | 'retired' | 'unknown';
  item?: Array<{
    linkId: string;
    text?: string;
    type: string;
    required?: boolean;
    answerOption?: Array<{
      valueCoding?: {
        code: string;
        display: string;
      };
      valueString?: string;
    }>;
  }>;
}

export interface QuestionnaireResponse {
  resourceType: 'QuestionnaireResponse';
  id?: string;
  status: 'in-progress' | 'completed' | 'amended' | 'entered-in-error' | 'stopped';
  questionnaire: string;
  subject?: {
    reference: string;
    display?: string;
  };
  item?: Array<{
    linkId: string;
    answer?: Array<{
      valueString?: string;
      valueCoding?: {
        code: string;
        display: string;
      };
    }>;
  }>;
}

export const questionnaireService = {
  /**
   * Search for questionnaires
   */
  async search(): Promise<Questionnaire[]> {
    const response = await apiClient.get('/fhir/Questionnaire?_count=50');
    return response.data.entry?.map((entry: any) => entry.resource) || [];
  },

  /**
   * Get questionnaire by ID
   */
  async getById(questionnaireId: string): Promise<Questionnaire> {
    const response = await apiClient.get(`/fhir/Questionnaire/${questionnaireId}`);
    return response.data;
  },

  /**
   * Create a new questionnaire
   */
  async create(questionnaireData: Partial<Questionnaire>): Promise<Questionnaire> {
    const fhirQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: questionnaireData.status || 'draft',
      title: questionnaireData.title,
      item: questionnaireData.item || [],
    };

    const response = await apiClient.post('/fhir/Questionnaire', fhirQuestionnaire);
    return response.data;
  },

  /**
   * Update a questionnaire
   */
  async update(questionnaireId: string, updates: Partial<Questionnaire>): Promise<Questionnaire> {
    const current = await this.getById(questionnaireId);
    const updated: Questionnaire = {
      ...current,
      ...updates,
      id: questionnaireId,
    };

    const response = await apiClient.put(`/fhir/Questionnaire/${questionnaireId}`, updated);
    return response.data;
  },

  /**
   * Get responses for a specific patient
   */
  async getResponsesByPatient(patientId: string): Promise<QuestionnaireResponse[]> {
    const response = await apiClient.get(
      `/fhir/QuestionnaireResponse?subject=Patient/${patientId}&_count=50`
    );
    return response.data.entry?.map((entry: any) => entry.resource) || [];
  },

  /**
   * Submit questionnaire response
   */
  async submitResponse(
    questionnaireId: string,
    patientId: string,
    answers: Array<{ questionId: string; value: string }>
  ): Promise<QuestionnaireResponse> {
    const response: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      questionnaire: `Questionnaire/${questionnaireId}`,
      subject: {
        reference: `Patient/${patientId}`,
      },
      item: answers.map((answer) => ({
        linkId: answer.questionId,
        answer: [{
          valueString: answer.value,
        }],
      })),
    };

    const apiResponse = await apiClient.post('/fhir/QuestionnaireResponse', response);
    return apiResponse.data;
  },

  /**
   * Get responses for a questionnaire
   */
  async getResponses(questionnaireId: string): Promise<QuestionnaireResponse[]> {
    const response = await apiClient.get(
      `/fhir/QuestionnaireResponse?questionnaire=Questionnaire/${questionnaireId}&_count=50`
    );
    return response.data.entry?.map((entry: any) => entry.resource) || [];
  },
};

