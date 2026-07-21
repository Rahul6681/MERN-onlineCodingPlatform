import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function PlatformAnalytics() {
  const languageData = {
    labels: ['JavaScript', 'Python', 'C++', 'Java'],
    datasets: [
      {
        data: [40, 30, 18, 12],
        backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'],
      },
    ],
  };

  const submissionsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Code Submissions Evaluated',
        data: [1200, 1900, 1500, 2200, 2800, 3100, 2400],
        backgroundColor: '#6366f1',
        borderRadius: 6,
      },
    ],
  };

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Platform-Wide Analytics
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Real-time metrics on submission velocity, language distribution, and user engagement.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Weekly Code Evaluation Velocity</Typography>
            <Box height={280}>
              <Bar data={submissionsData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Language Usage Distribution</Typography>
            <Box height={280} display="flex" justifyContent="center">
              <Pie data={languageData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
