import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { Build as BuildIcon, EmojiEvents as EmojiEventsIcon, Group as GroupIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetAnalyticsQuery } from '../../api/apiSlice';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TrainerDashboard() {
  const navigate = useNavigate();
  const { data: analyticsRes } = useGetAnalyticsQuery({ role: 'trainer' });
  const stats = analyticsRes?.data || {
    problemsCreated: 15,
    contestsCreated: 4,
    studentPerformance: { totalSubmissions: 450, acceptedSubmissions: 310, averageAcceptanceRate: 69 },
    contestParticipation: [
      { month: 'Jan', participants: 45 },
      { month: 'Feb', participants: 60 },
      { month: 'Mar', participants: 92 },
      { month: 'Apr', participants: 120 },
    ],
  };

  const chartData = {
    labels: stats.contestParticipation.map((d) => d.month),
    datasets: [
      {
        label: 'Student Contest Participants',
        data: stats.contestParticipation.map((d) => d.participants),
        backgroundColor: '#6366f1',
        borderRadius: 8,
      },
    ],
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Trainer Portal Dashboard</Typography>
          <Typography variant="body1" color="text.secondary">
            Manage problems, schedule contests, and monitor student performance statistics.
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button variant="contained" color="primary" startIcon={<BuildIcon />} onClick={() => navigate('/trainer/problems')}>
            Create Problem
          </Button>
          <Button variant="contained" color="secondary" startIcon={<EmojiEventsIcon />} onClick={() => navigate('/trainer/contests')}>
            Schedule Contest
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 1 }}>
            <CardContent display="flex" alignItems="center" gap={2}>
              <Box p={1.5} borderRadius={3} bgcolor="rgba(99, 102, 241, 0.15)" color="#6366f1"><BuildIcon fontSize="large" /></Box>
              <Box>
                <Typography variant="h4" fontWeight={800}>{stats.problemsCreated}</Typography>
                <Typography variant="body2" color="text.secondary">Problems Created</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 1 }}>
            <CardContent display="flex" alignItems="center" gap={2}>
              <Box p={1.5} borderRadius={3} bgcolor="rgba(245, 158, 11, 0.15)" color="#f59e0b"><EmojiEventsIcon fontSize="large" /></Box>
              <Box>
                <Typography variant="h4" fontWeight={800}>{stats.contestsCreated}</Typography>
                <Typography variant="body2" color="text.secondary">Contests Created</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 1 }}>
            <CardContent display="flex" alignItems="center" gap={2}>
              <Box p={1.5} borderRadius={3} bgcolor="rgba(16, 185, 129, 0.15)" color="#10b981"><TrendingUpIcon fontSize="large" /></Box>
              <Box>
                <Typography variant="h4" fontWeight={800}>{stats.studentPerformance?.averageAcceptanceRate}%</Typography>
                <Typography variant="body2" color="text.secondary">Avg Student Acceptance</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 1 }}>
            <CardContent display="flex" alignItems="center" gap={2}>
              <Box p={1.5} borderRadius={3} bgcolor="rgba(6, 182, 212, 0.15)" color="#06b6d4"><GroupIcon fontSize="large" /></Box>
              <Box>
                <Typography variant="h4" fontWeight={800}>{stats.studentPerformance?.totalSubmissions}</Typography>
                <Typography variant="body2" color="text.secondary">Total Submissions</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>Student Contest Participation Growth</Typography>
        <Box height={280}>
          <Bar data={chartData} options={{ maintainAspectRatio: false }} />
        </Box>
      </Card>
    </Box>
  );
}
