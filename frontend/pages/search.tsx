import { GetServerSideProps } from 'next';
import { parseCookies } from '../utils/parseCookies';
import { useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

type Company = {
  id: number;
  name: string;
  industry: string;
  description: string;
  goods_and_services: string[];
  logo_url?: string;
};

interface SearchProps {
  initialResults: Company[];
  error?: string;
}

export default function Search({ initialResults, error }: SearchProps) {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [goods, setGoods] = useState('');
  const [results, setResults] = useState<Company[]>(initialResults || []);
  const [formError, setFormError] = useState(error || '');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError(''); setLoading(true);
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (industry) params.append('industry', industry);
    if (goods) params.append('goods', goods);
    const res = await fetch(`/api/search/companies?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setFormError(data.message || 'Search failed'); return; }
    setResults(data as Company[]);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>Search Companies</Typography>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
              sx={{ flex: 1, minWidth: 180 }}
            />
            <TextField
              label="Industry"
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              sx={{ flex: 1, minWidth: 180 }}
            />
            <TextField
              label="Goods/Services"
              value={goods}
              onChange={e => setGoods(e.target.value)}
              sx={{ flex: 1, minWidth: 180 }}
            />
            <Button type="submit" variant="contained" color="primary" sx={{ height: 56, minWidth: 120 }} startIcon={<SearchIcon />} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </Box>
          {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
        </CardContent>
      </Card>
      <Grid container spacing={2}>
        {results.length === 0 ? (
          <Grid item xs={12}><Typography>No companies found.</Typography></Grid>
        ) : (
          results.map((c: Company) => (
            <Grid item xs={12} sm={6} md={4} key={c.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{c.name}</Typography>
                  <Typography color="text.secondary">{c.industry}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>{c.description}</Typography>
                  <Button href={`/company/${c.id}`} variant="outlined" sx={{ mt: 2 }}>View Company</Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
      <Box mt={4}>
        <Button href="/dashboard" variant="outlined">Back to Dashboard</Button>
      </Box>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps<SearchProps> = async (ctx) => {
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
  const { name = '', industry = '', goods = '' } = ctx.query;
  if (!name && !industry && !goods) {
    return { props: { initialResults: [] } };
  }
  try {
    const params = new URLSearchParams();
    if (name) params.append('name', String(name));
    if (industry) params.append('industry', String(industry));
    if (goods) params.append('goods', String(goods));
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/search/companies?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const initialResults = await res.json();
    return { props: { initialResults } };
  } catch (err: any) {
    return { props: { error: err.message } };
  }
};
