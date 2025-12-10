import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { AGENT_GRAPHS } from '../../config/agents';

interface AgentGraphProps {
  agentId: string; // e.g., 'doc', 'incident', 'slack' (or mapped from full ID)
  currentStep?: string;
}

export const AgentGraph: React.FC<AgentGraphProps> = ({ agentId, currentStep }) => {
  // Normalize agent ID to match config keys (e.g. 'doc-agent' -> 'doc')
  const configKey = Object.keys(AGENT_GRAPHS).find(k => agentId.toLowerCase().includes(k)) || 'doc';
  const graph = AGENT_GRAPHS[configKey];

  if (!graph) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No graph visualization available for this agent.</Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        p: 4, 
        overflowX: 'auto',
        minHeight: 200
      }}
    >
      {graph.nodes.map((node, index) => {
        const isLast = index === graph.nodes.length - 1;
        const isActive = currentStep === node.id;
        
        let bgcolor = 'grey.100';
        let borderColor = 'grey.300';
        let textColor = 'text.primary';

        if (node.type === 'start') {
          bgcolor = 'success.light';
          borderColor = 'success.main';
          textColor = 'success.contrastText';
        } else if (node.type === 'end') {
          bgcolor = 'grey.300';
          borderColor = 'grey.500';
        } else if (isActive) {
          bgcolor = 'primary.light';
          borderColor = 'primary.main';
          textColor = 'primary.contrastText';
        } else {
          bgcolor = 'background.paper';
          borderColor = 'primary.main';
        }

        return (
          <React.Fragment key={node.id}>
            <Paper
              elevation={isActive ? 4 : 1}
              sx={{
                p: 2,
                minWidth: 120,
                textAlign: 'center',
                bgcolor,
                border: 2,
                borderColor,
                color: textColor,
                borderRadius: 2,
                position: 'relative',
                transition: 'all 0.3s ease',
                transform: isActive ? 'scale(1.05)' : 'none',
                zIndex: isActive ? 2 : 1
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold">
                {node.label}
              </Typography>
            </Paper>

            {!isLast && (
              <Box 
                sx={{ 
                  width: 40, 
                  height: 2, 
                  bgcolor: 'grey.400',
                  mx: 1,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    right: -4,
                    top: -4,
                    width: 0, 
                    height: 0, 
                    borderTop: '5px solid transparent',
                    borderBottom: '5px solid transparent',
                    borderLeft: '5px solid',
                    borderLeftColor: 'grey.400'
                  }
                }} 
              />
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
};

