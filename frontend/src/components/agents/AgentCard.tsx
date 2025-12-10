import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  Stack, 
  Divider,
  Avatar
} from '@mui/material';
import { 
  SmartToy, 
  TrendingUp, 
  AccessTime, 
  PlayArrow 
} from '@mui/icons-material';
import { AgentDetail } from '../../api/agents';

interface AgentCardProps {
  agent: AgentDetail;
  onClick: () => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onClick }) => {
  return (
    <Card 
      elevation={1} 
      sx={{ 
        height: '100%', 
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        }
      }}
      onClick={onClick}
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.light' }}>
              <SmartToy />
            </Avatar>
            <Box>
              <Typography variant="h6" component="div">
                {agent.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                v{agent.version}
              </Typography>
            </Box>
          </Box>
          <Chip 
            label={agent.type} 
            size="small" 
            variant="outlined" 
            color="primary" 
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {agent.description}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* Stats Row */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" display="block">Success Rate</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              <TrendingUp fontSize="inherit" color="success" />
              <Typography variant="body2" fontWeight="bold" color="success.main">
                {agent.success_rate}%
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" display="block">Avg Latency</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              <AccessTime fontSize="inherit" color="action" />
              <Typography variant="body2" fontWeight="bold">
                {agent.avg_latency}ms
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" display="block">Total Runs</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              <PlayArrow fontSize="inherit" color="action" />
              <Typography variant="body2" fontWeight="bold">
                {agent.total_runs || 0}
              </Typography>
            </Box>
          </Box>
        </Stack>

        <Typography variant="caption" color="text.secondary" display="block" align="center">
          Last deployed: {new Date(agent.last_deployed).toLocaleDateString()}
        </Typography>
      </CardContent>
    </Card>
  );
};

