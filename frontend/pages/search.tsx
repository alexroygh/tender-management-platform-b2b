import { GetServerSideProps } from 'next';
import { parseCookies } from '../utils/parseCookies';
import { useState } from 'react';

export default function Search({ initialResults, error }: any) {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [goods, setGoods] = useState('');
  const [results, setResults] = useState<any[]>(initialResults || []);
  const [formError, setFormError] = useState(error || '');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (industry) params.append('industry', industry);
    if (goods) params.append('goods', goods);
    const res = await fetch(`/api/search/companies?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) { setFormError(data.message || 'Search failed'); return; }
    setResults(data);
  };

  return (
    <div style={{ maxWidth: 800, margin: 'auto', padding: 32 }}>
      <h2>Search Companies</h2>
      <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={{ marginRight: 8 }} />
        <input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="Industry" style={{ marginRight: 8 }} />
        <input value={goods} onChange={e => setGoods(e.target.value)} placeholder="Goods/Services" style={{ marginRight: 8 }} />
        <button type="submit">Search</button>
      </form>
      {formError && <div style={{ color: 'red', marginBottom: 8 }}>{formError}</div>}
      <ul>
        {results.map((c: any) => (
          <li key={c.id} style={{ marginBottom: 16 }}>
            <b>{c.name}</b> ({c.industry})<br />
            {c.description}<br />
            <a href={`/company?id=${c.id}`}>View Company</a>
          </li>
        ))}
      </ul>
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
