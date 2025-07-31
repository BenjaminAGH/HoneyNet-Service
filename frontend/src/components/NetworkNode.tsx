'use client'

import React, { useState, useRef } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NetworkDTO } from '@/lib/types/honeypot'

const TOOLTIP_DELAY = 1000

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
            <Handle
  type="target"
  position={Position.Top}
  id="top"
  style={{ background: 'var(--accent)' }}
/>
<Handle
  type="source"
  position={Position.Bottom}
  id="bottom"
  style={{ background: 'var(--accent)' }}
/>
</div>
            <Handle
                type="target"
                position={Position.Top}
                style={{ background: 'var(--accent)' }}
            />
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
                <Handle
  type="target"
  position={Position.Top}
  id="top"
  style={{ background: 'var(--accent)' }}
/>
<Handle
  type="source"
  position={Position.Bottom}
  id="bottom"
  style={{ background: 'var(--accent)' }}
/>
</div>
            )}
        <Handle
  type="target"
  position={Position.Top}
  id="top"
  style={{ background: 'var(--accent)' }}
/>
<Handle
  type="source"
  position={Position.Bottom}
  id="bottom"
  style={{ background: 'var(--accent)' }}
/>
</div>
    )
}

export default NetworkNode
