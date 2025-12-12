import React from 'react';
import { Box, Paper, Grid } from '@mui/material';
import { ChatPanel } from '../components/chat/ChatPanel';
import { AgentStepsTimeline } from '../components/chat/AgentStepsTimeline';
import { useChat } from '../hooks/useChat';

const ChatPage: React.FC = () => {
  // We can use a shared context or local state here. 
  // For the standalone page, we might want a more complex layout.
  // But for now, reusing the ChatPanel is sufficient.
  // The ChatPanel manages its own useChat hook, which is fine for isolated instances.
  // If we wanted to share state between the drawer and this page, we'd need a ChatContext.
  
  return (
    <Box sx={{ height: 'calc(100vh - 100px)', p: 2 }}>
      <Grid container spacing={3} sx={{ height: '100%' }}>
        <Grid size={{ xs: 12, md: 8 }} sx={{ height: '100%' }}>
          <Paper elevation={1} sx={{ height: '100%', overflow: 'hidden', borderRadius: 2 }}>
            <ChatPanel />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} sx={{ height: '100%', display: { xs: 'none', md: 'block' } }}>
          <Paper elevation={1} sx={{ height: '100%', p: 2, overflowY: 'auto', borderRadius: 2 }}>
             {/* 
                In a real app, we'd lift the state up or use a context so this sidebar 
                shows the steps from the same chat session as the main panel.
                Since ChatPanel currently owns the state, this sidebar is just a placeholder 
                or would need refactoring to lift state.
                For now, let's just explain this or duplicate a static view.
             */}
             <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                Start chatting to see live agent execution steps here.
             </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChatPage;

