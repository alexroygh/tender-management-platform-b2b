export default function Home() {
  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 32 }}>
      <h1>B2B Tender Management</h1>
      <p>Welcome to the MVP platform for B2B tender management.</p>
      <ul>
        <li><a href="/login">Login</a></li>
        <li><a href="/signup">Sign Up</a></li>
        <li><a href="/dashboard">Dashboard</a></li>
        <li><a href="/tenders">Tenders</a></li>
        <li><a href="/search">Search Companies</a></li>
      </ul>
    </div>
  );
}
