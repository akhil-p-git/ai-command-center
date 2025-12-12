import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid,
  useTheme
} from '@mui/material';
import { 
  TrendingUp, 
  AccessTime, 
  PlayArrow,
  Update
} from '@mui/icons-material';

interface WorkflowStatsProps {
  totalExecutions: number;
  successRate: number;
  avgDuration?: number; // in ms
  lastRun?: string;
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

export const WorkflowStats: React.FC<WorkflowStatsProps> = ({ 
  totalExecutions, 
  successRate, 
  avgDuration, 
  lastRun 
}) => {
  const theme = useTheme();

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatLastRun = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.round(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard 
          title="Total Executions" 
          value={totalExecutions.toLocaleString()} 
          icon={<PlayArrow />} 
          color={theme.palette.primary.main} 
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard 
          title="Success Rate" 
          value={`${successRate}%`} 
          icon={<TrendingUp />} 
          color={theme.palette.success.main} 
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard 
          title="Avg Duration" 
          value={formatDuration(avgDuration)} 
          icon={<AccessTime />} 
          color={theme.palette.warning.main} 
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard 
          title="Last Run" 
          value={formatLastRun(lastRun)} 
          icon={<Update />} 
          color={theme.palette.info.main} 
        />
      </Grid>
    </Grid>
  );
};

