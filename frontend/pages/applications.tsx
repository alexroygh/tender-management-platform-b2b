import { GetServerSideProps } from 'next';
import { parseCookies } from '../utils/parseCookies';
import { useRouter } from 'next/router';

export default function Applications({ applications, error }: any) {
  const router = useRouter();
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!applications) return <div>Loading...</div>;
  return (
    <div style={{ maxWidth: 800, margin: 'auto', padding: 32 }}>
      <h2>Applications for Tender {router.query.tenderId}</h2>
      <a href="/dashboard">Back to Dashboard</a>
      <ul style={{ marginTop: 24 }}>
        {applications.length === 0 ? (
          <li>No applications found for this tender.</li>
        ) : (
          applications.map((app: any) => (
            <li key={app.id} style={{ marginBottom: 16 }}>
              <b>Company ID:</b> {app.company_id}<br />
              <b>Proposal:</b> {app.proposal}<br />
            </li>
          ))
        )}
      </ul>
    </div>
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
  } catch (err: any) {
    return { props: { error: err.message } };
  }
}; 