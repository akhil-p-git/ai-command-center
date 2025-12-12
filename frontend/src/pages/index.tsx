import React from 'react';
import { Box, Typography } from '@mui/material';

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">{title}</Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        This page is under construction.
      </Typography>
    </Box>
  );
};

export { default as OverviewPage } from './OverviewPage';
export { default as ConversationsPage } from './ConversationsPage';
export { default as ConversationDetailPage } from './ConversationDetailPage';
export { default as AgentsPage } from './AgentsPage';
export { default as AgentDetailPage } from './AgentDetailPage';
export { default as WorkflowsPage } from './WorkflowsPage';
export { default as WorkflowDetailPage } from './WorkflowDetailPage';
export { default as KnowledgePage } from './KnowledgePage';
export { default as ChatPage } from './ChatPage';
export { default as SettingsPage } from './SettingsPage';
