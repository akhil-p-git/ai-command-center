import { apiClient } from './client';

export interface OverviewMetrics {
  totalConversations: number;
  successRate: number;
  avgLatencyMs: number;
  activeAgents: number;
  trends: {
    conversations: { value: string; direction: 'up' | 'down' | 'neutral' };
    successRate: { value: string; direction: 'up' | 'down' | 'neutral' };
    latency: { value: string; direction: 'up' | 'down' | 'neutral' };
    activeAgents: { value: string; direction: 'up' | 'down' | 'neutral' };
  };
}

export interface TimeseriesPoint {
  timestamp: string;
  value: number;
}

export interface TimeseriesResponse {
  metric: string;
  period: string;
  data: TimeseriesPoint[];
}

export const metricsApi = {
  getOverview: () => apiClient.get<OverviewMetrics>('/metrics/overview'),
  
  getTimeseries: (metric: string, period: string) =>
    apiClient.get<TimeseriesResponse>(`/metrics/timeseries?metric=${metric}&period=${period}`)
};

