import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button,
  CircularProgress
} from '@mui/material';
import { Collection } from '../../types';
import { useCreateCollection } from '../../hooks/useKnowledge';

interface CreateCollectionDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (collection: Collection) => void;
}

export const CreateCollectionDialog: React.FC<CreateCollectionDialogProps> = ({ 
  open, 
  onClose, 
  onCreated 
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createMutation = useCreateCollection();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createMutation.mutate(
      { name, description },
      {
        onSuccess: (data) => {
          onCreated(data);
          handleClose();
        }
      }
    );
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    createMutation.reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create New Collection</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Collection Name"
            type="text"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={createMutation.isPending}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={createMutation.isPending}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={createMutation.isPending || !name.trim()}
            startIcon={createMutation.isPending ? <CircularProgress size={20} /> : null}
          >
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

