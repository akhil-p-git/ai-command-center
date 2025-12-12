import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button,
  Grid
} from '@mui/material';
import { OpenInNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useWorkflows } from '../hooks/useWorkflows';
import { WorkflowsTable } from '../components/workflows/WorkflowsTable';

const WorkflowsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: workflows, isLoading } = useWorkflows();

  const handleOpenN8N = () => {
    const n8nUrl = import.meta.env.VITE_N8N_URL || 'http://localhost:5678';
    window.open(n8nUrl, '_blank');
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Workflows
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            n8n Integration & Orchestration
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          endIcon={<OpenInNew />}
          onClick={handleOpenN8N}
        >
          Open n8n Dashboard
        </Button>
      </Box>

      <Grid container>
        <Grid size={{ xs: 12 }}>
          <WorkflowsTable 
            workflows={workflows?.items || []} 
            isLoading={isLoading} 
            onSelect={(id) => navigate(`/workflows/${id}`)}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default WorkflowsPage;

