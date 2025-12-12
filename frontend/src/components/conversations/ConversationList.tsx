import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TablePagination,
  Skeleton,
  Box,
  Typography
} from '@mui/material';
import { Conversation } from '../../types';

interface ConversationListProps {
  conversations: Conversation[];
  isLoading: boolean;
  onSelect: (id: string) => void;
  selectedId?: string;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rows: number) => void;
  total?: number;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  isLoading,
  onSelect,
  selectedId,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  total = 0
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'active': return 'primary';
      default: return 'default';
    }
  };

  const getChannelChip = (agentId: string) => {
    // Infer channel from agent ID or add channel field to model
    // For now, mocking based on agent ID or random
    const channel = agentId.includes('slack') ? 'Slack' : 'Chat';
    return (
      <Chip 
        label={channel} 
        size="small" 
        variant="outlined" 
        sx={{ borderColor: 'divider' }}
      />
    );
  };

  if (isLoading) {
    return (
      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Channel</TableCell>
              <TableCell>Agent</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell><Skeleton width={60} /></TableCell>
                <TableCell><Skeleton width={100} /></TableCell>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell align="right"><Skeleton width={100} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (conversations.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography color="text.secondary">No conversations found.</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={1}>
      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="conversations table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Channel</TableCell>
              <TableCell>Agent</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {conversations.map((row) => (
              <TableRow
                key={row.id}
                hover
                onClick={() => onSelect(row.id)}
                selected={row.id === selectedId}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell component="th" scope="row">
                  {row.id.substring(0, 8)}...
                </TableCell>
                <TableCell>{getChannelChip(row.agent_id)}</TableCell>
                <TableCell>{row.agent_id}</TableCell>
                <TableCell>
                  <Chip 
                    label={row.status} 
                    size="small" 
                    color={getStatusColor(row.status) as any} 
                    variant="outlined" // Note: "soft" variant might need custom theme or newer MUI, falling back to filled/outlined defaults is fine
                  />
                </TableCell>
                <TableCell align="right">
                  {new Date(row.created_at).toLocaleString()}
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

