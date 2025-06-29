import { GetServerSideProps } from 'next';
import { parseCookies } from '../../utils/parseCookies';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert
} from '@mui/material';

export default function TenderDetailsPage({ tender, error }: any) {
  if (error) return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Alert severity="error">{error}</Alert>
      <Box mt={2}><Button href="/applied-tenders" variant="outlined">Back to Applied Tenders</Button></Box>
    </Container>
  );
  if (!tender) return (
    <Container maxWidth="sm" sx={{ mt: 8 }}><Typography>Loading...</Typography></Container>
  );
  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>{tender.title}</Typography>
          <Typography color="text.secondary" gutterBottom>Deadline: {tender.deadline}</Typography>
          <Typography color="text.secondary" gutterBottom>Budget: ${tender.budget}</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>{tender.description}</Typography>
        </CardContent>
      </Card>
      <Box mt={4}>
        <Button href="/applied-tenders" variant="outlined">Back to Applied Tenders</Button>
      </Box>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { id } = ctx.query;
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/tenders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json();
      return { props: { error: data.message || 'Tender not found' } };
    }
    const tender = await res.json();
    return { props: { tender } };
  } catch (err: any) {
    return { props: { error: err.message } };
  }
}; 