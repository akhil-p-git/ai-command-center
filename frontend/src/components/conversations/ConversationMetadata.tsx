import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Divider, 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  StepContent,
  Chip,
  Link
} from '@mui/material';
import { 
  AccessTime, 
  Token, 
  AttachMoney, 
  AccountTree 
} from '@mui/icons-material';
import { ConversationDetail } from '../../types';

interface ConversationMetadataProps {
  conversation: ConversationDetail;
}

export const ConversationMetadata: React.FC<ConversationMetadataProps> = ({ conversation }) => {
  // Mock data for metadata if not present in the conversation object
  // In a real app, these would come from the backend response
  const metrics = {
    model: 'claude-3-sonnet',
    tokens: 1240,
    latency: '850ms',
    cost: '$0.004',
    workflowId: conversation.id.includes('wf') ? 'wf-123-abc' : undefined
  };

  // Mock steps for the timeline
  const steps = [
    {
      label: 'Conversation Started',
      description: 'User initiated chat',
      timestamp: new Date(conversation.created_at).toLocaleTimeString()
    },
    {
      label: 'Agent Routing',
      description: `Routed to ${conversation.agent_id}`,
      timestamp: new Date(new Date(conversation.created_at).getTime() + 100).toLocaleTimeString()
    },
    {
      label: 'Tool Execution',
      description: 'Retrieved 3 documents from vector store',
      timestamp: new Date(new Date(conversation.created_at).getTime() + 500).toLocaleTimeString()
    },
    {
      label: 'Response Generated',
      description: 'Completed successfully',
      timestamp: new Date(conversation.updated_at).toLocaleTimeString()
    },
  ];

  return (
    <Card elevation={1} sx={{ height: '100%', overflowY: 'auto' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Details
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Model</Typography>
            <Typography variant="body2" fontWeight="medium">{metrics.model}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Token fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">Tokens</Typography>
            </Box>
            <Typography variant="body2">{metrics.tokens}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTime fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">Latency</Typography>
            </Box>
            <Typography variant="body2">{metrics.latency}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoney fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">Est. Cost</Typography>
            </Box>
            <Typography variant="body2">{metrics.cost}</Typography>
          </Box>

          {metrics.workflowId && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountTree fontSize="small" color="primary" />
                <Typography variant="body2">Workflow</Typography>
              </Box>
              <Link href={`/workflows/${metrics.workflowId}`} underline="hover">
                {metrics.workflowId}
              </Link>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" gutterBottom>
          Execution Timeline
        </Typography>
        
        <Stepper orientation="vertical">
          {steps.map((step, index) => (
            <Step key={index} active={true} completed={index < steps.length - 1}>
              <StepLabel>
                <Typography variant="caption" color="text.secondary" display="block">
                  {step.timestamp}
                </Typography>
                {step.label}
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </CardContent>
    </Card>
  );
};

