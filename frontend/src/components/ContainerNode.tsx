'use client'

import React, { useState, useRef } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { HoneypotContainerDTO } from '@/lib/types/honeypot'

const TOOLTIP_DELAY = 1000

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

export default ContainerNode
