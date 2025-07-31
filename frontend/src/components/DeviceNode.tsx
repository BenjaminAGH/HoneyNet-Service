'use client'

import React, { useState, useRef } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { DeviceHistoryDTO } from '@/lib/types/device'

const TOOLTIP_DELAY = 1000

const DeviceNode = ({ data }: { data: DeviceHistoryDTO }) => {
    const type = data.type?.toLowerCase() || ''
    const isLinux = type.includes('linux')

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
            <Handle
  type="source"
  position={Position.Bottom}
  id="bottom"
  style={{ background: 'var(--accent)' }}
/>
</div>
            <div style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{data.ip}<Handle
  type="source"
  position={Position.Bottom}
  id="bottom"
  style={{ background: 'var(--accent)' }}
/>
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
                    <div><strong>IP:</strong> {data.ip}<Handle
  type="source"
  position={Position.Bottom}
  id="bottom"
  style={{ background: 'var(--accent)' }}
/>
</div>
                    <div><strong>Tipo:</strong> {data.type}<Handle
  type="source"
  position={Position.Bottom}
  id="bottom"
  style={{ background: 'var(--accent)' }}
/>
</div>
                    {data.ports && <div><strong>Puertos:</strong> {data.ports}<Handle
  type="source"
  position={Position.Bottom}
  id="bottom"
  style={{ background: 'var(--accent)' }}
/>
</div>}
                    <div><strong>Red:</strong> {data.network}<Handle
  type="source"
  position={Position.Bottom}
  id="bottom"
  style={{ background: 'var(--accent)' }}
/>
</div>
                <Handle
  type="source"
  position={Position.Bottom}
  id="bottom"
  style={{ background: 'var(--accent)' }}
/>
</div>
            )}
        <Handle
  type="source"
  position={Position.Bottom}
  id="bottom"
  style={{ background: 'var(--accent)' }}
/>
</div>
    )
}

export default DeviceNode
