import React, { useState } from 'react';
import { 
  Stepper, 
  Step, 
  StepLabel, 
  StepContent, 
  Typography, 
  Box, 
  Paper,
  Collapse,
  IconButton
} from '@mui/material';
import { 
  CheckCircle, 
  Error, 
  Pending, 
  ExpandMore, 
  ExpandLess 
} from '@mui/icons-material';
import { AgentStep } from '../../types';

interface AgentStepsTimelineProps {
  steps: AgentStep[];
  isRunning?: boolean;
}

export const AgentStepsTimeline: React.FC<AgentStepsTimelineProps> = ({ steps, isRunning }) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  if (steps.length === 0 && !isRunning) return null;

  return (
    <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ ml: 1, mb: 1, display: 'block' }}>
        AGENT EXECUTION
      </Typography>
      <Stepper orientation="vertical" activeStep={isRunning ? steps.length : -1}>
        {steps.map((step, index) => (
          <Step key={index} active completed>
            <StepLabel 
              icon={<CheckCircle color="success" fontSize="small" />}
              onClick={() => setExpandedStep(expandedStep === index ? null : index)}
              sx={{ cursor: 'pointer', py: 0 }}
            >
              <Typography variant="body2" fontWeight="medium">
                {step.step_name}
              </Typography>
            </StepLabel>
            <StepContent>
              <Box sx={{ mt: 1, mb: 1 }}>
                {expandedStep === index && (
                  <Paper variant="outlined" sx={{ p: 1, bgcolor: 'grey.50' }}>
                    {step.input && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" fontWeight="bold">Input:</Typography>
                        <Typography variant="caption" component="pre" sx={{ overflowX: 'auto' }}>
                          {JSON.stringify(step.input, null, 2)}
                        </Typography>
                      </Box>
                    )}
                    {step.output && (
                      <Box>
                        <Typography variant="caption" fontWeight="bold">Output:</Typography>
                        <Typography variant="caption" component="pre" sx={{ overflowX: 'auto' }}>
                          {JSON.stringify(step.output, null, 2)}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                )}
                {expandedStep !== index && (
                  <Typography variant="caption" color="text.secondary" onClick={() => setExpandedStep(index)} sx={{ cursor: 'pointer', textDecoration: 'underline' }}>
                    View details
                  </Typography>
                )}
              </Box>
            </StepContent>
          </Step>
        ))}
        {isRunning && (
          <Step active>
            <StepLabel icon={<Pending color="primary" sx={{ animation: 'pulse 1s infinite', '@keyframes pulse': { '0%': { opacity: 0.6 }, '50%': { opacity: 1 }, '100%': { opacity: 0.6 } } }} />}>
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                Thinking...
              </Typography>
            </StepLabel>
          </Step>
        )}
      </Stepper>
    </Box>
  );
};

