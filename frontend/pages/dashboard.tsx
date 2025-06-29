import { GetServerSideProps } from 'next';
import { parseCookies } from '../utils/parseCookies';

export default function Dashboard({ company, tenders, error }: any) {
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!company) return <div>Loading...</div>;
  return (
    <div style={{ maxWidth: 800, margin: 'auto', padding: 32 }}>
      <h2>Dashboard</h2>
      <h3>Company Profile</h3>
      <div>Name: {company.name}</div>
      <div>Industry: {company.industry}</div>
      <div>Description: {company.description}</div>
      {company.logo_url && <img src={company.logo_url} alt="Logo" style={{ maxWidth: 100 }} />}
      <div>Goods/Services: {company.goods_and_services?.join(', ')}</div>
      <a href={`/company?id=${company.id}`}>Edit Company</a>
      <div style={{ margin: '16px 0' }}>
        <a href="/applied-tenders">
          <button>View Applied Tenders</button>
        </a>
      </div>
      <h3 style={{ marginTop: 32 }}>Your Tenders</h3>
      <a href="/tenders">Create/View Tenders</a>
      <ul>
        {tenders.length === 0 ? (
          <li>No tenders found for your company.</li>
        ) : (
          tenders.map((t: any) => (
            <li key={t.id}>{t.title} (Deadline: {t.deadline})</li>
          ))
        )}
      </ul>
    </div>
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
