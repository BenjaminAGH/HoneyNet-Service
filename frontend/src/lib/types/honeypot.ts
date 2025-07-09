// types/honeypot.ts

export type Honeypot = {
  container_id: string
  name: string
  image: string
  command: string[]
  created_at: string
  status: string
  ports: string
  source_type: string
  path?: string | null
  // índice abierto para que sea Record<string, unknown>
  [key: string]: unknown
}

// La DTO de contenedor para topología, con su lista de redes
export interface HoneypotContainerDTO extends Honeypot {
  networks: string[]
  // índice abierto (ya heredado de Honeypot pero reforzado)
  [key: string]: unknown
}

export interface NetworkDTO {
  id: string
  name: string
  subnet: string | null
  // IDs completos de contenedores conectados
  containers: string[]
  // índice abierto
  [key: string]: unknown
}

export interface TopologyDTO {
  networks: NetworkDTO[]
  containers: HoneypotContainerDTO[]
}
