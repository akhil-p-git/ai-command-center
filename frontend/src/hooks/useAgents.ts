import { useQuery } from '@tanstack/react-query';
import { agentsApi } from '../api/agents';

export const useAgents = () => useQuery({
  queryKey: ['agents'],
  queryFn: () => agentsApi.getList().then(r => r.data)
});

export const useAgent = (id: string) => useQuery({
  queryKey: ['agents', id],
  queryFn: () => agentsApi.getById(id).then(r => r.data),
  enabled: !!id
});

export const useAgentRuns = (id: string, page: number = 0) => useQuery({
  queryKey: ['agents', id, 'runs', page],
  queryFn: () => agentsApi.getRuns(id, { skip: page * 20, limit: 20 }).then(r => r.data),
  enabled: !!id
});

