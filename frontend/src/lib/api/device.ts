const API_URL = process.env.NEXT_PUBLIC_API_URL

import type { DeviceHistoryDTO } from '@/lib/types/device'

export async function getDevices(): Promise<DeviceHistoryDTO[]> {
  const res = await fetch(`${API_URL}/devices/`)
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}