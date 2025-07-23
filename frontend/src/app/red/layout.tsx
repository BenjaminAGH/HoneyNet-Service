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
        <header className="bg-background text-card-foreground p-4 border-b-2 border-border-foreground">
          <h1 className="text-xl font-semibold">Vista de Red</h1>
        </header>
        <main className="p-4">{children}</main>
      </body>
    </html>
  )
}

