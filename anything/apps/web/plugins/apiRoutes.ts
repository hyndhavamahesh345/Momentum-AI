import { normalizePath, type Plugin } from 'vite';

/**
 * Transforms Next.js-style API route files (route.js) into
 * React Router v7 resource routes by appending `loader` / `action` exports.
 *
 * Mapping:
 *   GET    → loader
 *   POST / PUT / PATCH / DELETE → action (dispatched by request.method)
 */
export function apiRoutesPlugin(): Plugin {
  return {
    name: 'api-routes-compat',
    enforce: 'pre',

    transform(code: string, id: string) {
      const normalized = normalizePath(id);
      // Only target route.js files inside src/app/api/
      if (!normalized.includes('/app/api/') || !normalized.endsWith('/route.js')) {
        return null;
      }
      // Skip if already has React Router exports
      if (
        code.includes('export async function loader') ||
        code.includes('export async function action')
      ) {
        return null;
      }

      const compat = `

// ─── React Router v7 Resource Route Compatibility (auto-injected) ────────────
export async function loader({ request }) {
  if (typeof GET !== 'undefined') return GET(request);
  return new Response(null, { status: 405, statusText: 'Method Not Allowed' });
}

export async function action({ request }) {
  const method = request.method.toUpperCase();
  if (method === 'POST'   && typeof POST   !== 'undefined') return POST(request);
  if (method === 'PUT'    && typeof PUT    !== 'undefined') return PUT(request);
  if (method === 'PATCH'  && typeof PATCH  !== 'undefined') return PATCH(request);
  if (method === 'DELETE' && typeof DELETE !== 'undefined') return DELETE(request);
  return new Response(null, { status: 405, statusText: 'Method Not Allowed' });
}
`;
      return { code: code + compat, map: null };
    },
  };
}
