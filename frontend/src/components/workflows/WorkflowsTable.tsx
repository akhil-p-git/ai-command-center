import React from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  IconButton,
  Tooltip,
  Skeleton,
  Typography,
  Box
} from '@mui/material';
import { OpenInNew, Visibility } from '@mui/icons-material';
import { Workflow } from '../../types';
import { WorkflowStatusChip } from './WorkflowStatusChip';
import { TriggerTypeIcon } from './TriggerTypeIcon';

interface WorkflowsTableProps {
  workflows: Workflow[];
  isLoading: boolean;
  onSelect: (id: string) => void;
}

export const WorkflowsTable: React.FC<WorkflowsTableProps> = ({ 
  workflows, 
  isLoading, 
  onSelect 
}) => {
  const handleOpenN8N = (e: React.MouseEvent, n8nId?: string) => {
    e.stopPropagation();
    if (!n8nId) return;
    // Assuming n8n is running on localhost:5678 or configured URL
    const n8nUrl = import.meta.env.VITE_N8N_URL || 'http://localhost:5678';
    window.open(`${n8nUrl}/workflow/${n8nId}`, '_blank');
  };

  const getSuccessColor = (rate: number) => {
    if (rate >= 80) return 'success.main';
    if (rate >= 50) return 'warning.main';
    return 'error.main';
  };

  if (isLoading) {
    return (
      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Trigger</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Run</TableCell>
              <TableCell>Success Rate</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton width={150} /></TableCell>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell><Skeleton width={60} /></TableCell>
                <TableCell><Skeleton width={100} /></TableCell>
                <TableCell><Skeleton width={40} /></TableCell>
                <TableCell align="right"><Skeleton width={80} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (workflows.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography color="text.secondary">No workflows configured.</Typography>
        <Button variant="contained" sx={{ mt: 2 }}>Create Workflow</Button>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={1}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Trigger</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Last Run</TableCell>
            <TableCell>Success Rate</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {workflows.map((workflow) => (
            <TableRow 
              key={workflow.id} 
              hover
              onClick={() => onSelect(workflow.id)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>
                <Typography fontWeight="bold" color="primary">
                  {workflow.name}
                </Typography>
                {workflow.n8n_workflow_id && (
                  <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                    {workflow.n8n_workflow_id}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <TriggerTypeIcon type={workflow.trigger_type} />
              </TableCell>
              <TableCell>
                <WorkflowStatusChip status={workflow.status} />
              </TableCell>
              <TableCell>
                {workflow.last_run 
                  ? new Date(workflow.last_run).toLocaleString() 
                  : 'Never'}
              </TableCell>
              <TableCell>
                <Typography 
                  fontWeight="bold" 
                  color={getSuccessColor(workflow.success_rate)}
                >
                  {workflow.success_rate}%
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  {workflow.n8n_workflow_id && (
                    <Tooltip title="Open in n8n">
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleOpenN8N(e, workflow.n8n_workflow_id)}
                      >
                        <OpenInNew fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Button 
                    size="small" 
                    endIcon={<Visibility fontSize="small" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(workflow.id);
                    }}
                  >
                    View
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

