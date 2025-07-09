import '@/styles/globals.css';
import '@xyflow/react/dist/style.css'

import React from 'react';

export const metadata = {
  title: 'Mi App',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
