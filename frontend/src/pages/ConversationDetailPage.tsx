import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button,
  Grid,
  Chip,
  IconButton,
  Skeleton
} from '@mui/material';
import { ArrowBack, Refresh } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useConversation } from '../hooks/useConversations';
import { MessageThread } from '../components/conversations/MessageThread';
import { ConversationMetadata } from '../components/conversations/ConversationMetadata';

const ConversationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: conversation, isLoading, refetch } = useConversation(id || '');

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton variant="rectangular" height={500} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (!conversation) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5">Conversation not found</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/conversations')} sx={{ mt: 2 }}>
          Back to List
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/conversations')}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" component="h1" fontWeight="bold">
              {conversation.title || 'Untitled Conversation'}
            </Typography>
            <Chip 
              label={conversation.status} 
              color={conversation.status === 'completed' ? 'success' : conversation.status === 'failed' ? 'error' : 'primary'} 
              size="small" 
            />
          </Box>
          <Typography variant="caption" color="text.secondary">
            ID: {conversation.id} • Agent: {conversation.agent_id} • {new Date(conversation.created_at).toLocaleString()}
          </Typography>
        </Box>
        <Button startIcon={<Refresh />} variant="outlined" size="small" onClick={() => refetch()}>
          Refresh
        </Button>
      </Box>

      {/* Content */}
      <Grid container spacing={3} sx={{ flexGrow: 1, minHeight: 0 }}>
        {/* Chat Area */}
        <Grid size={{ xs: 12, md: 8 }} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ 
            flexGrow: 1, 
            bgcolor: 'background.paper', 
            borderRadius: 1, 
            border: 1, 
            borderColor: 'divider',
            display: 'flex',
            overflow: 'hidden'
          }}>
            <MessageThread messages={conversation.messages || []} />
          </Box>
        </Grid>

        {/* Sidebar Metadata */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ height: '100%', overflowY: 'auto' }}>
          <ConversationMetadata conversation={conversation} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default ConversationDetailPage;

