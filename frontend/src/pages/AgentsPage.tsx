import React from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box,
  Skeleton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AgentCard } from '../components/agents/AgentCard';
import { useAgents } from '../hooks/useAgents';

const AgentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: agents, isLoading } = useAgents();

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          AI Agents
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Monitor and manage your deployed autonomous agents
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {isLoading ? (
          // Loading Skeletons
          [...Array(3)].map((_, i) => (
            <Grid key={i} size={{ xs: 12, md: 4 }}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
          ))
        ) : (
          // Agent Cards
          agents?.items.map((agent) => (
            <Grid key={agent.id} size={{ xs: 12, md: 4 }}>
              <AgentCard 
                agent={agent} 
                onClick={() => navigate(`/agents/${agent.id}`)} 
              />
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default AgentsPage;

