import { useState, useEffect } from 'react';
import { OverviewMetrics, TimeseriesResponse } from '../api/metrics';
import { Activity } from '../components/dashboard/ActivityFeed';

// Mock Data Generator
export const useMockData = (useMock: boolean = true) => {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [requestsData, setRequestsData] = useState<TimeseriesResponse['data']>([]);
  const [errorsData, setErrorsData] = useState<TimeseriesResponse['data']>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!useMock) return;

    // Simulate API delay
    const timer = setTimeout(() => {
      // Mock KPI Metrics
      setMetrics({
        totalConversations: 1248,
        successRate: 94.2,
        avgLatencyMs: 320,
        activeAgents: 8,
        trends: {
          conversations: { value: '12%', direction: 'up' },
          successRate: { value: '2.1%', direction: 'up' },
          latency: { value: '5%', direction: 'down' }, // down is good for latency
          activeAgents: { value: '0', direction: 'neutral' }
        }
      });

      // Mock Charts Data
      const generateTimeseries = (base: number, variance: number, points: number = 12) => {
        const data = [];
        const now = new Date();
        for (let i = points - 1; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 60 * 60 * 1000); // Hourly points
          data.push({
            timestamp: time.toLocaleTimeString([], { hour: 'numeric', hour12: true }),
            value: Math.max(0, Math.floor(base + (Math.random() - 0.5) * variance))
          });
        }
        return data;
      };

      setRequestsData(generateTimeseries(150, 40));
      setErrorsData(generateTimeseries(5, 5));

      // Mock Activities
      setActivities([
        {
          id: '1',
          type: 'conversation',
          title: 'Customer Support Inquiry',
          status: 'completed',
          timestamp: '2 min ago',
          agentId: 'agent-1'
        },
        {
          id: '2',
          type: 'workflow',
          title: 'Order Processing',
          status: 'active',
          timestamp: '5 min ago',
          details: 'Step 3/5: Payment verification'
        },
        {
          id: '3',
          type: 'agent_run',
          title: 'Document Analysis',
          status: 'completed',
          timestamp: '12 min ago',
          agentId: 'doc-agent'
        },
        {
          id: '4',
          type: 'conversation',
          title: 'Product Recommendation',
          status: 'failed',
          timestamp: '25 min ago',
          agentId: 'sales-bot',
          details: 'Timeout waiting for inventory service'
        },
        {
          id: '5',
          type: 'agent_run',
          title: 'Daily Summary',
          status: 'completed',
          timestamp: '1 hour ago',
          agentId: 'summary-bot'
        }
      ]);

      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [useMock]);

  return { metrics, requestsData, errorsData, activities, loading };
};

