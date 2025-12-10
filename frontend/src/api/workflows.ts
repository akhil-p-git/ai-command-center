import { apiClient } from './client';
import { Workflow, WorkflowExecution } from '../types';

export interface WorkflowListResponse {
  items: Workflow[];
  total: number;
}

export interface WorkflowDetail extends Workflow {
  // Add detail specific fields if any
}

export interface WorkflowExecutionListResponse {
  items: WorkflowExecution[];
  total: number;
  skip: number;
  limit: number;
}

export const workflowsApi = {
  getList: () => apiClient.get<WorkflowListResponse>('/workflows'),
  
  getById: (id: string) => apiClient.get<WorkflowDetail>(`/workflows/${id}`),
  
  getExecutions: (id: string, params?: { skip?: number; limit?: number; status?: string }) =>
    apiClient.get<WorkflowExecutionListResponse>(`/workflows/${id}/runs`, { params }),
    
  create: (data: { name: string; trigger_type: string; n8n_workflow_id?: string }) =>
    apiClient.post<Workflow>('/workflows', data)
};

