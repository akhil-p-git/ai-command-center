import { apiClient } from './client';
import { Collection, QueryResponse } from '../types';

export interface CollectionListResponse {
  items: Collection[];
  total: number;
}

export const knowledgeApi = {
  getCollections: () => apiClient.get<CollectionListResponse>('/knowledge/collections'),
  
  getCollection: (id: string) => apiClient.get<Collection>(`/knowledge/collections/${id}`),
  
  createCollection: (data: { name: string; description?: string }) =>
    apiClient.post<Collection>('/knowledge/collections', data),
    
  ingestDocument: (collectionId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/knowledge/collections/${collectionId}/ingest`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  query: (data: { collection_id: string; query: string; n_results?: number }) =>
    apiClient.post<QueryResponse>('/knowledge/query', data)
};

