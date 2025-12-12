import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  IconButton,
  Grid,
  Skeleton
} from '@mui/material';
import { ArrowBack, Refresh, OpenInNew } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkflow, useWorkflowExecutions } from '../hooks/useWorkflows';
import { WorkflowStats } from '../components/workflows/WorkflowStats';
import { ExecutionsTable } from '../components/workflows/ExecutionsTable';
import { WorkflowStatusChip } from '../components/workflows/WorkflowStatusChip';
import { TriggerTypeIcon } from '../components/workflows/TriggerTypeIcon';

const WorkflowDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  
  const { data: workflow, isLoading: wfLoading, refetch: refetchWf } = useWorkflow(id || '');
  const { data: executions, isLoading: execLoading, refetch: refetchExec } = useWorkflowExecutions(id || '', page, statusFilter);

  const handleRefresh = () => {
    refetchWf();
    refetchExec();
  };

  const handleOpenN8N = () => {
    if (!workflow?.n8n_workflow_id) return;
    const n8nUrl = import.meta.env.VITE_N8N_URL || 'http://localhost:5678';
    window.open(`${n8nUrl}/workflow/${workflow.n8n_workflow_id}`, '_blank');
  };

  if (wfLoading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={100} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={400} />
      </Container>
    );
  }

  if (!workflow) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5">Workflow not found</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/workflows')} sx={{ mt: 2 }}>
          Back to Workflows
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/workflows')}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              {workflow.name}
            </Typography>
            <WorkflowStatusChip status={workflow.status} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary" fontFamily="monospace">
              ID: {workflow.id}
            </Typography>
            <Box sx={{ width: 1, height: 16, bgcolor: 'divider' }} />
            <TriggerTypeIcon type={workflow.trigger_type} />
          </Box>
        </Box>
        
        {workflow.n8n_workflow_id && (
          <Button 
            variant="outlined" 
            startIcon={<OpenInNew />} 
            onClick={handleOpenN8N}
          >
            Open in n8n
          </Button>
        )}
        <Button startIcon={<Refresh />} variant="outlined" onClick={handleRefresh}>
          Refresh
        </Button>
      </Box>

      {/* Stats Row */}
      <Box sx={{ mb: 4 }}>
        <WorkflowStats 
          totalExecutions={workflow.execution_count || 0}
          successRate={workflow.success_rate || 0}
          avgDuration={0} // Backend might need to provide this, or calculate from executions
          lastRun={workflow.last_run}
        />
      </Box>

      {/* Executions Table */}
      <Grid container>
        <Grid size={{ xs: 12 }}>
          <ExecutionsTable 
            executions={executions?.items || []} 
            isLoading={execLoading} 
            total={executions?.total || 0}
            page={page}
            onPageChange={setPage}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onViewAgent={(agentId) => navigate(`/agents/${agentId}`)} // Ideally navigate to specific run but agent detail is fine
            onViewConversation={(convId) => navigate(`/conversations/${convId}`)}
          />
        </Grid>
      </Grid>

    </Container>
  );
};

export default WorkflowDetailPage;

