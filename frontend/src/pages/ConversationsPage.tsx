import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper,
  Grid,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ConversationFilters } from '../components/conversations/ConversationFilters';
import { ConversationList } from '../components/conversations/ConversationList';
import { MessageThread } from '../components/conversations/MessageThread';
import { useConversations, useConversation } from '../hooks/useConversations';
import { ConversationFilters as IConversationFilters } from '../api/conversations';

const ConversationsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Parse filters from URL
  const filters: IConversationFilters = {
    status: searchParams.get('status') || undefined,
    agentId: searchParams.get('agentId') || undefined,
    // Add other filters as needed
  };

  const selectedId = searchParams.get('id');

  const { data: conversationsData, isLoading: listLoading } = useConversations(filters);
  const { data: conversationDetail, isLoading: detailLoading } = useConversation(selectedId || '');

  const handleFilterChange = (newFilters: any) => {
    const params: any = {};
    if (newFilters.status) params.status = newFilters.status;
    if (newFilters.agentId) params.agentId = newFilters.agentId;
    if (newFilters.channel) params.channel = newFilters.channel;
    if (selectedId) params.id = selectedId;
    
    setSearchParams(params);
  };

  const handleSelectConversation = (id: string) => {
    const currentParams = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...currentParams, id });
    
    // On mobile, navigate to detail page directly
    if (isMobile) {
      navigate(`/conversations/${id}`);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Conversations
        </Typography>
        <ConversationFilters 
          filters={filters} 
          onChange={handleFilterChange} 
        />
      </Box>

      <Grid container spacing={2} sx={{ flexGrow: 1, minHeight: 0 }}>
        {/* List Panel */}
        <Grid size={{ xs: 12, md: 5, lg: 4 }} sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <ConversationList
            conversations={conversationsData?.items || []}
            isLoading={listLoading}
            onSelect={handleSelectConversation}
            selectedId={selectedId || undefined}
            total={conversationsData?.total}
          />
        </Grid>

        {/* Preview Panel (Desktop only) */}
        {!isMobile && (
          <Grid size={{ md: 7, lg: 8 }} sx={{ height: '100%' }}>
            <Paper 
              elevation={1} 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                bgcolor: 'background.default',
                overflow: 'hidden' 
              }}
            >
              {selectedId && conversationDetail ? (
                <>
                  <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                    <Typography variant="h6">
                      {conversationDetail.title || 'Untitled Conversation'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {conversationDetail.id} • {new Date(conversationDetail.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                  <MessageThread messages={conversationDetail.messages || []} />
                </>
              ) : (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    color: 'text.secondary'
                  }}
                >
                  <Typography>Select a conversation to view details</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default ConversationsPage;

