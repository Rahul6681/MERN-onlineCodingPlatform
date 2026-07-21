import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';
import { Quiz as QuizIcon, Group as GroupIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetAnalyticsQuery } from '../../api/apiSlice';

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const { data: analyticsRes } = useGetAnalyticsQuery({ role: 'recruiter' });
  const stats = analyticsRes?.data || {
    activeAssessments: 3,
    totalCandidatesInvited: 48,
    completedCandidates: 41,
    completionRate: 85,
    topCandidates: [
      { name: 'Sarah Developer', email: 'sarah@codearena.dev', score: 95, assessmentTitle: 'Senior React/Node Candidate Test' },
      { name: 'Michael Coder', email: 'michael@codearena.dev', score: 90, assessmentTitle: 'Fullstack Hiring Screen' },
    ],
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Recruiter Assessment Center</Typography>
          <Typography variant="body1" color="text.secondary">
            Evaluate candidate coding skills, monitor proctoring, and review candidate reports.
          </Typography>
        </Box>
        <Button variant="contained" color="secondary" startIcon={<QuizIcon />} onClick={() => navigate('/recruiter/assessments')}>
          Create New Assessment
        </Button>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent display="flex" alignItems="center" gap={2}>
              <Box p={1.5} borderRadius={3} bgcolor="rgba(6, 182, 212, 0.15)" color="#06b6d4"><QuizIcon fontSize="large" /></Box>
              <Box>
                <Typography variant="h4" fontWeight={800}>{stats.activeAssessments}</Typography>
                <Typography variant="body2" color="text.secondary">Active Assessments</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent display="flex" alignItems="center" gap={2}>
              <Box p={1.5} borderRadius={3} bgcolor="rgba(99, 102, 241, 0.15)" color="#6366f1"><GroupIcon fontSize="large" /></Box>
              <Box>
                <Typography variant="h4" fontWeight={800}>{stats.totalCandidatesInvited}</Typography>
                <Typography variant="body2" color="text.secondary">Invited Candidates</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent display="flex" alignItems="center" gap={2}>
              <Box p={1.5} borderRadius={3} bgcolor="rgba(16, 185, 129, 0.15)" color="#10b981"><CheckCircleIcon fontSize="large" /></Box>
              <Box>
                <Typography variant="h4" fontWeight={800}>{stats.completedCandidates}</Typography>
                <Typography variant="body2" color="text.secondary">Completed Tests</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent display="flex" alignItems="center" gap={2}>
              <Box p={1.5} borderRadius={3} bgcolor="rgba(245, 158, 11, 0.15)" color="#f59e0b"><CheckCircleIcon fontSize="large" /></Box>
              <Box>
                <Typography variant="h4" fontWeight={800}>{stats.completionRate}%</Typography>
                <Typography variant="body2" color="text.secondary">Completion Rate</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight={700} mb={2}>Top Candidate Evaluation Leaderboard</Typography>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Candidate Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Assessment Title</TableCell>
              <TableCell align="right">Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.topCandidates?.map((cand, idx) => (
              <TableRow key={idx} hover>
                <TableCell fontWeight={600}>{cand.name}</TableCell>
                <TableCell color="text.secondary">{cand.email}</TableCell>
                <TableCell>{cand.assessmentTitle}</TableCell>
                <TableCell align="right">
                  <Chip label={`${cand.score}/100`} color="success" fontWeight={700} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
