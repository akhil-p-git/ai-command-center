import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  Collapse,
  Button
} from '@mui/material';
import { Description, ExpandMore, ExpandLess } from '@mui/icons-material';
import { QueryResult } from '../../types';

interface QueryResultCardProps {
  result: QueryResult;
  rank: number;
}

export const QueryResultCard: React.FC<QueryResultCardProps> = ({ result, rank }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Format score as percentage
  // Note: Chroma distance might not be 0-1 similarity depending on metric, 
  // but assuming we normalized or using cosine similarity here for display
  const scorePercent = Math.round(result.similarity_score * 100);
  
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    return 'error';
  };

  const scoreColor = getScoreColor(result.similarity_score);

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={`#${rank}`} 
              size="small" 
              variant="outlined" 
              sx={{ minWidth: 32 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
              <Description fontSize="small" />
              <Typography variant="body2" fontWeight="medium">
                {result.source_file}
              </Typography>
            </Box>
          </Box>
          <Chip 
            label={`${scorePercent}% Match`} 
            size="small" 
            color={scoreColor} 
            variant="outlined" // Using soft variant if available, otherwise fallback
            sx={{ fontWeight: 'bold' }}
          />
        </Box>

        <Typography 
          variant="body2" 
          color="text.primary" 
          sx={{ 
            whiteSpace: 'pre-wrap',
            bgcolor: 'grey.50',
            p: 1.5,
            borderRadius: 1,
            fontFamily: 'monospace',
            fontSize: '0.85rem'
          }}
        >
          {expanded 
            ? result.content 
            : result.content.length > 200 
              ? `${result.content.substring(0, 200)}...` 
              : result.content
          }
        </Typography>
      </CardContent>
      
      {result.content.length > 200 && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Button 
            size="small" 
            onClick={() => setExpanded(!expanded)}
            endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            {expanded ? 'Show less' : 'Show more'}
          </Button>
        </Box>
      )}
    </Card>
  );
};

