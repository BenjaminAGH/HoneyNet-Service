'use client'

import React from 'react'
import { getDevices } from '@/lib/api/device'
import { getTopology } from '@/lib/api/honeypot'
import type { TopologyDTO } from '@/lib/types/honeypot'
import type { DeviceHistoryDTO } from '@/lib/types/device'

const API_URL = process.env.NEXT_PUBLIC_API_URL

type Props = {
  setTopology: React.Dispatch<React.SetStateAction<TopologyDTO | null>>
  setDevices: React.Dispatch<React.SetStateAction<DeviceHistoryDTO[]>>
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  loading: boolean
}

export default function RefreshDevicesButton({
  setTopology,
  setDevices,
  setLoading,
  loading,
}: Props) {
  const refreshDevices = async () => {
    try {
      setLoading(true)
      await fetch(`${API_URL}/devices/discover?subnet=192.168.0.0/24`, { method: 'POST' })
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
    <button
      onClick={refreshDevices}
      disabled={loading}
      title="Actualizar dispositivos"
      style={{
        position: 'absolute',
        bottom: 155,
        right: 2,
        zIndex: 100,
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: 'var(--accent)',
        color: 'white',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
        {loading ? 'autorenew' : 'refresh'}
      </span>
    </button>
  )
}
