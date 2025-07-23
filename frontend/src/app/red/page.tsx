'use client'

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react'

import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  addEdge,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from '@xyflow/react'
import dagre from 'dagre'

import { getTopology, deleteHoneypot } from '@/lib/api/honeypot'
import type {
  NetworkDTO,
  HoneypotContainerDTO,
  TopologyDTO,
} from '@/lib/types/honeypot'

import { getDevices } from '@/lib/api/device'
import type { DeviceHistoryDTO } from '@/lib/types/device'

import AddHoneypot from '@/components/AddHoneypot'

const TOOLTIP_DELAY = 1000
const nodeWidth  = 140
const nodeHeight =  40

function getLayoutedElements(
  nodes: Node<any>[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB'
) {
  const isHorizontal = direction === 'LR'
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({
    rankdir: direction,
    ranksep: 150,
    nodesep: 50,
    marginx: 20,
    marginy: 20,
  })

  nodes.forEach(n => g.setNode(n.id, { width: nodeWidth, height: nodeHeight }))
  edges.forEach(e => g.setEdge(e.source, e.target))
  dagre.layout(g)

  return {
    nodes: nodes.map(n => {
      const { x, y } = g.node(n.id)!
      return {
        ...n,
        position: { x: x - nodeWidth/2, y: y - nodeHeight/2 },
        sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
        targetPosition: isHorizontal ? Position.Left  : Position.Top,
      }
    }),
    edges,
  }
}



const NetworkNode = ({ data }: { data: NetworkDTO }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const timeoutRef = useRef<number | undefined>(undefined)

  const onEnter = () => {
    timeoutRef.current = window.setTimeout(() => setShowTooltip(true), TOOLTIP_DELAY)
  }
  const onLeave = () => {
    if (timeoutRef.current !== undefined) {
      clearTimeout(timeoutRef.current)
    }
    setShowTooltip(false)
  }

  const isRouter = data.name.toLowerCase() === 'router'

  return (
    <div
    onMouseEnter={onEnter}
    onMouseLeave={onLeave}
    style={{
      width: 80,
      height: 80,
      borderRadius: '50%',
      border: `2px solid var(--accent)`,
      background: `var(--popover)`,
      color: `var(--foreground)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 24,
      fontWeight: 'bold',
      position: 'relative',
      cursor: 'default',
    }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 36 }}>
          {isRouter ? 'router' : 'network_node'}
        </span>
        <span style={{ fontSize: 15, marginTop: 2 }}>
          {data.name.charAt(0).toUpperCase()}
        </span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: 'var(--accent)' }}
      />
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: 6,
            padding: '4px 8px',
            background: 'var(--card)',
            color: 'var(--card-foreground)',
            borderRadius: 4,
            fontSize: 12,
            whiteSpace: 'nowrap',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            zIndex: 10,
          }}
        >
          {data.name}
        </div>
      )}
    </div>
  )
}

const ContainerNode = ({ data }: { data: HoneypotContainerDTO }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const timeoutRef = useRef<number | undefined>(undefined)

  const onEnter = () => {
    timeoutRef.current = window.setTimeout(() => setShowTooltip(true), TOOLTIP_DELAY)
  }
  const onLeave = () => {
    if (timeoutRef.current !== undefined) {
      clearTimeout(timeoutRef.current)
    }
    setShowTooltip(false)
  }

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        padding: 8,
        border: `1px solid var(--border)`,
        borderRadius: 4,
        background: `var(--card)`,
        color: `var(--card-foreground)`,
        fontSize: 12,
        minWidth: 120,
        textAlign: 'center',
        position: 'relative',
        cursor: 'default',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: 'var(--muted)' }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
          Hive
        </span>
        <strong style={{ color: 'var(--destructive)', fontSize: 12 }}>{data.name}</strong>
      </div>
      <div style={{ fontSize: 10, marginTop: 4, color: 'var(--muted-foreground)' }}>
        {data.status}
      </div>
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: 6,
            padding: '6px 10px',
            background: 'var(--popover)',
            color: 'var(--foreground)',
            borderRadius: 4,
            fontSize: 11,
            lineHeight: 1.3,
            textAlign: 'left',
            whiteSpace: 'nowrap',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            zIndex: 10,
          }}
        >
          <div><strong>Image:</strong> {data.image}</div>
          <div><strong>Ports:</strong> {data.ports}</div>
          {data.command.length > 0 && (
            <div><strong>Cmd:</strong> {data.command.join(' ')}</div>
          )}
          {data.networks.length > 0 && (
            <div><strong>Networks:</strong> {data.networks.join(', ')}</div>
          )}
        </div>
      )}
    </div>
  )
}

const DeviceNode = ({ data }: { data: DeviceHistoryDTO }) => {
  const type = data.type?.toLowerCase() || '';
  const isLinux = type.includes('linux');

  const [showTooltip, setShowTooltip] = useState(false)
  const timeoutRef = useRef<number | undefined>(undefined)

  const onEnter = () => {
    timeoutRef.current = window.setTimeout(() => setShowTooltip(true), TOOLTIP_DELAY)
  }
  const onLeave = () => {
    if (timeoutRef.current !== undefined) {
      clearTimeout(timeoutRef.current)
    }
    setShowTooltip(false)
  }

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        padding: 8,
        border: `1px dashed var(--accent)`,
        borderRadius: 4,
        background: `var(--background)`,
        color: `var(--foreground)`,
        fontSize: 12,
        minWidth: 100,
        textAlign: 'center',
        position: 'relative',
        cursor: 'default',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: 'var(--accent)' }} />
      <div>
        {isLinux ? (
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
            computer
          </span>
        ) : (
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
            remove_selection
          </span>
        )}
      </div>
      <div style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{data.ip}</div>

      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: 6,
            padding: '6px 10px',
            background: 'var(--popover)',
            color: 'var(--foreground)',
            borderRadius: 4,
            fontSize: 11,
            lineHeight: 1.3,
            textAlign: 'left',
            whiteSpace: 'nowrap',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            zIndex: 10,
          }}
        >
          <div><strong>IP:</strong> {data.ip}</div>
          <div><strong>Tipo:</strong> {data.type}</div>
          {data.ports && <div><strong>Puertos:</strong> {data.ports}</div>}
          <div><strong>Red:</strong> {data.network}</div>
        </div>
      )}
    </div>
  )
}


export default function TopologyPage() {
  const [topology, setTopology] = useState<TopologyDTO | null>(null)
  const [devices, setDevices] = useState<DeviceHistoryDTO[]>([])
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [editMode, setEditMode] = useState(false)
  const [contextMenu, setContextMenu] = useState<null | {
    x: number
    y: number
    nodeId: string
  }>(null)
  const [loading, setLoading] = useState(false)

  const refreshDevices = async () => {
    try {
      setLoading(true)
      await fetch('/devices/discover?subnet=192.168.0.0/24', { method: 'POST' })
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


  const fetchAll = useCallback(() => {
    getTopology().then(setTopology).catch(console.error)
    getDevices().then(setDevices).catch(console.error)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  useEffect(() => {
    if (!topology) return

    const netNodes = topology.networks.map(net => ({
      id: net.id,
      type: 'network',
      data: net,
      position: { x: 0, y: 0 },
    }))
    const contNodes = topology.containers.map(c => ({
      id: c.container_id,
      type: 'container',
      data: c,
      position: { x: 0, y: 0 },
    }))

    const routerDevices = devices.filter(d => d.type.toLowerCase() === 'router')
    const normalDevices = devices.filter(d => d.type.toLowerCase() !== 'router')

    const routerNodes = routerDevices.map(d => ({
      id: `router-${d.device_id}`,
      type: 'network',
      data: { name: 'Router' },
      position: { x: 0, y: 0 },
    }))

    const deviceNodes = normalDevices.map(d => ({
      id: d.device_id,
      type: 'device',
      data: d,
      position: { x: 0, y: 0 },
    }))

    const deviceEdges = normalDevices.flatMap(d => {
      const router = routerDevices.find(r => r.network === d.network)
      return router
        ? [{
            id: `e-router-${d.device_id}`,
            source: `router-${router.device_id}`,
            target: d.device_id,
            type: 'smoothstep',
            animated: false,
            style: { stroke: `var(--accent)`, strokeWidth: 1 },
          }]
        : []
    })

    const honeypotEdges = topology.containers.flatMap(c =>
      c.networks.map(netId => ({
        id: `e-${netId}-${c.container_id}`,
        source: netId,
        target: c.container_id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: `var(--secondary)`, strokeWidth: 2 },
      }))
    )

    const allNodes = [...netNodes, ...contNodes, ...routerNodes, ...deviceNodes]
    const allEdges = [...honeypotEdges, ...deviceEdges]
    const { nodes: ln, edges: le } = getLayoutedElements(
      allNodes as Node<any>[],
      allEdges,
      'TB'
    )
    setNodes(ln)
    setEdges(le)
  }, [topology, devices, setNodes, setEdges])

  const onConnect = useCallback(
    (c: Connection) => setEdges(es => addEdge(c, es)),
    [setEdges]
  )

  const onNodeContextMenu = useCallback((evt: React.MouseEvent, node: Node) => {
    evt.preventDefault()
    if (node.type === 'container') {
      setContextMenu({ x: evt.clientX, y: evt.clientY, nodeId: node.id })
    }
  }, [])

  useEffect(() => {
    const h = () => setContextMenu(null)
    window.addEventListener('click', h)
    return () => window.removeEventListener('click', h)
  }, [])

  const handleDelete = useCallback(async () => {
    if (!contextMenu) return
    await deleteHoneypot(contextMenu.nodeId).catch(console.error)
    setNodes(ns => ns.filter(n => n.id !== contextMenu.nodeId))
    setEdges(es =>
      es.filter(e => e.source !== contextMenu.nodeId && e.target !== contextMenu.nodeId)
    )
    setContextMenu(null)
  }, [contextMenu, setNodes, setEdges])

  if (!topology) return <div>Cargando topología…</div>

  return (
    <ReactFlowProvider>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
      
        <ReactFlow
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--background)',
          }}
          nodes={nodes}
          edges={edges}
          nodeTypes={{ network: NetworkNode, container: ContainerNode, device: DeviceNode }}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeContextMenu={onNodeContextMenu}
          fitView
          nodesDraggable
          selectNodesOnDrag={true}
          elementsSelectable={true}
          nodesConnectable={editMode}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="var(--muted-foreground)"
          />
          <Controls position="top-right" />
        </ReactFlow>

        {contextMenu && (
          <ul
            style={{
              position: 'absolute',
              top: contextMenu.y,
              left: contextMenu.x,
              margin: 0,
              padding: '4px 0',
              listStyle: 'none',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 100,
              minWidth: 160,
            }}
          >
            <li
              onClick={handleDelete}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                color: 'var(--destructive)',
                fontSize: 14,
                borderRadius: 4,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              Eliminar contenedor
            </li>
          </ul>
        )}

        <AddHoneypot onAddSuccess={fetchAll} />

        <button
          onClick={refreshDevices}
          disabled={loading}
          title="Actualizar dispositivos"
          style={{
            position: 'absolute',
            bottom: 155,       // ← Separa del botón de abajo (48px alto + 16px espacio)
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
        
      </div>
    </ReactFlowProvider>
  )
}
