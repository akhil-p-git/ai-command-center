import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Box, 
  IconButton, 
  InputAdornment,
  Button,
  Alert,
  Snackbar
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle, Warning } from '@mui/icons-material';
import { useSettings } from '../../contexts/SettingsContext';

export const ApiKeySection: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setApiKey(settings.apiKey);
  }, [settings.apiKey]);

  const handleSave = () => {
    updateSettings({ apiKey });
    setSaved(true);
  };

  const handleClear = () => {
    setApiKey('');
    updateSettings({ apiKey: '' });
  };

  return (
    <Card elevation={1}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6">API Configuration</Typography>
          {settings.apiKey ? (
            <CheckCircle color="success" />
          ) : (
            <Warning color="warning" />
          )}
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Enter your Claude API Key (Anthropic) to enable AI features. 
          Keys are stored locally in your browser.
        </Typography>

        <TextField
          fullWidth
          label="Anthropic API Key"
          type={showKey ? 'text' : 'password'}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowKey(!showKey)} edge="end">
                  {showKey ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={apiKey === settings.apiKey && apiKey !== ''}
          >
            Save Key
          </Button>
          <Button variant="outlined" color="error" onClick={handleClear} disabled={!apiKey}>
            Clear
          </Button>
        </Box>

        <Snackbar
          open={saved}
          autoHideDuration={3000}
          onClose={() => setSaved(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" variant="filled">API Key saved successfully</Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};

