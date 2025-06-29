import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';

export default function Company() {
  const [company, setCompany] = useState<any>(null);
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [goods, setGoods] = useState<string>('');
  const [logo, setLogo] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { id } = router.query;
  const isReadOnly = Boolean(id);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const url = id ? `/api/companies/${id}` : null;
    if (url) {
      fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.message) throw new Error(data.message);
          setCompany(data);
          setName(data.name || '');
          setIndustry(data.industry || '');
          setDescription(data.description || '');
          setGoods((data.goods_and_services || []).join(', '));
          setLogoUrl(data.logo_url || '');
        })
        .catch(err => setError(err.message));
    }
  }, [router, id]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogo(reader.result?.toString().split(',')[1] || '');
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async () => {
    setError(''); setSuccess('');
    const token = localStorage.getItem('token');
    if (!logo) { setError('No logo selected'); return; }
    const filename = `logo_${Date.now()}.png`;
    const res = await fetch(`/api/companies/${company.id}/logo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ image: logo, filename }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.message || 'Upload failed'); return; }
    setLogoUrl(data.logo_url); setSuccess('Logo uploaded!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    const token = localStorage.getItem('token');
    const goodsArr = goods.split(',').map(g => g.trim()).filter(Boolean);
    const res = await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, industry, description, goods_and_services: goodsArr }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.message || 'Save failed'); return; }
    setSuccess('Profile saved!');
  };

  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!company) return <div>Loading...</div>;

  if (isReadOnly) {
    return (
      <div style={{ maxWidth: 600, margin: 'auto', padding: 32 }}>
        <h2>Company Profile</h2>
        <div>Name: {company.name}</div>
        <div>Industry: {company.industry}</div>
        <div>Description: {company.description}</div>
        {company.logo_url && <img src={company.logo_url} alt="Logo" style={{ maxWidth: 100, display: 'block', marginBottom: 8 }} />}
        <div>Goods/Services: {company.goods_and_services?.join(', ')}</div>
        <a href="/search">Back to Search</a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 32 }}>
      <h2>Edit Company Profile</h2>
      <form onSubmit={handleSubmit}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required style={{ width: '100%', marginBottom: 8 }} />
        <input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="Industry" style={{ width: '100%', marginBottom: 8 }} />
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" style={{ width: '100%', marginBottom: 8 }} />
        <input value={goods} onChange={e => setGoods(e.target.value)} placeholder="Goods/Services (comma separated)" style={{ width: '100%', marginBottom: 8 }} />
        <div style={{ marginBottom: 8 }}>
          <input type="file" accept="image/*" ref={fileInput} onChange={handleLogoChange} />
          <button type="button" onClick={handleLogoUpload}>Upload Logo</button>
        </div>
        {logoUrl && <img src={logoUrl} alt="Logo" style={{ maxWidth: 100, display: 'block', marginBottom: 8 }} />}
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}
        <button type="submit" style={{ width: '100%' }}>Save</button>
      </form>
      <a href="/dashboard">Back to Dashboard</a>
    </div>
  );
}
