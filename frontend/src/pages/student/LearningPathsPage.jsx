import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Chip } from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetLearningPathsQuery } from '../../api/apiSlice';

export default function LearningPathsPage() {
  const navigate = useNavigate();
  const { data } = useGetLearningPathsQuery();

  const paths = data?.data || [];

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Curated Learning Paths
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Step-by-step roadmap collections designed to help you conquer DSA interview prep.
      </Typography>

      <Grid container spacing={3}>
        {paths.map((lp) => (
          <Grid item xs={12} md={6} key={lp._id}>
            <Card sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Chip label={lp.difficulty} color="primary" size="small" sx={{ mb: 1 }} />
                <Typography variant="h5" fontWeight={700} gutterBottom>{lp.title}</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>{lp.description}</Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={3}>
                  Includes {lp.problems?.length || 0} curated problem challenges
                </Typography>
              </Box>
              <Button variant="contained" color="primary" startIcon={<SchoolIcon />} onClick={() => navigate('/student/problems')}>
                Start Roadmap Track
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
