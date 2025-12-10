import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  FormGroup,
  FormControlLabel,
  Switch,
  FormHelperText
} from '@mui/material';
import { useSettings } from '../../contexts/SettingsContext';

export const FeaturesSection: React.FC = () => {
  const { settings, updateFeature } = useSettings();

  return (
    <Card elevation={1}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Feature Flags</Typography>
        
        <FormGroup>
          <Box mb={2}>
            <FormControlLabel 
              control={
                <Switch 
                  checked={settings.features.enableStreaming} 
                  onChange={(e) => updateFeature('enableStreaming', e.target.checked)} 
                />
              } 
              label="Enable Streaming Responses" 
            />
            <FormHelperText>Stream agent responses token by token (Beta)</FormHelperText>
          </Box>

          <Box mb={2}>
            <FormControlLabel 
              control={
                <Switch 
                  checked={settings.features.showTokenCosts} 
                  onChange={(e) => updateFeature('showTokenCosts', e.target.checked)} 
                />
              } 
              label="Show Token Costs" 
            />
            <FormHelperText>Display estimated cost and token usage per message</FormHelperText>
          </Box>

          <Box>
            <FormControlLabel 
              control={
                <Switch 
                  checked={settings.features.debugMode} 
                  onChange={(e) => updateFeature('debugMode', e.target.checked)} 
                />
              } 
              label="Debug Mode" 
            />
            <FormHelperText>Show detailed logs and raw JSON outputs in UI</FormHelperText>
          </Box>
        </FormGroup>
      </CardContent>
    </Card>
  );
};

import { Box } from '@mui/material';

