'use client'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const HOST_DEVICE_IP = process.env.NEXT_PUBLIC_HOST_DEVICE_IP

import React, {
  useEffect,
  useState,
  useCallback,
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
  useNodesState,
  useEdgesState,
  Position,
} from '@xyflow/react'
import dagre from 'dagre'

import { getTopology, deleteHoneypot } from '@/lib/api/honeypot'
import { getDevices } from '@/lib/api/device'
import type { TopologyDTO } from '@/lib/types/honeypot'
import type { DeviceHistoryDTO } from '@/lib/types/device'

import RefreshDevicesButton from '@/components/RefreshDevices'
import ControlMenu from '@/components/ControlMenu'
import NetworkNode from '@/components/NetworkNode'
import ContainerNode from '@/components/ContainerNode'
import DeviceNode from '@/components/DeviceNode'

const nodeWidth = 140
const nodeHeight = 40

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
        position: { x: x - nodeWidth / 2, y: y - nodeHeight / 2 },
        sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
        targetPosition: isHorizontal ? Position.Left : Position.Top,
      }
    }),
    edges,
  }
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

    const hostDevice = devices.find(d => d.ip === HOST_DEVICE_IP)

    const networkToDeviceEdges = hostDevice
      ? topology.networks.map(n => ({
        id: `e-device-${n.id}`,
        source: hostDevice.device_id,
        target: n.id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: `var(--accent)`, strokeWidth: 2 },
      }))
      : []

    const allNodes = [
      ...netNodes,
      ...contNodes,
      ...routerNodes,
      ...deviceNodes,
    ]
    const allEdges = [
      ...honeypotEdges,
      ...deviceEdges,
      ...networkToDeviceEdges,
    ]

    const { nodes: ln, edges: le } = getLayoutedElements(allNodes as Node<any>[], allEdges, 'TB')
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
      <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
        <ReactFlow
          style={{ position: 'absolute', inset: 0, background: 'var(--background)' }}
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
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--muted-foreground)" />
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
        
        <ControlMenu
          setTopology={setTopology}
          setDevices={setDevices}
          setLoading={setLoading}
          loading={loading}
        />
      </div>
    </ReactFlowProvider>
  )
}
