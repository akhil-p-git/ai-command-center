import React from 'react';
import { Card, Box, Typography, Paper } from '@mui/material';
import { ArrowUpward, ArrowDownward, Remove } from '@mui/icons-material';

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: React.ReactNode;
  color?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  trend,
  trendValue,
  icon,
  color = '#1976d2', // Default blue
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <ArrowUpward fontSize="small" color="success" />;
      case 'down':
        return <ArrowDownward fontSize="small" color="error" />;
      default:
        return <Remove fontSize="small" color="action" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'success.main';
      case 'down':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  return (
    <Card
      elevation={1}
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: 1,
            borderRadius: '50%',
            backgroundColor: `${color}20`, // 20% opacity
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Paper>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {getTrendIcon()}
            {trendValue && (
              <Typography variant="caption" fontWeight="bold" color={getTrendColor()}>
                {trendValue}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" component="div" fontWeight="bold">
          {value}
        </Typography>
      </Box>
    </Card>
  );
};

