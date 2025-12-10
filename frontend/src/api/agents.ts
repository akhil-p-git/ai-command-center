import { apiClient } from './client';
import { Agent, AgentRun } from '../types';

export interface AgentListResponse {
  items: Agent[];
  total: number;
}

export interface AgentRunListResponse {
  items: AgentRun[];
  total: number;
  skip: number;
  limit: number;
}

export interface AgentStats {
  totalRuns: number;
  successRate: number;
  avgLatencyMs: number;
  totalTokens: number;
}

export interface AgentDetail extends Agent {
  stats?: AgentStats;
  total_runs?: number; // Backend might return snake_case
}

export const agentsApi = {
  getList: () => apiClient.get<AgentListResponse>('/agents'),
  
  getById: (id: string) => apiClient.get<AgentDetail>(`/agents/${id}`),
  
  getRuns: (id: string, params?: { skip?: number; limit?: number }) =>
    apiClient.get<AgentRunListResponse>(`/agents/${id}/runs`, { params })
};

