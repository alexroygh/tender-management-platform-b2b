import { GetServerSideProps } from 'next';
import { parseCookies } from '../utils/parseCookies';
import {
  Container,
  Typography,
  Button,
  Box,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TableContainer
} from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

type Application = {
  id: number;
  tender_id: number;
  tender_title: string;
  tender_deadline: string;
  proposal: string;
};

interface AppliedTendersProps {
  applications?: Application[];
  error?: string;
}

export default function AppliedTenders({ applications, error }: AppliedTendersProps) {
  if (error) return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Alert severity="error">{error}</Alert>
      <Box mt={2}><Button href="/dashboard" variant="outlined">Back to Dashboard</Button></Box>
    </Container>
  );
  if (!applications) return (
    <Container maxWidth="sm" sx={{ mt: 8 }}><Typography>Loading...</Typography></Container>
  );
  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>Applied Tenders</Typography>
      {applications.length === 0 ? (
        <Alert severity="info" sx={{ mb: 4 }}>You have not applied to any tenders yet.</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Tender Title</b></TableCell>
                <TableCell><b>Deadline</b></TableCell>
                <TableCell><b>Proposal</b></TableCell>
                <TableCell align="center"><b>Action</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((app: Application) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AssignmentTurnedInIcon color="primary" fontSize="small" />
                      <Typography variant="subtitle1">{app.tender_title}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{app.tender_deadline}</TableCell>
                  <TableCell>{app.proposal}</TableCell>
                  <TableCell align="center">
                    <Button href={`/tender/${app.tender_id || ''}`} variant="outlined" size="small">View Tender</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Box mt={4}>
        <Button href="/dashboard" variant="outlined">Back to Dashboard</Button>
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
    // Fetch company for user
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
    // Fetch applications for this company
    const appsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/applications/company/${company.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!appsRes.ok) {
      const text = await appsRes.text();
      throw new Error(`Failed to fetch applications: ${appsRes.status} ${text}`);
    }
    const applications = await appsRes.json();
    return { props: { applications } };
  } catch (err: unknown) {
    return { props: { error: err instanceof Error ? err.message : 'An error occurred' } };
  }
}; 