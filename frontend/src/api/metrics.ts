import { apiClient } from './client';

// Matches backend schema (snake_case from API)
export interface OverviewMetricsResponse {
  total_conversations: number;
  total_requests: number;
  success_rate: number;
  avg_latency_ms: number;
  error_rate: number;
  tokens_used: number;
  estimated_cost_usd: number;
  active_agents: number;
}

// Frontend-friendly version (camelCase)
export interface OverviewMetrics {
  totalConversations: number;
  totalRequests: number;
  successRate: number;
  avgLatencyMs: number;
  errorRate: number;
  tokensUsed: number;
  estimatedCostUsd: number;
  activeAgents: number;
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

// Transform snake_case response to camelCase
const transformMetrics = (data: OverviewMetricsResponse): OverviewMetrics => ({
  totalConversations: data.total_conversations,
  totalRequests: data.total_requests,
  successRate: data.success_rate,
  avgLatencyMs: data.avg_latency_ms,
  errorRate: data.error_rate,
  tokensUsed: data.tokens_used,
  estimatedCostUsd: data.estimated_cost_usd,
  activeAgents: data.active_agents,
});

export const metricsApi = {
  getOverview: () => apiClient.get<OverviewMetricsResponse>('/metrics/overview')
    .then(res => ({ ...res, data: transformMetrics(res.data) })),

  getTimeseries: (metric: string, period: string) =>
    apiClient.get<TimeseriesResponse>(`/metrics/timeseries?metric=${metric}&period=${period}`)
};

