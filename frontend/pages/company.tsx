import { useEffect, useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Chip,
  Stack,
  Alert
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import UploadIcon from '@mui/icons-material/Upload';

interface Company {
  id: number;
  name: string;
  industry: string;
  description: string;
  goods_and_services: string[];
  logo_url?: string;
}

export default function Company() {
  const [company, setCompany] = useState<Company | null>(null);
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [goods, setGoods] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/companies/me', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(res => res.json())
      .then((data: Company) => {
        setCompany(data);
        setName(data.name || '');
        setIndustry(data.industry || '');
        setDescription(data.description || '');
        setGoods((data.goods_and_services || []).join(', '));
        setLogoUrl(data.logo_url || '');
      });
  }, []);

  function getToken() {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(/token=([^;]+)/);
    return match ? match[1] : '';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const goodsArr = goods.split(',').map(g => g.trim()).filter(Boolean);
    const res = await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ name, industry, description, goods_and_services: goodsArr }),
    });
    const data: Company = await res.json();
    if (res.ok) {
      setSuccess('Company profile updated!');
      setCompany(data);
      setLogoUrl(data.logo_url ?? '');
    } else {
      setError((data as unknown as { message?: string })?.message ?? 'Failed to update company');
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleLogoUpload = async () => {
    setError('');
    setSuccess('');
    if (!logoFile || !company) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const res = await fetch(`/api/companies/${company.id}/logo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ image: base64 }),
      });
      const data: Company = await res.json();
      if (res.ok) {
        setLogoUrl(data.logo_url ?? '');
        setSuccess('Logo uploaded!');
      } else {
        setError((data as unknown as { message?: string })?.message ?? 'Failed to upload logo');
      }
    };
    reader.readAsDataURL(logoFile);
  };

  if (!company) return <Container sx={{ mt: 8 }}><Typography>Loading...</Typography></Container>;

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>Company Profile</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <Avatar src={logoUrl} alt="Logo" sx={{ width: 80, height: 80, mb: 1 }} />
            <Button component="label" startIcon={<UploadIcon />} variant="outlined" sx={{ mb: 1 }}>
              Upload Logo
              <input type="file" accept="image/*" hidden onChange={handleLogoChange} />
            </Button>
            <Button onClick={handleLogoUpload} disabled={!logoFile} variant="contained" color="primary" size="small">Save Logo</Button>
          </Box>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Name" value={name} onChange={e => setName(e.target.value)} required fullWidth />
            <TextField label="Industry" value={industry} onChange={e => setIndustry(e.target.value)} fullWidth />
            <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} multiline rows={3} fullWidth />
            <TextField label="Goods/Services (comma separated)" value={goods} onChange={e => setGoods(e.target.value)} fullWidth />
            <Button type="submit" variant="contained" color="primary" startIcon={<SaveIcon />}>Save</Button>
          </Box>
          <Box mt={2}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {company.goods_and_services?.map((g: string) => (
                <Chip key={g} label={g} color="primary" size="small" />
              ))}
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
