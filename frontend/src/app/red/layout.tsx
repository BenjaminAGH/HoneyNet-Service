import React from 'react'

export const metadata = {
  title: 'Topología Honeypot',
}

export default function TopologyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-background text-foreground min-h-screen">
        <header className="bg-card text-card-foreground shadow p-4">
          <h1 className="text-xl font-semibold">Topología de Honeypots</h1>
        </header>
        <main className="p-4">{children}</main>
      </body>
    </html>
  )
}

