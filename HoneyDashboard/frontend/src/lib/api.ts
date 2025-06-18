const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getHoneypots() {
  const res = await fetch(`${API_URL}/honeypots/`);
  return res.json();
}

export async function createHoneypot(ip: string, protocol: string, port: number, image?: string) {
  const res = await fetch(`${API_URL}/honeypot/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ip, protocol, port, image }),
  });

  return res.json();
}

export async function deleteHoneypot(ip: string, protocol: string) {
  const url = new URL(`${API_URL}/honeypot/`);
  url.searchParams.append('ip', ip);
  url.searchParams.append('protocol', protocol);

  const res = await fetch(url.toString(), {
    method: 'DELETE',
  });

  return res.json();
}
