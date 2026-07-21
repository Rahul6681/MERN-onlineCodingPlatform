import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Alert, Chip, Paper, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Timer as TimerIcon, Lock as LockIcon, Code as CodeIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetContestByIdQuery, useGetContestLeaderboardQuery } from '../../api/apiSlice';
import { getSocket } from '../../sockets/socketClient';

export default function ContestArena() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: contestRes } = useGetContestByIdQuery(id);
  const { data: leaderboardRes } = useGetContestLeaderboardQuery(id, { pollingInterval: 10000 });

  const contest = contestRes?.data;
  const leaderboard = leaderboardRes?.data;

  const [timeLeft, setTimeLeft] = useState('02:00:00');

  useEffect(() => {
    const socket = getSocket();
    socket.emit('contest:join', id);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const parts = prev.split(':').map(Number);
        let seconds = parts[0] * 3600 + parts[1] * 60 + parts[2] - 1;
        if (seconds <= 0) return '00:00:00';
        const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        return `${h}:${m}:${s}`;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [id]);

  if (!contest) return <Box p={4}>Loading contest arena...</Box>;

  return (
    <Box p={3}>
      {/* Contest Top Banner */}
      <Card sx={{ p: 2, mb: 4, background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)', color: '#fff' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight={800}>{contest.name}</Typography>
            <Typography variant="body2">{contest.description}</Typography>
          </Box>
          <Box textAlign="right">
            <Box display="flex" alignItems="center" gap={1} bgcolor="rgba(0,0,0,0.3)" p={1.5} borderRadius={3}>
              <TimerIcon fontSize="large" color="warning" />
              <Typography variant="h4" fontWeight={800} fontFamily="Fira Code">{timeLeft}</Typography>
            </Box>
          </Box>
        </Box>
      </Card>

      {leaderboard?.isFrozen && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 3 }}>
          🔒 <strong>Leaderboard Frozen!</strong> Rankings are now hidden for the final 10 minutes of the contest.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Side: Contest Problem Set */}
        <Grid item xs={12} md={7}>
          <Typography variant="h6" fontWeight={700} mb={2}>Contest Problems</Typography>
          {contest.problems?.map((p, idx) => (
            <Card key={p._id} sx={{ mb: 2 }}>
              <CardContent display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography fontWeight={700}>Problem {String.fromCharCode(65 + idx)}: {p.title}</Typography>
                  <Chip label={p.difficulty} size="small" color={p.difficulty === 'Easy' ? 'success' : p.difficulty === 'Medium' ? 'warning' : 'error'} sx={{ mt: 1 }} />
                </Box>
                <Button variant="contained" startIcon={<CodeIcon />} onClick={() => navigate(`/student/problem/${p.slug}`)}>
                  Solve Challenge
                </Button>
              </CardContent>
            </Card>
          ))}
        </Grid>

        {/* Right Side: Real-time Leaderboard */}
        <Grid item xs={12} md={5}>
          <Typography variant="h6" fontWeight={700} mb={2}>Live Standings</Typography>
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Participant</TableCell>
                  <TableCell align="right">Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaderboard?.standings?.map((entry) => (
                  <TableRow key={entry.user?._id}>
                    <TableCell fontWeight={700}>#{entry.rank}</TableCell>
                    <TableCell>{entry.user?.name || 'Coder'}</TableCell>
                    <TableCell align="right" fontWeight={700} color="primary.main">{entry.score} pts</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
