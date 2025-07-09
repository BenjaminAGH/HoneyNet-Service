'use client'

import { useEffect, useState } from 'react'
import { getHoneypots, createHoneypot, deleteHoneypot } from '@/lib/api/honeypot'
import type { Honeypot } from '@/lib/types/honeypot'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Trash2 } from "lucide-react"

export default function HomePage() {
  const [honeypots, setHoneypots] = useState<Honeypot[]>([])
  const [form, setForm] = useState({
    name: '',
    source_type: 'image' as 'image' | 'dockerfile' | 'compose',
    image: '',
    path: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const data = await getHoneypots()
    setHoneypots(data)
  }

  const waitForHoneypot = async (name: string, retries = 10) => {
    for (let i = 0; i < retries; i++) {
      const all: Honeypot[] = await getHoneypots()
      if (all.find(c => c.name === name)) return
      await new Promise(res => setTimeout(res, 1000))
    }
  }

  const handleSubmit = async () => {
    const { name, source_type, image, path } = form

    if (!name) {
      alert("El nombre es obligatorio")
      return
    }
    if (source_type === 'image' && !image) {
      alert("La imagen es obligatoria para source_type=image")
      return
    }
    if (source_type !== 'image' && !path) {
      alert("La ruta es obligatoria para source_type=dockerfile o compose")
      return
    }

    try {
      await createHoneypot(name, source_type, image || undefined, path || undefined)
      await waitForHoneypot(name)
      await loadData()
      setForm({ name: '', source_type: 'image', image: '', path: '' })
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteHoneypot(id)
      await loadData()
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const canSubmit =
    form.name.trim() !== '' &&
    (form.source_type === 'image'
      ? form.image.trim() !== ''
      : form.path.trim() !== '')

  return (
    <main className="min-h-screen bg-muted py-10 px-4">
      <Card className="max-w-3xl mx-auto p-6">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Honeypot Manager</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <Input
              placeholder="Nombre del contenedor"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />

            <select
              value={form.source_type}
              onChange={e =>
                setForm({
                  ...form,
                  source_type: e.target.value as any,
                  image: '',
                  path: ''
                })
              }
              className="border rounded p-2"
            >
              <option value="image">image</option>
              <option value="dockerfile">dockerfile</option>
              <option value="compose">compose</option>
            </select>

            {form.source_type === 'image' ? (
              <Input
                placeholder="Imagen (ej: nginx:latest)"
                value={form.image}
                onChange={e => setForm({ ...form, image: e.target.value })}
              />
            ) : (
              <Input
                placeholder="Ruta (ej: /app/dockerfiles/myapp)"
                value={form.path}
                onChange={e => setForm({ ...form, path: e.target.value })}
              />
            )}

            <Button onClick={handleSubmit} disabled={!canSubmit}>
              Crear Honeypot
            </Button>
          </div>

          <Separator />

          <h2 className="text-lg font-semibold">Contenedores activos</h2>
          <div className="space-y-2">
            {honeypots.map((c: Honeypot) => (
              <Card key={c.container_id} className="p-4 flex justify-between items-center">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-muted-foreground">Estado: {c.status}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(c.container_id)}
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
