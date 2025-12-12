import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  IconButton,
  Grid,
  Paper,
  Tabs,
  Tab,
  Skeleton
} from '@mui/material';
import { ArrowBack, Refresh } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAgent, useAgentRuns } from '../hooks/useAgents';
import { AgentStats } from '../components/agents/AgentStats';
import { AgentGraph } from '../components/agents/AgentGraph';
import { AgentRunsTable } from '../components/agents/AgentRunsTable';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`agent-tabpanel-${index}`}
      aria-labelledby={`agent-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AgentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  
  const { data: agent, isLoading: agentLoading, refetch: refetchAgent } = useAgent(id || '');
  const { data: runs, isLoading: runsLoading, refetch: refetchRuns } = useAgentRuns(id || '', page);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    refetchAgent();
    refetchRuns();
  };

  if (agentLoading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={100} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (!agent) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5">Agent not found</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/agents')} sx={{ mt: 2 }}>
          Back to Agents
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/agents')}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {agent.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {agent.description}
          </Typography>
        </Box>
        <Button startIcon={<Refresh />} variant="outlined" onClick={handleRefresh}>
          Refresh
        </Button>
      </Box>

      {/* Stats Row */}
      <Box sx={{ mb: 4 }}>
        <AgentStats stats={agent.stats || { 
          totalRuns: agent.total_runs || 0, 
          successRate: agent.success_rate || 0, 
          avgLatencyMs: agent.avg_latency || 0,
          totalTokens: 0 // Mock or need API update
        }} />
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Runs History" />
          <Tab label="Configuration" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      <CustomTabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Agent Workflow</Typography>
              <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.default' }}>
                <AgentGraph agentId={agent.id} />
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Details</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Type</Typography>
                  <Typography variant="body1">{agent.type}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Version</Typography>
                  <Typography variant="body1">{agent.version}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Last Deployed</Typography>
                  <Typography variant="body1">{new Date(agent.last_deployed).toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">ID</Typography>
                  <Typography variant="body2" fontFamily="monospace">{agent.id}</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </CustomTabPanel>

      {/* Runs Tab */}
      <CustomTabPanel value={tabValue} index={1}>
        <AgentRunsTable 
          runs={runs?.items || []} 
          isLoading={runsLoading} 
          onViewConversation={(id) => navigate(`/conversations/${id}`)}
          total={runs?.total || 0}
          page={page}
          onPageChange={setPage}
        />
      </CustomTabPanel>

      {/* Config Tab (Mock) */}
      <CustomTabPanel value={tabValue} index={2}>
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Configuration options (model selection, prompts, temperature) will appear here.
          </Typography>
        </Paper>
      </CustomTabPanel>

    </Container>
  );
};

export default AgentDetailPage;

