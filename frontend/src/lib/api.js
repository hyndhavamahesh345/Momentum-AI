import { useAuth } from '@/store/auth';

export async function apiFetch(endpoint, options = {}) {
  const { token } = useAuth.getState();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const baseUrl = import.meta.env.VITE_API_URL || '';
  const url = endpoint.startsWith('/') ? `${baseUrl}${endpoint}` : endpoint;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}
