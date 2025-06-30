import { GetServerSideProps } from 'next';
import { parseCookies } from '../utils/parseCookies';
import {
  Typography,
  Container,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Avatar,
  Chip,
  Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

export default function Dashboard({ company, tenders, error }: any) {
  if (error) return <Container sx={{ mt: 8 }}><Typography color="error">{error}</Typography></Container>;
  if (!company) return <Container sx={{ mt: 8 }}><Typography>Loading...</Typography></Container>;
  return (
    <>
      {/* Removed local AppBar to avoid duplicate banner; global AppBar is now used */}
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Company Profile</Typography>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Avatar src={company.logo_url} alt="Logo" sx={{ width: 80, height: 80 }} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">{company.name}</Typography>
                <Typography color="text.secondary">{company.industry}</Typography>
                <Typography sx={{ mt: 1 }}>{company.description}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                  {company.goods_and_services?.map((g: string) => (
                    <Chip key={g} label={g} color="primary" size="small" />
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <Button href={`/company?id=${company.id}`} startIcon={<EditIcon />} variant="outlined">Edit Company</Button>
          </CardActions>
        </Card>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h5">Your Tenders</Typography>
          <Stack direction="row" spacing={2}>
            <Button href="/tenders" variant="contained" startIcon={<AddIcon />}>Create/View Tenders</Button>
            <Button href="/applied-tenders" variant="contained" color="secondary" startIcon={<AssignmentTurnedInIcon />}>Applied Tenders</Button>
            <Button href="/search" variant="outlined">Search Companies</Button>
          </Stack>
        </Box>
        <Grid container spacing={2}>
          {tenders.length === 0 ? (
            <Grid item xs={12}><Typography>No tenders found for your company.</Typography></Grid>
          ) : (
            tenders.map((t: any) => (
              <Grid item xs={12} sm={6} md={4} key={t.id}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600}>{t.title}</Typography>
                    <Typography color="text.secondary" variant="body2">Deadline: {t.deadline}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </>
  );
}

function decodeJwt(token: string): any {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
  } catch {
    return null;
  }
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
    // Decode JWT to get userId
    const decoded = decodeJwt(token);
    const userId = decoded?.userId;
    if (!userId) {
      return { props: { error: 'Invalid token' } };
    }
    // Fetch company by user id
    const companyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/companies/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!companyRes.ok) {
      const text = await companyRes.text();
      throw new Error(`Failed to fetch company: ${companyRes.status} ${text}`);
    }
    const company = await companyRes.json();
    if (!company.id) {
      return { props: { error: 'No company found for user' } };
    }
    // Fetch all tenders for this company
    const tendersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/tenders/company/${company.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!tendersRes.ok) {
      const text = await tendersRes.text();
      throw new Error(`Failed to fetch tenders: ${tendersRes.status} ${text}`);
    }
    const tenders = await tendersRes.json();
    return { props: { company, tenders } };
  } catch (err: any) {
    return { props: { error: err.message } };
  }
};
