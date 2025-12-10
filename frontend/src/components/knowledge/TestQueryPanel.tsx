import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Alert
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { Collection, QueryResult } from '../../types';
import { useQueryCollection } from '../../hooks/useKnowledge';
import { QueryResultCard } from './QueryResultCard';

interface TestQueryPanelProps {
  collections: Collection[];
  selectedCollectionId?: string;
}

export const TestQueryPanel: React.FC<TestQueryPanelProps> = ({ 
  collections, 
  selectedCollectionId: initialCollectionId 
}) => {
  const [collectionId, setCollectionId] = useState(initialCollectionId || '');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<QueryResult[]>([]);
  
  const queryMutation = useQueryCollection();

  // Update local state if prop changes (e.g. user selected from table)
  React.useEffect(() => {
    if (initialCollectionId) {
      setCollectionId(initialCollectionId);
    }
  }, [initialCollectionId]);

  const handleSearch = () => {
    if (!collectionId || !query.trim()) return;

    queryMutation.mutate(
      { collection_id: collectionId, query, n_results: 3 },
      {
        onSuccess: (data) => {
          setResults(data.results);
        }
      }
    );
  };

  return (
    <Paper elevation={1} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Test Query
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Search your vectorized knowledge base to verify retrieval quality.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Collection</InputLabel>
          <Select
            value={collectionId}
            label="Collection"
            onChange={(e) => setCollectionId(e.target.value)}
          >
            {collections.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Query"
          multiline
          rows={3}
          placeholder="e.g., What are the main features of the platform?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
        />

        <Button 
          variant="contained" 
          startIcon={<Search />}
          onClick={handleSearch}
          disabled={!collectionId || !query.trim() || queryMutation.isPending}
        >
          {queryMutation.isPending ? 'Searching...' : 'Search'}
        </Button>
      </Box>

      <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
        Results
      </Typography>
      
      <Box sx={{ flexGrow: 1, overflowY: 'auto', minHeight: 200 }}>
        {queryMutation.isPending ? (
          // Loading Skeletons
          [...Array(3)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={100} sx={{ mb: 2, borderRadius: 1 }} />
          ))
        ) : queryMutation.isError ? (
          <Alert severity="error">Search failed. Please try again.</Alert>
        ) : results.length > 0 ? (
          // Results List
          results.map((result, index) => (
            <QueryResultCard key={index} result={result} rank={index + 1} />
          ))
        ) : (
          // Empty State
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Typography variant="body2">
              {queryMutation.isSuccess ? 'No relevant results found.' : 'Enter a query to see matching documents.'}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

