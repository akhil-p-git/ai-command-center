import React from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  TablePagination,
  IconButton,
  Tooltip,
  Typography,
  Skeleton,
  Box,
  Link
} from '@mui/material';
import { Visibility, ErrorOutline } from '@mui/icons-material';
import { AgentRun } from '../../api/agents';

interface AgentRunsTableProps {
  runs: AgentRun[];
  isLoading: boolean;
  onViewConversation: (conversationId: string) => void;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rows: number) => void;
  total?: number;
}

export const AgentRunsTable: React.FC<AgentRunsTableProps> = ({
  runs,
  isLoading,
  onViewConversation,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  total = 0
}) => {
  const getStatusChip = (status: string) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    switch (status) {
      case 'completed': color = 'success'; break;
      case 'failed': color = 'error'; break;
      case 'running': color = 'info'; break;
    }
    return <Chip label={status} size="small" color={color} variant="outlined" />;
  };

  if (isLoading) {
    return (
      <TableContainer component={Paper} elevation={0} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Run ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Time</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell><Skeleton width={60} /></TableCell>
                <TableCell><Skeleton width={60} /></TableCell>
                <TableCell><Skeleton width={120} /></TableCell>
                <TableCell align="right"><Skeleton width={40} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (!runs || runs.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: 1 }}>
        <Typography color="text.secondary">No runs found for this agent.</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={0} variant="outlined">
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Run ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Time</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {runs.map((run) => (
              <TableRow key={run.id} hover>
                <TableCell sx={{ fontFamily: 'monospace' }}>
                  {run.id.substring(0, 8)}
                </TableCell>
                <TableCell>
                  {getStatusChip(run.status)}
                </TableCell>
                <TableCell>
                  {run.duration_ms ? `${run.duration_ms}ms` : '-'}
                </TableCell>
                <TableCell>
                  {new Date(run.start_time).toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View Conversation">
                    <IconButton size="small" onClick={() => onViewConversation(run.id)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {onPageChange && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, p) => onPageChange(p)}
          onRowsPerPageChange={(e) => onRowsPerPageChange && onRowsPerPageChange(parseInt(e.target.value, 10))}
        />
      )}
    </Paper>
  );
};

