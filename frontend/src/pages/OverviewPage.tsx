import React from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Skeleton,
  Button,
  Alert
} from '@mui/material';
import {
  Chat as ChatIcon,
  CheckCircle as SuccessIcon,
  Speed as LatencyIcon,
  SmartToy as AgentIcon,
  Refresh as RefreshIcon,
  AttachMoney as CostIcon,
  Error as ErrorIcon,
  Token as TokenIcon
} from '@mui/icons-material';

import { KPICard } from '../components/dashboard/KPICard';
import { MetricsChart } from '../components/dashboard/MetricsChart';
import { useOverviewMetrics, useTimeseries } from '../hooks/useMetrics';

const OverviewPage: React.FC = () => {
  // Real API data
  const { data: metrics, isLoading: metricsLoading, error: metricsError, refetch } = useOverviewMetrics();
  const { data: requestsTimeseries, isLoading: requestsLoading } = useTimeseries('requests', '24h');
  const { data: errorsTimeseries, isLoading: errorsLoading } = useTimeseries('errors', '24h');

  const loading = metricsLoading || requestsLoading || errorsLoading;
  const error = metricsError;

  // Transform timeseries data for charts
  const requestsData = requestsTimeseries?.data?.map(p => ({
    timestamp: new Date(p.timestamp).toLocaleTimeString([], { hour: 'numeric', hour12: true }),
    value: p.value
  })) || [];

  const errorsData = errorsTimeseries?.data?.map(p => ({
    timestamp: new Date(p.timestamp).toLocaleTimeString([], { hour: 'numeric', hour12: true }),
    value: p.value
  })) || [];

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Failed to load dashboard metrics.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Dashboard Overview
        </Typography>
        <Button startIcon={<RefreshIcon />} variant="outlined" size="small" onClick={() => refetch()}>
          Refresh
        </Button>
      </Box>

      {/* Row 1: KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Conversations KPI */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {loading ? (
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          ) : (
            <KPICard
              title="Total Conversations"
              value={metrics?.totalConversations?.toLocaleString() || '0'}
              icon={<ChatIcon />}
              color="#1976d2"
            />
          )}
        </Grid>

        {/* Success Rate KPI */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {loading ? (
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          ) : (
            <KPICard
              title="Success Rate"
              value={`${metrics?.successRate?.toFixed(1) || 0}%`}
              icon={<SuccessIcon />}
              color="#2e7d32"
            />
          )}
        </Grid>

        {/* Avg Latency KPI */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {loading ? (
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          ) : (
            <KPICard
              title="Avg Latency"
              value={`${metrics?.avgLatencyMs?.toFixed(0) || 0}ms`}
              icon={<LatencyIcon />}
              color="#ed6c02"
            />
          )}
        </Grid>

        {/* Active Agents KPI */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {loading ? (
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          ) : (
            <KPICard
              title="Active Agents"
              value={String(metrics?.activeAgents || 0)}
              icon={<AgentIcon />}
              color="#9c27b0"
            />
          )}
        </Grid>
      </Grid>

      {/* Row 2: Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          {loading ? (
            <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 2 }} />
          ) : (
            <MetricsChart
              title="Requests over Time"
              data={requestsData}
              type="area"
              color="#1976d2"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          {loading ? (
            <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 2 }} />
          ) : (
            <MetricsChart
              title="Errors over Time"
              data={errorsData}
              type="bar"
              color="#d32f2f"
            />
          )}
        </Grid>
      </Grid>

      {/* Row 3: Additional Metrics */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {loading ? (
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          ) : (
            <KPICard
              title="Total Requests"
              value={metrics?.totalRequests?.toLocaleString() || '0'}
              icon={<ChatIcon />}
              color="#0288d1"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {loading ? (
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          ) : (
            <KPICard
              title="Error Rate"
              value={`${metrics?.errorRate?.toFixed(1) || 0}%`}
              icon={<ErrorIcon />}
              color="#d32f2f"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {loading ? (
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          ) : (
            <KPICard
              title="Tokens Used"
              value={metrics?.tokensUsed?.toLocaleString() || '0'}
              icon={<TokenIcon />}
              color="#7b1fa2"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {loading ? (
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          ) : (
            <KPICard
              title="Est. Cost"
              value={`$${metrics?.estimatedCostUsd?.toFixed(4) || '0.00'}`}
              icon={<CostIcon />}
              color="#388e3c"
            />
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default OverviewPage;

