import React from "react";

export const metadata = {
  title: "Topología Honeypot",
};

export default function TopologyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="p-4 bg-background text-foreground min-h-screen">
      {children}
    </main>
  );
}
