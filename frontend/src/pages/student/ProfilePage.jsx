import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Avatar, Chip, Divider, Paper } from '@mui/material';
import { useSelector } from 'react-redux';
import { useGetMyAchievementsQuery } from '../../api/apiSlice';

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const { data: achievementRes } = useGetMyAchievementsQuery();

  const achievements = achievementRes?.data?.badges || [];

  return (
    <Box p={3}>
      <Card sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)' }}>
        <Box display="flex" alignItems="center" gap={3}>
          <Avatar src={user?.avatarUrl} sx={{ width: 80, height: 80, border: '3px solid #6366f1' }} />
          <Box>
            <Typography variant="h4" fontWeight={800}>{user?.name}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
            <Box display="flex" gap={1} mt={1}>
              <Chip label={`Role: ${user?.role}`} size="small" color="primary" />
              <Chip label={`Rating: ${user?.stats?.contestRating || 1200}`} size="small" color="secondary" />
            </Box>
          </Box>
        </Box>
      </Card>

      <Typography variant="h5" fontWeight={700} gutterBottom>
        Badges & Achievements
      </Typography>
      <Grid container spacing={3} mb={4}>
        {achievements.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.badge._id}>
            <Card sx={{ p: 2, opacity: item.unlocked ? 1 : 0.4, border: item.unlocked ? '1px solid #10b981' : '1px solid transparent' }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar src={item.badge.iconUrl} sx={{ width: 48, height: 48 }} />
                <Box>
                  <Typography fontWeight={700}>{item.badge.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{item.badge.description}</Typography>
                  {item.unlocked && <Chip label="UNLOCKED" color="success" size="small" sx={{ mt: 1, height: 20 }} />}
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
