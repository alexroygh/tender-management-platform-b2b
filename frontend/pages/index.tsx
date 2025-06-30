import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 32 }}>
      <h1>B2B Tender Management</h1>
      <p>Welcome to the MVP platform for B2B tender management.</p>
      <ul>
        <li><Link href="/login">Login</Link></li>
        <li><Link href="/signup">Sign Up</Link></li>
        <li><Link href="/dashboard">Dashboard</Link></li>
        <li><Link href="/tenders">Tenders</Link></li>
        <li><Link href="/search">Search Companies</Link></li>
      </ul>
    </div>
  );
}
