import { apiClient } from './client';

export interface ConversationFilters {
  status?: string;
  agentId?: string;
  limit?: number;
  offset?: number;
}

export interface Conversation {
  id: string;
  title: string;
  status: 'active' | 'completed' | 'failed';
  agent_id: string;
  created_at: string;
  updated_at: string;
  // Add other fields as needed
}

export interface ConversationListResponse {
  items: Conversation[];
  total: number;
  page: number;
  size: number;
}

export interface ConversationDetail extends Conversation {
  messages: any[]; // Define Message type if needed
}

export const conversationsApi = {
  getList: (params?: ConversationFilters) =>
    apiClient.get<ConversationListResponse>('/conversations', { params }),

  getById: (id: string) => apiClient.get<ConversationDetail>(`/conversations/${id}`)
};

