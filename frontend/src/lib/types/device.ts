export interface DeviceHistoryDTO {
  device_id: string
  name: string
  type: string
  ip: string
  ports?: string
  network: string
  created_at: string
  source_type: string
  path?: string | null
}
