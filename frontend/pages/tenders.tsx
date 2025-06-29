import { GetServerSideProps } from 'next';
import { parseCookies } from '../utils/parseCookies';
import { useState } from 'react';

export default function Tenders({ initialTenders, error }: any) {
  const [tenders, setTenders] = useState<any[]>(initialTenders || []);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [budget, setBudget] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError(''); setSuccess('');
    const token = localStorage.getItem('token');
    const res = await fetch('/api/tenders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, description, deadline, budget }),
    });
    const data = await res.json();
    if (!res.ok) { setFormError(data.message || 'Create failed'); return; }
    setSuccess('Tender created!');
    setTenders([data, ...tenders]);
    setShowForm(false);
  };

  const handleApply = async (tenderId: number) => {
    const proposal = prompt('Enter your proposal:');
    if (!proposal) return;
    const token = localStorage.getItem('token');
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ tender_id: tenderId, proposal }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.message || 'Apply failed'); return; }
    alert('Applied!');
  };

  return (
    <div style={{ maxWidth: 800, margin: 'auto', padding: 32 }}>
      <h2>Tenders</h2>
      <button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Create Tender'}</button>
      {showForm && (
        <form onSubmit={handleCreate} style={{ margin: '16px 0' }}>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required style={{ width: '100%', marginBottom: 8 }} />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" style={{ width: '100%', marginBottom: 8 }} />
          <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} required style={{ width: '100%', marginBottom: 8 }} />
          <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="Budget" style={{ width: '100%', marginBottom: 8 }} />
          {formError && <div style={{ color: 'red', marginBottom: 8 }}>{formError}</div>}
          {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}
          <button type="submit" style={{ width: '100%' }}>Create</button>
        </form>
      )}
      <ul>
        {tenders.map((t: any) => (
          <li key={t.id} style={{ marginBottom: 16 }}>
            <b>{t.title}</b> (Deadline: {t.deadline})<br />
            {t.description}<br />
            Budget: {t.budget}<br />
            <button onClick={() => handleApply(t.id)}>Apply</button>
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
  try {
    const tendersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/tenders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const initialTenders = await tendersRes.json();
    return { props: { initialTenders } };
  } catch (err: any) {
    return { props: { error: err.message } };
  }
};
