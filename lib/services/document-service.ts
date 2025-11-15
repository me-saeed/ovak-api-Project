/**
 * Document Service
 * Handles document uploads and DocumentReference FHIR resources
 */

import apiClient from '../api-client';

export interface DocumentUploadResponse {
  id: string;
  url: string;
  contentType?: string;
  size?: number;
  publicUrl?: string;
  credentials?: {
    public?: string;
    private?: string;
  };
}

export interface DocumentReference {
  resourceType: 'DocumentReference';
  id?: string;
  status: 'current' | 'superseded' | 'entered-in-error';
  type?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  subject?: {
    reference: string;
    display?: string;
  };
  date?: string;
  description?: string;
  content: Array<{
    attachment: {
      contentType?: string;
      url: string;
      title?: string;
      size?: number;
      hash?: string;
    };
  }>;
  context?: {
    encounter?: Array<{
      reference: string;
    }>;
    period?: {
      start?: string;
      end?: string;
    };
  };
}

export interface DocumentSearchFilters {
  patient?: string;
  type?: string;
  date?: string;
  _count?: number;
}

export const documentService = {
  /**
   * Upload a document using Binary FHIR resource
   * Since /documents/upload endpoint may not be available, we'll use Binary resource
   */
  async upload(file: File, metadata?: { title?: string; description?: string }): Promise<DocumentUploadResponse> {
    // Convert file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:application/pdf;base64,")
        const base64String = result.split(',')[1] || result;
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Create Binary FHIR resource
    const binaryResource = {
      resourceType: 'Binary',
      contentType: file.type || 'application/octet-stream',
      data: base64,
    };

    try {
      // Try to create Binary resource
      const response = await apiClient.post('/fhir/Binary', binaryResource);
      const binaryId = response.data.id;
      
      // Construct URL for the binary
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ovok.com';
      const binaryUrl = `${API_BASE_URL}/fhir/Binary/${binaryId}`;

      return {
        id: binaryId,
        url: binaryUrl,
        contentType: file.type,
        size: file.size,
      };
    } catch (error: any) {
      // If Binary creation fails, try the documents/upload endpoint as fallback
      console.warn('Binary upload failed, trying documents/upload endpoint:', error);
      
      const formData = new FormData();
      formData.append('file', file);
      if (metadata?.title) formData.append('title', metadata.title);
      if (metadata?.description) formData.append('description', metadata.description);

      const axios = (await import('axios')).default;
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ovok.com';
      
      let token = null;
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('accessToken');
      }

      const headers: any = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      try {
        const response = await axios.post(`${API_BASE_URL}/documents/upload`, formData, {
          headers,
        });
        return response.data;
      } catch (uploadError: any) {
        // If both fail, throw a helpful error
        throw new Error(
          `Document upload failed. The /documents/upload endpoint may not be available on this instance. ` +
          `Error: ${uploadError.response?.data?.message || uploadError.message}`
        );
      }
    }
  },

  /**
   * Search for documents
   */
  async searchDocuments(filters: { query?: string; _count?: number } = {}): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters.query) params.append('query', filters.query);
    if (filters._count) params.append('_count', filters._count.toString());

    const response = await apiClient.get(`/documents/search?${params.toString()}`);
    return response.data.entry || [];
  },

  /**
   * Get document by ID
   */
  async getDocument(documentId: string): Promise<any> {
    const response = await apiClient.get(`/documents/${documentId}`);
    return response.data;
  },

  /**
   * Get public document URL
   */
  getPublicUrl(documentId: string, credentials?: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ovok.com';
    if (credentials) {
      return `${baseUrl}/documents/${documentId}/public?credentials=${credentials}`;
    }
    return `${baseUrl}/documents/${documentId}/public`;
  },

  /**
   * Download a Binary resource
   */
  async downloadBinary(binaryUrl: string): Promise<Blob> {
    let token = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('accessToken');
    }

    if (!token) {
      throw new Error('Authentication required');
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ovok.com';
    const fullUrl = binaryUrl.startsWith('http') 
      ? binaryUrl 
      : `${API_BASE_URL}${binaryUrl.startsWith('/') ? '' : '/'}${binaryUrl}`;

    const response = await fetch(fullUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/octet-stream',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download: ${response.statusText}`);
    }

    return response.blob();
  },

  /**
   * Search DocumentReferences
   */
  async search(filters: DocumentSearchFilters = {}): Promise<DocumentReference[]> {
    const params = new URLSearchParams();
    
    if (filters.patient) params.append('subject', filters.patient);
    if (filters.type) params.append('type', filters.type);
    if (filters.date) params.append('date', filters.date);
    if (filters._count) params.append('_count', filters._count.toString());
    
    const response = await apiClient.get(`/fhir/DocumentReference?${params.toString()}`);
    return response.data.entry?.map((entry: any) => entry.resource) || [];
  },

  /**
   * Get documents for a specific patient
   */
  async getByPatient(patientId: string): Promise<DocumentReference[]> {
    return this.search({ patient: `Patient/${patientId}`, _count: 50 });
  },

  /**
   * Get DocumentReference by ID
   */
  async getById(documentReferenceId: string): Promise<DocumentReference> {
    const response = await apiClient.get(`/fhir/DocumentReference/${documentReferenceId}`);
    return response.data;
  },

  /**
   * Create a DocumentReference linking a document to a patient
   */
  async createReference(
    documentId: string,
    documentUrl: string,
    patientId: string,
    metadata?: {
      title?: string;
      description?: string;
      type?: string;
      contentType?: string;
      size?: number;
    }
  ): Promise<DocumentReference> {
    const fhirDocumentReference: DocumentReference = {
      resourceType: 'DocumentReference',
      status: 'current',
      type: metadata?.type ? {
        coding: [{
          system: 'http://loinc.org',
          code: metadata.type,
          display: metadata.type,
        }],
        text: metadata.type,
      } : undefined,
      subject: {
        reference: `Patient/${patientId}`,
      },
      date: new Date().toISOString(),
      description: metadata?.description,
      content: [{
        attachment: {
          contentType: metadata?.contentType || 'application/pdf',
          url: documentUrl,
          title: metadata?.title || 'Document',
          size: metadata?.size,
        },
      }],
    };

    const response = await apiClient.post('/fhir/DocumentReference', fhirDocumentReference);
    return response.data;
  },

  /**
   * Update a DocumentReference
   */
  async update(referenceId: string, updates: Partial<DocumentReference>): Promise<DocumentReference> {
    const current = await this.getById(referenceId);
    const updated: DocumentReference = {
      ...current,
      ...updates,
      id: referenceId,
    };

    const response = await apiClient.put(`/fhir/DocumentReference/${referenceId}`, updated);
    return response.data;
  },

  /**
   * Delete a DocumentReference
   */
  async delete(referenceId: string): Promise<void> {
    await apiClient.delete(`/fhir/DocumentReference/${referenceId}`);
  },
};

