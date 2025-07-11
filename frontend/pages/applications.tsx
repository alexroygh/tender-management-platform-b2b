import { useEffect, useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Alert
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { GetServerSideProps } from 'next';
import { parseCookies } from '../utils/parseCookies';

type Application = {
  id: number;
  tender_id: number;
  tender_title?: string;
  proposal: string;
  company_id: number;
};

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/applications')
      .then(res => res.json())
      .then(setApplications)
      .catch(() => setError('Failed to fetch applications'));
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>Applications</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={2}>
        {applications.length === 0 ? (
          <Grid><Typography>No applications found.</Typography></Grid>
        ) : (
          applications.map((app: Application) => (
            <Grid key={app.id}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600}>Tender: {app.tender_title || app.tender_id}</Typography>
                  <Typography color="text.secondary" variant="body2">Proposal: {app.proposal}</Typography>
                  <Typography color="text.secondary" variant="body2">Company: {app.company_id}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookies = parseCookies(ctx.req.headers.cookie);
  const token = cookies.token;
  const { tenderId } = ctx.query;
  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  if (!tenderId) {
    return { props: { error: 'No tenderId provided' } };
  }
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/applications/tender/${tenderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const applications = await res.json();
    return { props: { applications } };
  } catch (err: unknown) {
    return { props: { error: err instanceof Error ? err.message : 'An error occurred' } };
  }
}; 