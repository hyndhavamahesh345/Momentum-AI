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

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  return response;
}
