import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Add, UploadFile } from '@mui/icons-material';
import { useCollections } from '../hooks/useKnowledge';
import { CollectionsTable } from '../components/knowledge/CollectionsTable';
import { CreateCollectionDialog } from '../components/knowledge/CreateCollectionDialog';
import { IngestDocumentDialog } from '../components/knowledge/IngestDocumentDialog';
import { TestQueryPanel } from '../components/knowledge/TestQueryPanel';
import { Collection } from '../types';

const KnowledgePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [ingestDialogOpen, setIngestDialogOpen] = useState(false);

  const { data: collections, isLoading, refetch } = useCollections();

  const handleCreateSuccess = (newCollection: Collection) => {
    refetch();
    // Optionally select the new collection
  };

  const handleIngestSuccess = () => {
    refetch();
  };

  return (
    <Container maxWidth="xl" sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Knowledge Base
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage vector collections and ingest documents for RAG.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ flexGrow: 1, minHeight: 0 }}>
        {/* Left Panel: Collections List */}
        <Grid size={{ xs: 12, md: 7 }} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Collections</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="outlined" 
                startIcon={<UploadFile />}
                disabled={!selectedCollection}
                onClick={() => setIngestDialogOpen(true)}
                size="small"
              >
                Ingest Document
              </Button>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => setCreateDialogOpen(true)}
                size="small"
              >
                Add Collection
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <CollectionsTable 
              collections={collections?.items || []} 
              isLoading={isLoading} 
              onSelect={setSelectedCollection}
              selectedId={selectedCollection?.id}
            />
          </Box>
        </Grid>

        {/* Right Panel: Test Query */}
        <Grid size={{ xs: 12, md: 5 }} sx={{ height: '100%' }}>
          <TestQueryPanel 
            collections={collections?.items || []} 
            selectedCollectionId={selectedCollection?.id}
          />
        </Grid>
      </Grid>

      {/* Dialogs */}
      <CreateCollectionDialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)} 
        onCreated={handleCreateSuccess} 
      />
      
      {selectedCollection && (
        <IngestDocumentDialog 
          open={ingestDialogOpen} 
          collection={selectedCollection} 
          onClose={() => setIngestDialogOpen(false)} 
          onIngested={handleIngestSuccess} 
        />
      )}
    </Container>
  );
};

export default KnowledgePage;

