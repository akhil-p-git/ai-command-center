import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack
} from '@mui/material';
import { useSettings } from '../../contexts/SettingsContext';

export const AboutSection: React.FC = () => {
  const { clearSettings } = useSettings();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleReset = () => {
    clearSettings();
    setConfirmOpen(false);
    window.location.reload();
  };

  return (
    <Card elevation={1}>
      <CardContent>
        <Typography variant="h6" gutterBottom>About</Typography>
        <Typography variant="body2" paragraph>
          AI Command Center v1.0.0
        </Typography>
        
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Button variant="outlined" size="small" href="#">Docs</Button>
          <Button variant="outlined" size="small" href="#">GitHub</Button>
          <Button variant="outlined" size="small" href="#">Report Issue</Button>
        </Stack>

        <Button 
          variant="outlined" 
          color="error" 
          fullWidth 
          onClick={() => setConfirmOpen(true)}
        >
          Reset All Settings
        </Button>

        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Reset Settings?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This will clear your API key, preferences, and local configuration. This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleReset} color="error" autoFocus>
              Reset
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

