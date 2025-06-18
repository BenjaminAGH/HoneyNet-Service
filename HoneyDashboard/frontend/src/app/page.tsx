'use client'

import { useEffect, useState } from 'react'
import { getHoneypots, createHoneypot, deleteHoneypot } from '../lib/api'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Trash2 } from "lucide-react";

export default function HomePage() {
  const [honeypots, setHoneypots] = useState<any[]>([])
  const [form, setForm] = useState({ ip: '', protocol: '', port: '', image: '' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const data = await getHoneypots()
    setHoneypots(data)
  }

  const handleSubmit = async () => {
    const { ip, protocol, port, image } = form
    if (!ip || !protocol || !port) {
      alert("IP, protocolo y puerto son obligatorios")
      return
    }
    await createHoneypot(ip, protocol, parseInt(port), image || undefined)
    await loadData()
    setForm({ ip: '', protocol: '', port: '', image: '' })
  }

  const handleDelete = async (name: string) => {
    const parts = name.split('_')
    const protocol = parts[1]
    const ip = parts.slice(2).join('.')
    await deleteHoneypot(ip, protocol)
    await loadData()
  }

  return (
    <main className="min-h-screen bg-muted py-10 px-4">
      <Card className="max-w-3xl mx-auto p-6">
        <CardHeader>
          <CardTitle className="text-2xl text-center"> Honeypot Manager</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <Input
              placeholder="IP (e.g. 192.168.0.10)"
              value={form.ip}
              onChange={e => setForm({ ...form, ip: e.target.value })}
            />
            <Input
              placeholder="Protocolo (e.g. ssh)"
              value={form.protocol}
              onChange={e => setForm({ ...form, protocol: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Puerto (e.g. 2222)"
              value={form.port}
              onChange={e => setForm({ ...form, port: e.target.value })}
            />
            <Input
              placeholder="Imagen (e.g. cowrie)"
              value={form.image}
              onChange={e => setForm({ ...form, image: e.target.value })}
            />
            <Button onClick={handleSubmit}>Crear Honeypot</Button>
          </div>

          <Separator />

          <h2 className="text-lg font-semibold">Contenedores activos</h2>
          <div className="space-y-2">
            {honeypots.map((c) => (
              <Card key={c.name} className="p-4 flex justify-between items-center">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-muted-foreground">Estado: {c.status}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(c.name)}
                    className="ml-4"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
