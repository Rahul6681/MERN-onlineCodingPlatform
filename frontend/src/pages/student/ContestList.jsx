import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Chip } from '@mui/material';
import { EmojiEvents as EmojiEventsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetContestsQuery, useJoinContestMutation } from '../../api/apiSlice';

export default function ContestList() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetContestsQuery();
  const [joinContestApi] = useJoinContestMutation();

  const contests = data?.data || [];

  const handleJoin = async (id) => {
    try {
      await joinContestApi(id).unwrap();
      navigate(`/student/contest/${id}`);
    } catch (e) {
      navigate(`/student/contest/${id}`);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Coding Contests
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Participate in timed weekly and hiring contests to boost your global rating.
      </Typography>

      <Grid container spacing={3}>
        {contests.map((c) => (
          <Grid item xs={12} md={6} key={c._id}>
            <Card sx={{ p: 1, borderLeft: '4px solid #6366f1' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Chip
                    label={c.isLive ? 'LIVE NOW' : 'UPCOMING'}
                    color={c.isLive ? 'error' : 'primary'}
                    size="small"
                    fontWeight={700}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Duration: {c.durationMinutes} mins
                  </Typography>
                </Box>

                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {c.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  {c.description}
                </Typography>

                <Button
                  variant="contained"
                  color={c.isLive ? 'error' : 'primary'}
                  startIcon={<EmojiEventsIcon />}
                  onClick={() => handleJoin(c._id)}
                  fullWidth
                >
                  {c.isLive ? 'Enter Live Arena' : 'Register / View Arena'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
