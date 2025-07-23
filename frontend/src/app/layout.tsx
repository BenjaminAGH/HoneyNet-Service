import '@/styles/globals.css';
import '@xyflow/react/dist/style.css'

import React from 'react';

export const metadata = {
  title: 'Mi App',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
