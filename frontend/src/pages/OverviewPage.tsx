import React from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid2 as Grid, 
  Skeleton,
  Button,
  Alert
} from '@mui/material';
import { 
  Chat as ChatIcon, 
  CheckCircle as SuccessIcon, 
  Speed as LatencyIcon, 
  SmartToy as AgentIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

import { KPICard } from '../components/dashboard/KPICard';
import { MetricsChart } from '../components/dashboard/MetricsChart';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { useMockData } from '../hooks/useMockData';
// In a real app, we would switch between real hooks and mock hooks based on config
// import { useOverviewMetrics, useTimeseries } from '../hooks/useMetrics';

const OverviewPage: React.FC = () => {
  // Using mock data for development as requested
  const { metrics, requestsData, errorsData, activities, loading } = useMockData(true);
  
  // Placeholder for error state handling
  const error = null; 
  const refetch = () => window.location.reload(); // Simple reload for mock

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
              value={metrics?.totalConversations.toLocaleString() || '0'}
              trend={metrics?.trends.conversations.direction}
              trendValue={metrics?.trends.conversations.value}
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
              value={`${metrics?.successRate}%` || '0%'}
              trend={metrics?.trends.successRate.direction}
              trendValue={metrics?.trends.successRate.value}
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
              value={`${metrics?.avgLatencyMs}ms` || '0ms'}
              trend={metrics?.trends.latency.direction}
              trendValue={metrics?.trends.latency.value}
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
              value={metrics?.activeAgents || '0'}
              trend={metrics?.trends.activeAgents.direction}
              trendValue={metrics?.trends.activeAgents.value}
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

      {/* Row 3: Activity Feed */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          {loading ? (
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          ) : (
            <ActivityFeed activities={activities} />
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Quick Chat / System Status Placeholder */}
          <Box 
            sx={{ 
              height: '100%', 
              minHeight: 400,
              bgcolor: 'background.paper', 
              borderRadius: 1,
              p: 2,
              border: 1,
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Typography variant="h6" gutterBottom color="text.secondary">
              System Status
            </Typography>
            <Typography variant="body2" color="success.main" fontWeight="bold">
              All Systems Operational
            </Typography>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="caption" display="block" color="text.secondary">
                Vector DB: Connected
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                API Gateway: Online
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                Agent Runner: Idle
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OverviewPage;

