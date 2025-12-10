import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Box
} from '@mui/material';
import { useSettings } from '../../contexts/SettingsContext';

export const EnvironmentSection: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  const handleEnvChange = (_: any, newEnv: 'dev' | 'prod' | null) => {
    if (newEnv) {
      updateSettings({ environment: newEnv });
    }
  };

  const apiUrl = settings.environment === 'prod' 
    ? 'https://api.production.com/v1' 
    : 'http://localhost:8000/api/v1';

  return (
    <Card elevation={1}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Environment</Typography>
        
        <ToggleButtonGroup
          color="primary"
          value={settings.environment}
          exclusive
          onChange={handleEnvChange}
          fullWidth
          sx={{ mb: 3 }}
        >
          <ToggleButton value="dev">Development</ToggleButton>
          <ToggleButton value="prod">Production</ToggleButton>
        </ToggleButtonGroup>

        <TextField
          label="Current API URL"
          value={apiUrl}
          fullWidth
          size="small"
          slotProps={{ input: { readOnly: true } }}
          variant="filled"
        />
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Switching environments will change which backend API the dashboard connects to.
            Ensure you have the appropriate access keys for Production.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

