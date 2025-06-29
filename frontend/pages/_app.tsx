import * as React from 'react';
import type { AppProps } from 'next/app';
import { ThemeProvider, CssBaseline, createTheme, AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useRouter } from 'next/router';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
    background: { default: '#f4f6f8' },
  },
});

function TopBanner() {
  const router = useRouter();
  const isAuthPage = router.pathname === '/login' || router.pathname === '/signup';

  const handleSignOut = () => {
    // Remove token cookie
    document.cookie = 'token=; Max-Age=0; path=/';
    router.push('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => router.push('/dashboard')}>
          Kibou B2B Tender Management
        </Typography>
        {!isAuthPage && (
          <Button color="inherit" onClick={handleSignOut}>Sign Out</Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TopBanner />
      <Component {...pageProps} />
    </ThemeProvider>
  );
} 