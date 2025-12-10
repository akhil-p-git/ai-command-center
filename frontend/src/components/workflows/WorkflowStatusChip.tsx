import React from 'react';
import { Chip } from '@mui/material';

interface WorkflowStatusChipProps {
  status: 'active' | 'inactive' | string;
}

export const WorkflowStatusChip: React.FC<WorkflowStatusChipProps> = ({ status }) => {
  const isActive = status === 'active';
  
  return (
    <Chip 
      label={isActive ? 'Active' : 'Inactive'} 
      size="small" 
      color={isActive ? 'success' : 'default'} 
      variant={isActive ? 'filled' : 'outlined'}
      sx={{ 
        fontWeight: 'medium',
        bgcolor: isActive ? 'success.light' : undefined,
        color: isActive ? 'success.dark' : undefined,
        border: isActive ? 'none' : undefined
      }}
    />
  );
};

