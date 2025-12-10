import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Box,
  TextField
} from '@mui/material';
import { useSettings } from '../../contexts/SettingsContext';

export const ModelSection: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  // Local state for debouncing
  const [tempSettings, setTempSettings] = useState(settings);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (
        tempSettings.temperature !== settings.temperature ||
        tempSettings.maxTokens !== settings.maxTokens
      ) {
        updateSettings({ 
          temperature: tempSettings.temperature, 
          maxTokens: tempSettings.maxTokens 
        });
      }
    }, 800);

    return () => clearTimeout(handler);
  }, [tempSettings, settings, updateSettings]);

  const handleModelChange = (model: string) => {
    updateSettings({ model }); // Update immediately for select
  };

  return (
    <Card elevation={1}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Model Settings</Typography>
        
        <FormControl fullWidth margin="normal" size="small">
          <InputLabel>Model</InputLabel>
          <Select
            value={settings.model}
            label="Model"
            onChange={(e) => handleModelChange(e.target.value)}
          >
            <MenuItem value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Recommended)</MenuItem>
            <MenuItem value="claude-3-opus-20240229">Claude 3 Opus</MenuItem>
            <MenuItem value="claude-3-haiku-20240307">Claude 3 Haiku</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography id="temp-slider" gutterBottom>
            Temperature: {tempSettings.temperature}
          </Typography>
          <Slider
            value={tempSettings.temperature}
            onChange={(_, val) => setTempSettings(prev => ({ ...prev, temperature: val as number }))}
            step={0.1}
            marks
            min={0}
            max={1}
            valueLabelDisplay="auto"
            aria-labelledby="temp-slider"
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: -1 }}>
            <Typography variant="caption" color="text.secondary">Precise</Typography>
            <Typography variant="caption" color="text.secondary">Creative</Typography>
          </Box>
        </Box>

        <TextField
          label="Max Tokens"
          type="number"
          fullWidth
          size="small"
          value={tempSettings.maxTokens}
          onChange={(e) => setTempSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 1024 }))}
          slotProps={{ htmlInput: { min: 256, max: 4096 } }}
        />
      </CardContent>
    </Card>
  );
};

