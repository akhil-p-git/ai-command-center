import { useQuery } from '@tanstack/react-query';
import { metricsApi } from '../api/metrics';

export const useOverviewMetrics = () => useQuery({
  queryKey: ['metrics', 'overview'],
  queryFn: () => metricsApi.getOverview().then(r => r.data),
  refetchInterval: 30000 // Refresh every 30s
});

export const useTimeseries = (metric: string, period: string) => useQuery({
  queryKey: ['metrics', 'timeseries', metric, period],
  queryFn: () => metricsApi.getTimeseries(metric, period).then(r => r.data)
});

