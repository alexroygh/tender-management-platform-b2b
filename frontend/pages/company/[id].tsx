import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Box,
  Alert,
  Button
} from '@mui/material';

export default function PublicCompanyProfile({ company, error }: any) {
  const router = useRouter();
  if (error) return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Alert severity="error">{error}</Alert>
      <Box mt={2}><Button href="/search" variant="outlined">Back to Search</Button></Box>
    </Container>
  );
  if (!company) return <Container sx={{ mt: 8 }}><Typography>Loading...</Typography></Container>;
  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Card>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <Avatar src={company.logo_url} alt="Logo" sx={{ width: 80, height: 80, mb: 1 }} />
          </Box>
          <Typography variant="h5" gutterBottom>{company.name}</Typography>
          <Typography color="text.secondary" gutterBottom>{company.industry}</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>{company.description}</Typography>
          <Box mt={2}>
            {company.goods_and_services?.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>Goods & Services:</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {company.goods_and_services.map((g: string) => (
                    <Chip key={g} label={g} color="primary" size="small" />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
      <Box mt={4}>
        <Button href="/search" variant="outlined">Back to Search</Button>
      </Box>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { id } = ctx.query;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/companies/${id}`);
    if (!res.ok) {
      const data = await res.json();
      return { props: { error: data.message || 'Company not found' } };
    }
    const company = await res.json();
    return { props: { company } };
  } catch (err: any) {
    return { props: { error: err.message } };
  }
}; 