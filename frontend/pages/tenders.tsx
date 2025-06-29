import { useEffect, useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { GetServerSideProps } from 'next';
import { parseCookies } from '../utils/parseCookies';

export default function Tenders() {
  const [tenders, setTenders] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [budget, setBudget] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/tenders')
      .then(res => res.json())
      .then(setTenders);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const res = await fetch('/api/tenders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ title, description, deadline, budget }),
    });
    const data = await res.json();
    if (res.ok) {
      setSuccess('Tender created!');
      setTenders([data, ...tenders]);
      setTitle(''); setDescription(''); setDeadline(''); setBudget('');
    } else {
      setError(data.message || 'Failed to create tender');
    }
  };

  function getToken() {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(/token=([^;]+)/);
    return match ? match[1] : '';
  }

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>Tenders</Typography>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Create New Tender</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} required fullWidth />
            <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} multiline rows={2} fullWidth />
            <TextField label="Deadline" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} InputLabelProps={{ shrink: true }} required fullWidth />
            <TextField label="Budget" type="number" value={budget} onChange={e => setBudget(e.target.value)} required fullWidth />
            <Button type="submit" variant="contained" startIcon={<AddIcon />}>Create Tender</Button>
          </Box>
        </CardContent>
      </Card>
      <Grid container spacing={2}>
        {tenders.length === 0 ? (
          <Grid item xs={12}><Typography>No tenders found.</Typography></Grid>
        ) : (
          tenders.map((t: any) => (
            <Grid item xs={12} sm={6} md={4} key={t.id}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600}>{t.title}</Typography>
                  <Typography color="text.secondary" variant="body2">Deadline: {t.deadline}</Typography>
                  <Typography color="text.secondary" variant="body2">Budget: ${t.budget}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>{t.description}</Typography>
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
  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  try {
    const tendersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/tenders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const initialTenders = await tendersRes.json();
    return { props: { initialTenders } };
  } catch (err: any) {
    return { props: { error: err.message } };
  }
};
