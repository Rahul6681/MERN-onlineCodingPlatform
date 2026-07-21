import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Avatar, Chip } from '@mui/material';
import { useGetGlobalLeaderboardQuery } from '../../api/apiSlice';

export default function LeaderboardPage() {
  const { data, isLoading } = useGetGlobalLeaderboardQuery();
  const standings = data?.data || [];

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Global ELO Leaderboard
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Top competitive programmers ranked across contests and total problem evaluations.
      </Typography>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>User</TableCell>
              <TableCell>University / Org</TableCell>
              <TableCell align="right">Contest Rating</TableCell>
              <TableCell align="right">Problems Solved</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} align="center">Loading global leaderboard...</TableCell></TableRow>
            ) : standings.map((row) => (
              <TableRow key={row.rank} hover>
                <TableCell fontWeight={700}>
                  {row.rank === 1 ? '🥇 #1' : row.rank === 2 ? '🥈 #2' : row.rank === 3 ? '🥉 #3' : `#${row.rank}`}
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar src={row.user?.avatarUrl} sx={{ width: 32, height: 32 }} />
                    <Typography fontWeight={600}>{row.user?.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell color="text.secondary">{row.user?.university}</TableCell>
                <TableCell align="right">
                  <Chip label={row.rating} color="primary" fontWeight={700} size="small" />
                </TableCell>
                <TableCell align="right" fontWeight={700}>{row.problemsSolved}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
