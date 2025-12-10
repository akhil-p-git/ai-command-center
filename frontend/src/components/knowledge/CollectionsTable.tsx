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
  Typography,
  Skeleton,
  Box,
  Radio
} from '@mui/material';
import { ArrowForward, Storage } from '@mui/icons-material';
import { Collection } from '../../types';

interface CollectionsTableProps {
  collections: Collection[];
  isLoading: boolean;
  onSelect: (collection: Collection) => void;
  selectedId?: string;
}

export const CollectionsTable: React.FC<CollectionsTableProps> = ({ 
  collections, 
  isLoading, 
  onSelect,
  selectedId 
}) => {
  if (isLoading) {
    return (
      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox"><Skeleton variant="circular" width={20} height={20} /></TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Documents</TableCell>
              <TableCell>Vectors</TableCell>
              <TableCell>Last Indexed</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell padding="checkbox"><Skeleton variant="circular" width={20} height={20} /></TableCell>
                <TableCell><Skeleton width={120} /></TableCell>
                <TableCell><Skeleton width={40} /></TableCell>
                <TableCell><Skeleton width={40} /></TableCell>
                <TableCell><Skeleton width={100} /></TableCell>
                <TableCell align="right"><Skeleton width={60} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (collections.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary" gutterBottom>
          No collections found.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create your first collection to start managing knowledge.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} elevation={1}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox"></TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Documents</TableCell>
            <TableCell>Vectors</TableCell>
            <TableCell>Last Indexed</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {collections.map((collection) => {
            const isSelected = selectedId === collection.id;
            
            return (
              <TableRow 
                key={collection.id} 
                hover
                selected={isSelected}
                onClick={() => onSelect(collection)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell padding="checkbox">
                  <Radio checked={isSelected} />
                </TableCell>
                <TableCell>
                  <Typography fontWeight="bold" color="primary">
                    {collection.name}
                  </Typography>
                  {collection.description && (
                    <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ maxWidth: 200 }}>
                      {collection.description}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{collection.doc_count}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Storage fontSize="small" color="action" />
                    {collection.vector_count}
                  </Box>
                </TableCell>
                <TableCell>
                  {collection.last_indexed 
                    ? new Date(collection.last_indexed).toLocaleDateString() 
                    : 'Never'}
                </TableCell>
                <TableCell align="right">
                  <Button 
                    size="small" 
                    endIcon={<ArrowForward />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(collection);
                    }}
                  >
                    Select
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

