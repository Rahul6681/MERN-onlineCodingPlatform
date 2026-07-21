import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon, Code as CodeIcon, CheckCircleOutline as SolvedIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetProblemsQuery, useGetMySubmissionsQuery } from '../../api/apiSlice';

export default function ProblemList() {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const { data, isLoading } = useGetProblemsQuery({ search, difficulty });
  const { data: submissionsData } = useGetMySubmissionsQuery(undefined, { skip: !isAuthenticated });

  const problems = data?.data?.problems || [];
  const submissions = submissionsData?.data || [];

  // Set of solved problem IDs
  const solvedProblemIds = new Set(
    submissions
      .filter((s) => s.status === 'Accepted')
      .map((s) => s.problem?._id || s.problem)
  );

  const getDiffColor = (diff) => {
    if (diff === 'Easy') return '#00b8a3';
    if (diff === 'Medium') return '#ffc01e';
    return '#ff375f';
  };

  return (
    <Box p={3} bgcolor="#1a1a1a" minHeight="calc(100vh - 56px)">
      <Typography variant="h4" fontWeight={800} color="#eff1f6" gutterBottom>
        Problem Practice Set
      </Typography>
      <Typography variant="body1" color="#9ea0a5" mb={4}>
        Explore curated LeetCode-style algorithmic challenges across data structures and algorithms.
      </Typography>

      {/* Filter controls */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          placeholder="Search problems by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            width: 320,
            '& .MuiInputBase-root': { bgcolor: '#282828', color: '#eff1f6', borderColor: '#3e3e3e' },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9ea0a5' }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          select
          label="Difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          sx={{
            width: 180,
            '& .MuiInputBase-root': { bgcolor: '#282828', color: '#eff1f6' },
            '& .MuiInputLabel-root': { color: '#9ea0a5' },
          }}
        >
          <MenuItem value="">All Difficulties</MenuItem>
          <MenuItem value="Easy">Easy</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="Hard">Hard</MenuItem>
        </TextField>
      </Box>

      {/* Problem Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden', bgcolor: '#282828', borderColor: '#3e3e3e' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#1e1e1e' }}>
            <TableRow>
              <TableCell sx={{ color: '#9ea0a5', fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ color: '#9ea0a5', fontWeight: 600 }}>Title</TableCell>
              <TableCell sx={{ color: '#9ea0a5', fontWeight: 600 }}>Difficulty</TableCell>
              <TableCell sx={{ color: '#9ea0a5', fontWeight: 600 }}>Tags</TableCell>
              <TableCell sx={{ color: '#9ea0a5', fontWeight: 600 }}>Companies</TableCell>
              <TableCell align="right" sx={{ color: '#9ea0a5', fontWeight: 600 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: '#9ea0a5' }}>Loading problem set...</TableCell>
              </TableRow>
            ) : problems.length ? (
              problems.map((p) => {
                const isSolved = solvedProblemIds.has(p._id);
                return (
                  <TableRow key={p._id} hover sx={{ '&:hover': { bgcolor: '#333333 !important' } }}>
                    <TableCell width="80px">
                      {isSolved && (
                        <SolvedIcon sx={{ color: '#00b8a3', fontSize: 20 }} titleAccess="Solved" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600} color="#eff1f6">
                        {p.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={p.difficulty}
                        size="small"
                        sx={{ fontWeight: 700, bgcolor: getDiffColor(p.difficulty), color: '#fff' }}
                      />
                    </TableCell>
                    <TableCell>
                      {p.tags?.map((t) => (
                        <Chip key={t} label={t} size="small" variant="outlined" sx={{ mr: 0.5, borderColor: '#3e3e3e', color: '#9ea0a5' }} />
                      ))}
                    </TableCell>
                    <TableCell>
                      {p.companies?.map((c) => (
                        <Chip key={c} label={c} size="small" sx={{ mr: 0.5, bgcolor: 'rgba(255, 161, 22, 0.15)', color: '#ffa116', border: '1px solid #ffa116' }} />
                      ))}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CodeIcon />}
                        sx={{ bgcolor: '#ffa116', color: '#000', '&:hover': { bgcolor: '#ffb84d' } }}
                        onClick={() => navigate(`/student/problem/${p.slug}`)}
                      >
                        {isSolved ? 'Solve Again' : 'Solve'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: '#9ea0a5' }}>No problems found matching criteria.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
