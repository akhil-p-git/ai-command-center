import React, { useState, useEffect } from 'react';
import { 
  Stack, 
  TextField, 
  Select, 
  MenuItem, 
  InputLabel, 
  FormControl, 
  Button, 
  Box
} from '@mui/material';
import { ConversationFilters as Filters } from '../api/conversations';

// Extend the API filters with UI-specific ones if needed
interface ConversationFiltersProps {
  filters: Filters & {
    dateFrom?: string;
    dateTo?: string;
    channel?: string;
  };
  onChange: (filters: Filters & { dateFrom?: string; dateTo?: string; channel?: string }) => void;
}

export const ConversationFilters: React.FC<ConversationFiltersProps> = ({ filters, onChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  // Debounce handling would be ideal here, but for simplicity we'll trigger on change or blur
  // For select inputs, trigger immediately. For text/date inputs, maybe waiting or blur is better.
  // Given the requirements, we'll just propagate changes.
  
  const handleChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onChange(newFilters);
  };

  const handleClear = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    onChange(emptyFilters);
  };

  return (
    <Stack direction="row" flexWrap="wrap" gap={2} alignItems="center">
      <TextField
        label="From"
        type="date"
        size="small"
        value={localFilters.dateFrom || ''}
        onChange={(e) => handleChange('dateFrom', e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ width: 150 }}
      />
      
      <TextField
        label="To"
        type="date"
        size="small"
        value={localFilters.dateTo || ''}
        onChange={(e) => handleChange('dateTo', e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ width: 150 }}
      />

      <FormControl size="small" sx={{ width: 120 }}>
        <InputLabel>Channel</InputLabel>
        <Select
          value={localFilters.channel || ''}
          label="Channel"
          onChange={(e) => handleChange('channel', e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="chat">Chat</MenuItem>
          <MenuItem value="slack">Slack</MenuItem>
          <MenuItem value="webhook">Webhook</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ width: 150 }}>
        <InputLabel>Agent</InputLabel>
        <Select
          value={localFilters.agentId || ''}
          label="Agent"
          onChange={(e) => handleChange('agentId', e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="doc-agent">DocAgent</MenuItem>
          <MenuItem value="incident-agent">IncidentAgent</MenuItem>
          <MenuItem value="slack-agent">SlackAgent</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ width: 120 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={localFilters.status || ''}
          label="Status"
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="failed">Failed</MenuItem>
        </Select>
      </FormControl>

      <Button variant="text" size="small" onClick={handleClear}>
        Clear Filters
      </Button>
    </Stack>
  );
};

