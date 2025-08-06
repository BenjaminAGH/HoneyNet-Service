'use client'

import { useState, FormEvent, useEffect } from 'react'
import { getDevices } from '@/lib/api/device'
import { getTopology, createHoneypot } from '@/lib/api/honeypot'
import type { TopologyDTO } from '@/lib/types/honeypot'
import type { DeviceHistoryDTO } from '@/lib/types/device'
import { uploadDockerfile } from '@/lib/api/honeypot'
import { getAvailableDockerfiles } from '@/lib/api/honeypot'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const RED_IP = process.env.NEXT_PUBLIC_RED_IP || '192.168.0.0/24'

interface Props {
  setTopology: React.Dispatch<React.SetStateAction<TopologyDTO | null>>
  setDevices: React.Dispatch<React.SetStateAction<DeviceHistoryDTO[]>>
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  loading: boolean
}

export default function HoneynetControlMenu({
  setTopology,
  setDevices,
  setLoading,
  loading,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '',
    source_type: 'image' as 'image' | 'dockerfile',
    image: '',
    path: '',
  })
  const [errors, setErrors] = useState<{ name?: string; image?: string; path?: string }>({})

  const nameRegex = /^[a-z0-9][a-z0-9._-]+$/

  const [availableDockerfiles, setAvailableDockerfiles] = useState<string[]>([])

  useEffect(() => {
    if (form.source_type === 'dockerfile') {
      getAvailableDockerfiles()
        .then(setAvailableDockerfiles)
        .catch(err => console.error('Error al cargar plantillas', err))
    }
  }, [form.source_type])

  const waitForHoneypot = async (name: string, timeoutMs = 30000, intervalMs = 2000) => {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      const [topology, devices] = await Promise.all([
        getTopology(),
        getDevices(),
      ])
      const found = topology.containers.some(c => c.name === name)
      if (found) {
        setTopology(topology)
        setDevices(devices)
        return true
      }
      await new Promise(resolve => setTimeout(resolve, intervalMs))
    }
    console.warn('Honeypot no apareció a tiempo, se fuerza refresh')
    const [topology, devices] = await Promise.all([
      getTopology(),
      getDevices(),
    ])
    setTopology(topology)
    setDevices(devices)
    return false
  }


  const handleUploadFile = async (file: File) => {
    try {
      const res = await uploadDockerfile(file)
      setForm(f => ({ ...f, path: res.path }))
      setErrors(e => ({ ...e, path: undefined }))
    } catch (err) {
      console.error('Error al subir Dockerfile', err)
      setErrors(e => ({ ...e, path: 'Error al subir Dockerfile' }))
    }
  }

  const validate = () => {
    const e: typeof errors = {}
    if (!form.name.trim()) {
      e.name = 'El nombre es obligatorio'
    } else if (!nameRegex.test(form.name)) {
      e.name = 'Nombre inválido. Solo minúsculas, dígitos, ., _, -'
    }
    if (form.source_type === 'image') {
      if (!form.image.trim()) e.image = 'La imagen es obligatoria'
    } else {
      if (!form.path.trim()) e.path = 'La ruta es obligatoria'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    try {
      await createHoneypot(
        form.name,
        form.source_type,
        form.source_type === 'image' ? form.image : undefined,
        form.source_type === 'dockerfile' ? `./docker/${form.path}` : undefined
      )

      await waitForHoneypot(form.name)
      setForm({ name: '', source_type: 'image', image: '', path: '' })
      setErrors({})
      setShowForm(false)
      setMenuOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  const refreshDevices = async () => {
    try {
      setLoading(true)
      await fetch(`${API_URL}/devices/discover?subnet=${RED_IP}`, { method: 'POST' })
      const [topology, devices] = await Promise.all([
        getTopology(),
        getDevices(),
      ])
      setTopology(topology)
      setDevices(devices)
    } catch (err) {
      console.error('Error actualizando dispositivos:', err)
    } finally {
      setLoading(false)
    }
  }


  return (
    <>
      <div className="fixed z-[999] right-4 bottom-4">
        <button
          onClick={() => {
            setMenuOpen(prev => !prev)
            setShowForm(false)
          }}
          title="Opciones"
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--primary)',
            color: 'var(--primary-foreground)',
            border: 'none',
            fontSize: 24,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}
        >
          +
        </button>

        {/* Menú */}
        {menuOpen && !showForm && (
          <div className="absolute bottom-14 right-0 bg-[var(--card)] border border-[var(--border)] rounded-md shadow-lg p-2 w-64 flex flex-col gap-2 text-sm">
            <button
              onClick={refreshDevices}
              disabled={loading}
              className="flex items-center justify-between px-3 py-2 hover:bg-[var(--muted)] rounded disabled:opacity-60"
            >
              <span>Refrescar dispositivos</span>
              <span
                className={`material-symbols-outlined text-base ${loading ? 'animate-spin' : ''
                  }`}
              >
                {loading ? 'autorenew' : 'refresh'}
              </span>
            </button>

            <hr className="border-[var(--border)] my-1" />

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center justify-between px-3 py-2 hover:bg-[var(--muted)] rounded"
            >
              <span>Crear Honeypot</span>
              <span className="material-symbols-outlined text-base">add</span>
            </button>
          </div>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="fixed bottom-20 right-4 bg-[var(--card)] border border-[var(--border)] rounded-md shadow-xl p-4 z-[999] w-80 space-y-3"
        >
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">Nuevo Honeypot</h3>

          <div>
            <label className="text-xs">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onBlur={validate}
              className="w-full px-2 py-1 rounded border border-[var(--border)] bg-transparent text-sm"
            />
            {errors.name && (
              <p className="text-[var(--destructive)] text-xs">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="text-xs">Fuente</label>
            <select
              value={form.source_type}
              onChange={e =>
                setForm(f => ({
                  ...f,
                  source_type: e.target.value as any,
                  image: '',
                  path: '',
                }))
              }
              className="w-full px-2 py-1 rounded border border-[var(--border)] bg-transparent text-sm"
            >
              <option value="image">image</option>
              <option value="dockerfile">dockerfile (predeterminados)</option>
            </select>
          </div>

          {form.source_type === 'image' && (
            <div>
              <label className="text-xs">Imagen</label>
              <input
                type="text"
                value={form.image}
                onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                onBlur={validate}
                className="w-full px-2 py-1 rounded border border-[var(--border)] bg-transparent text-sm"
              />
              {errors.image && (
                <p className="text-[var(--destructive)] text-xs">{errors.image}</p>
              )}
            </div>
          )}

          {form.source_type === 'dockerfile' && (
            <div>
              <label className="text-xs">Plantilla disponible</label>
              <select
                value={form.path}
                onChange={e => setForm(f => ({ ...f, path: e.target.value }))}
                onBlur={validate}
                className="w-full px-2 py-1 rounded border border-[var(--border)] bg-transparent text-sm"
              >
                <option value="">-- Selecciona una plantilla --</option>
                {availableDockerfiles.map(path => (
                  <option key={path} value={path}>{path}</option>
                ))}
              </select>
              {errors.path && (
                <p className="text-[var(--destructive)] text-xs">{errors.path}</p>
              )}
            </div>
          )}


          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setMenuOpen(false)
              }}
              className="px-3 py-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="bg-[var(--accent)] text-[var(--accent-foreground)] text-xs px-4 py-1 rounded"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear'}
            </button>
          </div>

        </form>
      )}
    </>
  )
}