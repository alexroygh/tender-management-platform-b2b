import { GetServerSideProps } from 'next';
import { parseCookies } from '../utils/parseCookies';

export default function AppliedTenders({ applications, error }: any) {
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!applications) return <div>Loading...</div>;
  return (
    <div style={{ maxWidth: 800, margin: 'auto', padding: 32 }}>
      <h2>Applied Tenders</h2>
      {applications.length === 0 ? (
        <div>You have not applied to any tenders yet.</div>
      ) : (
        <ul>
          {applications.map((app: any) => (
            <li key={app.id} style={{ marginBottom: 16 }}>
              <strong>{app.tender_title}</strong> (Deadline: {app.tender_deadline})<br />
              Proposal: {app.proposal}
            </li>
          ))}
        </ul>
      )}
      <a href="/dashboard">Back to Dashboard</a>
    </div>
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
  } catch (err: any) {
    return { props: { error: err.message } };
  }
}; 