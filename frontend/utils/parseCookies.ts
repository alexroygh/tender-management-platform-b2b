export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach(cookie => {
    const [key, ...rest] = cookie.trim().split('=');
    cookies[key] = decodeURIComponent(rest.join('='));
  });
  return cookies;
} 