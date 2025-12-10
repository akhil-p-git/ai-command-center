import { useQuery } from '@tanstack/react-query';
import { workflowsApi } from '../api/workflows';

export const useWorkflows = () => useQuery({
  queryKey: ['workflows'],
  queryFn: () => workflowsApi.getList().then(r => r.data)
});

export const useWorkflow = (id: string) => useQuery({
  queryKey: ['workflows', id],
  queryFn: () => workflowsApi.getById(id).then(r => r.data),
  enabled: !!id
});

export const useWorkflowExecutions = (id: string, page: number = 0, status?: string) => useQuery({
  queryKey: ['workflows', id, 'executions', page, status],
  queryFn: () => workflowsApi.getExecutions(id, { skip: page * 20, limit: 20, status }).then(r => r.data),
  enabled: !!id
});

