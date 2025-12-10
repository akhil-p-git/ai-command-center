import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid2 as Grid,
  useTheme
} from '@mui/material';
import { 
  TrendingUp, 
  AccessTime, 
  PlayArrow,
  Token
} from '@mui/icons-material';
import { AgentStats as IAgentStats } from '../../api/agents';

interface AgentStatsProps {
  stats?: IAgentStats;
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Paper 
    elevation={1} 
    sx={{ 
      p: 2, 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2,
      height: '100%'
    }}
  >
    <Box 
      sx={{ 
        p: 1.5, 
        borderRadius: '50%', 
        bgcolor: `${color}15`, 
        color: color,
        display: 'flex' 
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h6" fontWeight="bold">
        {value}
      </Typography>
    </Box>
  </Paper>
);

export const AgentStats: React.FC<AgentStatsProps> = ({ stats }) => {
  const theme = useTheme();

  if (!stats) return null;

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard 
          title="Total Runs" 
          value={stats.totalRuns} 
          icon={<PlayArrow />} 
          color={theme.palette.primary.main} 
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard 
          title="Success Rate" 
          value={`${stats.successRate}%`} 
          icon={<TrendingUp />} 
          color={theme.palette.success.main} 
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard 
          title="Avg Latency" 
          value={`${stats.avgLatencyMs}ms`} 
          icon={<AccessTime />} 
          color={theme.palette.warning.main} 
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard 
          title="Total Tokens" 
          value={stats.totalTokens.toLocaleString()} 
          icon={<Token />} 
          color={theme.palette.info.main} 
        />
      </Grid>
    </Grid>
  );
};

