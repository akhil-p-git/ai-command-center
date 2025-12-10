import { apiClient } from './client';
import { AgentStep } from '../types';

export interface ChatRequest {
  message: string;
  agent_id?: string;
  conversation_id?: string;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  agent_id: string;
  steps: AgentStep[];
  tokens_used: number;
  latency_ms: number;
}

export const chatApi = {
  send: (data: ChatRequest) => apiClient.post<ChatResponse>('/chat', data)
};

