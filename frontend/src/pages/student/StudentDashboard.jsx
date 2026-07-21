import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, LinearProgress, Chip } from '@mui/material';
import { Code as CodeIcon, EmojiEvents as EmojiEventsIcon, LocalFireDepartment as FireIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetAnalyticsQuery } from '../../api/apiSlice';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function StudentDashboard() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const { data: analyticsRes } = useGetAnalyticsQuery({ role: 'student', id: user?.id });
  const stats = analyticsRes?.data || { totalSolved: 124, contestRating: 1650, streakCount: 14, acceptanceRate: 68, difficultyBreakdown: { Easy: 60, Medium: 50, Hard: 14 } };

  const donutData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        data: [stats.difficultyBreakdown.Easy, stats.difficultyBreakdown.Medium, stats.difficultyBreakdown.Hard],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Welcome back, {user?.name || 'Coder'}! 👋
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Track your DSA progress, join live contests, and master coding patterns.
      </Typography>

      {/* Top Metric Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent display="flex" alignItems="center" gap={2}>
              <Box p={1.5} borderRadius={3} bgcolor="rgba(16, 185, 129, 0.15)" color="#10b981">
                <CheckCircleIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800}>{stats.totalSolved}</Typography>
                <Typography variant="body2" color="text.secondary">Problems Solved</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent display="flex" alignItems="center" gap={2}>
              <Box p={1.5} borderRadius={3} bgcolor="rgba(99, 102, 241, 0.15)" color="#6366f1">
                <EmojiEventsIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800}>{stats.contestRating}</Typography>
                <Typography variant="body2" color="text.secondary">Contest Rating</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent display="flex" alignItems="center" gap={2}>
              <Box p={1.5} borderRadius={3} bgcolor="rgba(245, 158, 11, 0.15)" color="#f59e0b">
                <FireIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800}>{stats.streakCount} Days</Typography>
                <Typography variant="body2" color="text.secondary">Current Streak</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent display="flex" alignItems="center" gap={2}>
              <Box p={1.5} borderRadius={3} bgcolor="rgba(6, 182, 212, 0.15)" color="#06b6d4">
                <CodeIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800}>{stats.acceptanceRate}%</Typography>
                <Typography variant="body2" color="text.secondary">Acceptance Rate</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Middle Section: Solved Breakdown & Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Difficulty Breakdown
            </Typography>
            <Box height={220} display="flex" justifyContent="center">
              <Doughnut data={donutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Recommended Next Step
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                You are currently building strong skills in Arrays and Hash Tables. Tackle "Two Sum" or start the Interview Prep Module for top tech companies.
              </Typography>

              <Box display="flex" gap={2} mb={3}>
                <Chip label="Arrays" color="primary" variant="outlined" />
                <Chip label="Two Pointers" color="secondary" variant="outlined" />
                <Chip label="Company: Amazon" color="success" variant="outlined" />
              </Box>
            </Box>

            <Box display="flex" gap={2}>
              <Button variant="contained" color="primary" onClick={() => navigate('/student/problems')}>
                Browse Problems
              </Button>
              <Button variant="outlined" color="secondary" onClick={() => navigate('/student/interview-prep')}>
                Interview Prep
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
