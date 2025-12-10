import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid2 as Grid 
} from '@mui/material';
import { ApiKeySection } from '../components/settings/ApiKeySection';
import { ModelSection } from '../components/settings/ModelSection';
import { EnvironmentSection } from '../components/settings/EnvironmentSection';
import { FeaturesSection } from '../components/settings/FeaturesSection';
import { AboutSection } from '../components/settings/AboutSection';

const SettingsPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Settings
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <ApiKeySection />
            <ModelSection />
            <EnvironmentSection />
          </Box>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FeaturesSection />
            <AboutSection />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SettingsPage;

