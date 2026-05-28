import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from 'react-router';

import { type ReactNode } from 'react';
import './global.css';
import { Toaster } from 'sonner';

export const links = () => [];

function ErrorDisplay() {
  const error = useRouteError();
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', color: '#1a1a1a' }}>
      <h1>Something went wrong</h1>
      <p>
        {error instanceof Error ? error.message : 'An unexpected error occurred.'}
      </p>
    </div>
  );
}

export const ErrorBoundary = ErrorDisplay;

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <link
          rel="preconnect"
          href="https://ka-p.fontawesome.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://ka-p.fontawesome.com/releases/v6.3.0/css/pro.min.css?token=2c15cc0cc7"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {children}
        <Toaster position="bottom-right" />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
