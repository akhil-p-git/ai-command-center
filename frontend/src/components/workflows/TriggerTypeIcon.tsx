import React from 'react';
import { Box, Typography } from '@mui/material';
import { 
  Http as HttpIcon, 
  Chat as ChatIcon, 
  Schedule as ScheduleIcon, 
  Bolt as BoltIcon 
} from '@mui/icons-material';

interface TriggerTypeIconProps {
  type: string;
}

export const TriggerTypeIcon: React.FC<TriggerTypeIconProps> = ({ type }) => {
  let icon = <BoltIcon fontSize="small" />;
  let label = 'Event';
  
  switch (type?.toLowerCase()) {
    case 'webhook':
      icon = <HttpIcon fontSize="small" />;
      label = 'Webhook';
      break;
    case 'slack':
      icon = <ChatIcon fontSize="small" />;
      label = 'Slack';
      break;
    case 'schedule':
    case 'cron':
      icon = <ScheduleIcon fontSize="small" />;
      label = 'Schedule';
      break;
    default:
      label = type || 'Unknown';
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ color: 'text.secondary', display: 'flex' }}>
        {icon}
      </Box>
      <Typography variant="body2">{label}</Typography>
    </Box>
  );
};

