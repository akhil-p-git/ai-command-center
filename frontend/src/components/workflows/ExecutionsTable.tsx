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
  Skeleton,
  Box,
  Typography,
  Link as MuiLink,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import { WorkflowExecution } from '../../types';

interface ExecutionsTableProps {
  executions: WorkflowExecution[];
  isLoading: boolean;
  onViewAgent?: (agentRunId: string) => void;
  onViewConversation?: (conversationId: string) => void;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rows: number) => void;
  total?: number;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
}

export const ExecutionsTable: React.FC<ExecutionsTableProps> = ({
  executions,
  isLoading,
  onViewAgent,
  onViewConversation,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  total = 0,
  statusFilter = '',
  onStatusFilterChange
}) => {
  const getStatusChip = (status: string) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    switch (status) {
      case 'success': color = 'success'; break;
      case 'failed': color = 'error'; break;
      case 'running': color = 'info'; break;
    }
    return <Chip label={status} size="small" color={color} variant="outlined" />;
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (isLoading) {
    return (
      <TableContainer component={Paper} elevation={1}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Skeleton width={150} height={40} />
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Execution ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Agent Run</TableCell>
              <TableCell>Conversation</TableCell>
              <TableCell align="right">Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell><Skeleton width={60} /></TableCell>
                <TableCell><Skeleton width={60} /></TableCell>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell align="right"><Skeleton width={120} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <Paper elevation={1}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Executions History</Typography>
        {onStatusFilterChange && (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => onStatusFilterChange(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="success">Success</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="running">Running</MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Execution ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Agent Run</TableCell>
              <TableCell>Conversation</TableCell>
              <TableCell align="right">Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {executions.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                   <Typography color="text.secondary">No executions found.</Typography>
                 </TableCell>
               </TableRow>
            ) : (
              executions.map((exec) => (
                <TableRow key={exec.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace' }}>
                    {exec.id.substring(0, 8)}
                  </TableCell>
                  <TableCell>
                    {getStatusChip(exec.status)}
                  </TableCell>
                  <TableCell>
                    {formatDuration(exec.duration_ms)}
                  </TableCell>
                  <TableCell>
                    {exec.agent_run_id ? (
                      <MuiLink 
                        component="button" 
                        variant="body2" 
                        onClick={() => onViewAgent && onViewAgent(exec.agent_run_id!)}
                      >
                        {exec.agent_run_id.substring(0, 8)}...
                      </MuiLink>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {exec.conversation_id ? (
                      <MuiLink 
                        component="button" 
                        variant="body2" 
                        onClick={() => onViewConversation && onViewConversation(exec.conversation_id!)}
                      >
                        {exec.conversation_id.substring(0, 8)}...
                      </MuiLink>
                    ) : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {new Date(exec.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
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

