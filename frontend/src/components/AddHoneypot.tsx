'use client'

import React, { useState, FormEvent } from 'react'
import { createHoneypot } from '@/lib/api/honeypot'

interface AddHoneypotProps {
  onAddSuccess: () => void
}

export default function AddHoneypot({ onAddSuccess }: AddHoneypotProps) {
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({
    name: '',
    source_type: 'image' as 'image' | 'dockerfile' | 'compose',
    image: '',
    path: '',
  })
  const [errors, setErrors] = useState<{
    name?: string
    image?: string
    path?: string
  }>({})

  const nameRegex = /^[a-z0-9][a-z0-9._-]+$/

  const validate = () => {
    const e: typeof errors = {}
    if (!form.name.trim()) {
      e.name = 'El nombre es obligatorio'
    } else if (!nameRegex.test(form.name)) {
      e.name = 'Nombre inválido. Solo minúsculas, dígitos, ., _, -'
    }
    if (form.source_type === 'image') {
      if (!form.image.trim()) {
        e.image = 'La imagen es obligatoria'
      }
    } else {
      if (!form.path.trim()) {
        e.path = 'La ruta es obligatoria'
      }
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
        form.source_type !== 'image' ? form.path : undefined
      )
      setShow(false)
      setForm({ name: '', source_type: 'image', image: '', path: '' })
      setErrors({})
      onAddSuccess()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <button
        onClick={() => setShow(v => !v)}
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'var(--primary)',
          color: 'var(--primary-foreground)',
          border: 'none',
          fontSize: 24,
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          zIndex: 999,
        }}
      >
        +
      </button>

      {show && (
        <form
          onSubmit={handleSubmit}
          style={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            background: 'var(--card)',
            border: `1px solid var(--border)`,
            borderRadius: 8,
            padding: 12,
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            minWidth: 240,
          }}
        >
          <label style={{ fontSize: 12 }}>
            Nombre
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onBlur={validate}
              style={{
                width: '100%',
                padding: 6,
                marginTop: 4,
                border: `1px solid var(--border)`,
                borderRadius: 4,
              }}
            />
            {errors.name && (
              <span style={{ color: 'var(--destructive)', fontSize: 11 }}>
                {errors.name}
              </span>
            )}
          </label>

          <label style={{ fontSize: 12 }}>
            Fuente
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
              style={{
                width: '100%',
                padding: 6,
                marginTop: 4,
                border: `1px solid var(--border)`,
                borderRadius: 4,
              }}
            >
              <option value="image">image</option>
              <option value="dockerfile">dockerfile</option>
              <option value="compose">compose</option>
            </select>
          </label>

          {form.source_type === 'image' ? (
            <label style={{ fontSize: 12 }}>
              Imagen
              <input
                type="text"
                value={form.image}
                onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                onBlur={validate}
                style={{
                  width: '100%',
                  padding: 6,
                  marginTop: 4,
                  border: `1px solid var(--border)`,
                  borderRadius: 4,
                }}
              />
              {errors.image && (
                <span style={{ color: 'var(--destructive)', fontSize: 11 }}>
                  {errors.image}
                </span>
              )}
            </label>
          ) : (
            <label style={{ fontSize: 12 }}>
              Ruta
              <input
                type="text"
                value={form.path}
                onChange={e => setForm(f => ({ ...f, path: e.target.value }))}
                onBlur={validate}
                style={{
                  width: '100%',
                  padding: 6,
                  marginTop: 4,
                  border: `1px solid var(--border)`,
                  borderRadius: 4,
                }}
              />
              {errors.path && (
                <span style={{ color: 'var(--destructive)', fontSize: 11 }}>
                  {errors.path}
                </span>
              )}
            </label>
          )}

          <button
            type="submit"
            style={{
              marginTop: 8,
              padding: '8px 12px',
              background: 'var(--accent)',
              color: 'var(--accent-foreground)',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Crear Honeypot
          </button>
        </form>
      )}
    </>
  )
}
