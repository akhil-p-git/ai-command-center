import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { SettingsProvider } from './contexts/SettingsContext';
import { Layout } from './components/layout/Layout';

// Import Pages
import {
  OverviewPage,
  ConversationsPage,
  ConversationDetailPage,
  AgentsPage,
  AgentDetailPage,
  WorkflowsPage,
  WorkflowDetailPage,
  KnowledgePage,
  SettingsPage,
  ChatPage
} from './pages';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SettingsProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/overview" replace />} />
                <Route path="overview" element={<OverviewPage />} />
                
                <Route path="conversations" element={<ConversationsPage />} />
                <Route path="conversations/:id" element={<ConversationDetailPage />} />
                
                <Route path="agents" element={<AgentsPage />} />
                <Route path="agents/:id" element={<AgentDetailPage />} />
                
                <Route path="workflows" element={<WorkflowsPage />} />
                <Route path="workflows/:id" element={<WorkflowDetailPage />} />
                
                <Route path="knowledge" element={<KnowledgePage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </Router>
        </SettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
