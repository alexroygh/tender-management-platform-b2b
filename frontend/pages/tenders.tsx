import { useEffect, useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert
} from '@mui/material';
import Grid from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import { GetServerSideProps } from 'next';
import { parseCookies } from '../utils/parseCookies';

type Tender = {
  id: number;
  title: string;
  description: string;
  deadline: string;
  budget: number;
  company_id: number;
};

export default function Tenders() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [budget, setBudget] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(9); // 9 per page for 3x3 grid
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tenders?page=${page}&limit=${limit}`)
      .then(res => res.json())
      .then(data => {
        setTenders(data.tenders);
        setTotal(data.total);
        setLoading(false);
      });
  }, [page, limit]);

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

  const totalPages = Math.ceil(total / limit);

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
        {loading ? (
          <Grid ><Typography>Loading...</Typography></Grid>
        ) : tenders.length === 0 ? (
          <Grid><Typography>No tenders found.</Typography></Grid>
        ) : (
          tenders.map((t: Tender) => (
            <Grid key={t.id}>
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
      <Box display="flex" justifyContent="center" alignItems="center" mt={4} gap={2}>
        <Button variant="outlined" onClick={() => setPage(page - 1)} disabled={page === 1 || loading}>Previous</Button>
        <Typography>Page {page} of {totalPages || 1}</Typography>
        <Button variant="outlined" onClick={() => setPage(page + 1)} disabled={page === totalPages || loading || totalPages === 0}>Next</Button>
      </Box>
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
    // SSR will just return an empty list, client will fetch paginated
    return { props: { error: null, initialTenders: [] } };
  } catch (err: unknown) {
    return { props: { error: err instanceof Error ? err.message : 'An error occurred', initialTenders: [] } };
  }
};
