const API_URL = process.env.NEXT_PUBLIC_API_URL

import type {
  NetworkDTO,
  HoneypotContainerDTO,
  TopologyDTO,
  Honeypot,
} from '@/lib/types/honeypot'

export async function getHoneypots(): Promise<Honeypot[]> {
  const res = await fetch(`${API_URL}/honeypots/active`)
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function createHoneypot(
  name: string,
  source_type: string,
  image?: string,
  path?: string
) {
  const res = await fetch(`${API_URL}/honeypots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, source_type, image, path }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || `Error al crear honeypot: ${res.status}`)
  }
  return res.json()
}

export async function deleteHoneypot(containerId: string) {
  const res = await fetch(`${API_URL}/honeypots/${containerId}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || `Error al eliminar ${containerId}: ${res.status}`)
  }
  return res.json()
}

// <-- Aquí nos interesa
export async function getTopology(): Promise<TopologyDTO> {
  const res = await fetch(`${API_URL}/honeypots/topology`)
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}
