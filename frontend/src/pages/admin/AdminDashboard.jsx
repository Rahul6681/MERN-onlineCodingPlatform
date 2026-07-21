import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { Group as GroupIcon, Analytics as AnalyticsIcon, Code as CodeIcon, Security as SecurityIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetAnalyticsQuery } from '../../api/apiSlice';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: analyticsRes } = useGetAnalyticsQuery({ role: 'platform' });
  const stats = analyticsRes?.data || { totalUsers: 1250, totalProblems: 45, totalSubmissions: 8900, dailyActiveUsers: 340 };

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Platform Administration Console
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        System health metrics, user moderation, and platform activity monitoring.
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 1 }}>
            <CardContent display="flex" alignItems="center" gap={2}>
              <Box p={1.5} borderRadius={3} bgcolor="rgba(99, 102, 241, 0.15)" color="#6366f1"><GroupIcon fontSize="large" /></Box>
              <Box>
                <Typography variant="h4" fontWeight={800}>{stats.totalUsers}</Typography>
                <Typography variant="body2" color="text.secondary">Total Users</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 1 }}>
            <CardContent display="flex" alignItems="center" gap={2}>
              <Box p={1.5} borderRadius={3} bgcolor="rgba(16, 185, 129, 0.15)" color="#10b981"><CodeIcon fontSize="large" /></Box>
              <Box>
                <Typography variant="h4" fontWeight={800}>{stats.totalProblems}</Typography>
                <Typography variant="body2" color="text.secondary">Total Problems</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 1 }}>
            <CardContent display="flex" alignItems="center" gap={2}>
              <Box p={1.5} borderRadius={3} bgcolor="rgba(245, 158, 11, 0.15)" color="#f59e0b"><AnalyticsIcon fontSize="large" /></Box>
              <Box>
                <Typography variant="h4" fontWeight={800}>{stats.totalSubmissions}</Typography>
                <Typography variant="body2" color="text.secondary">Total Submissions</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 1 }}>
            <CardContent display="flex" alignItems="center" gap={2}>
              <Box p={1.5} borderRadius={3} bgcolor="rgba(6, 182, 212, 0.15)" color="#06b6d4"><SecurityIcon fontSize="large" /></Box>
              <Box>
                <Typography variant="h4" fontWeight={800}>{stats.dailyActiveUsers}</Typography>
                <Typography variant="body2" color="text.secondary">Daily Active Users</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box display="flex" gap={2}>
        <Button variant="contained" color="primary" onClick={() => navigate('/admin/users')}>
          Manage Users
        </Button>
        <Button variant="contained" color="secondary" onClick={() => navigate('/admin/analytics')}>
          View Platform Analytics
        </Button>
      </Box>
    </Box>
  );
}
