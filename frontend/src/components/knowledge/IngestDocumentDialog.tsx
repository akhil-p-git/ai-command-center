import React, { useState, useRef } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  Typography,
  Box,
  LinearProgress,
  Alert
} from '@mui/material';
import { CloudUpload, InsertDriveFile } from '@mui/icons-material';
import { Collection } from '../../types';
import { useIngestDocument } from '../../hooks/useKnowledge';

interface IngestDocumentDialogProps {
  open: boolean;
  collection: Collection;
  onClose: () => void;
  onIngested: () => void;
}

export const IngestDocumentDialog: React.FC<IngestDocumentDialogProps> = ({ 
  open, 
  collection, 
  onClose, 
  onIngested 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ingestMutation = useIngestDocument();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSuccessMsg('');
      ingestMutation.reset();
    }
  };

  const handleUpload = () => {
    if (!file) return;

    ingestMutation.mutate(
      { collectionId: collection.id, file },
      {
        onSuccess: (data: any) => {
          // Assuming backend returns created chunk count or similar
          setSuccessMsg(`Successfully ingested document. Collection updated.`);
          setTimeout(() => {
            onIngested();
            handleClose();
          }, 1500);
        }
      }
    );
  };

  const handleClose = () => {
    setFile(null);
    setSuccessMsg('');
    ingestMutation.reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Ingest Document
        <Typography variant="subtitle2" color="text.secondary">
          to collection: {collection.name}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {successMsg ? (
          <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>
        ) : (
          <Box 
            sx={{ 
              border: '2px dashed', 
              borderColor: 'divider', 
              borderRadius: 2, 
              p: 4, 
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: 'background.default',
              '&:hover': { bgcolor: 'action.hover' }
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              hidden 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept=".md,.txt,.pdf" // Add supported types
            />
            
            {file ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <InsertDriveFile color="primary" fontSize="large" />
                <Typography variant="body1" fontWeight="bold">{file.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {(file.size / 1024).toFixed(1)} KB
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <CloudUpload color="action" fontSize="large" />
                <Typography variant="body1">Click to select a file</Typography>
                <Typography variant="caption" color="text.secondary">
                  Supports .md, .txt
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {ingestMutation.isPending && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 1 }}>
              Processing and chunking document...
            </Typography>
          </Box>
        )}
        
        {ingestMutation.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to ingest document. Please try again.
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={ingestMutation.isPending}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleUpload}
          disabled={!file || ingestMutation.isPending || !!successMsg}
          startIcon={<CloudUpload />}
        >
          Upload & Process
        </Button>
      </DialogActions>
    </Dialog>
  );
};

