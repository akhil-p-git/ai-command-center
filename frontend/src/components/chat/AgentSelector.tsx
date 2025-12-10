import React from 'react';
import { 
  FormControl, 
  Select, 
  MenuItem, 
  InputLabel, 
  Box, 
  Typography,
  Avatar
} from '@mui/material';
import { SmartToy, Description, Warning, Chat } from '@mui/icons-material';

interface AgentSelectorProps {
  value: string;
  onChange: (agentId: string) => void;
  disabled?: boolean;
}

const agents = [
  { id: 'doc-agent', name: 'DocAgent', icon: <Description fontSize="small" />, description: 'RAG over documentation' },
  { id: 'incident-agent', name: 'IncidentAgent', icon: <Warning fontSize="small" />, description: 'Incident response helper' },
  { id: 'slack-agent', name: 'SlackAgent', icon: <Chat fontSize="small" />, description: 'Slack summarization' },
];

export const AgentSelector: React.FC<AgentSelectorProps> = ({ 
  value, 
  onChange, 
  disabled = false 
}) => {
  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel>Select Agent</InputLabel>
      <Select
        value={value}
        label="Select Agent"
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        renderValue={(selected) => {
          const agent = agents.find(a => a.id === selected);
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {agent?.icon || <SmartToy fontSize="small" />}
              <Typography variant="body2">{agent?.name || selected}</Typography>
            </Box>
          );
        }}
      >
        <MenuItem value="">
          <Typography variant="body2" fontStyle="italic">Auto-detect (Router)</Typography>
        </MenuItem>
        {agents.map((agent) => (
          <MenuItem key={agent.id} value={agent.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.light' }}>
                {agent.icon}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="medium">{agent.name}</Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {agent.description}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

