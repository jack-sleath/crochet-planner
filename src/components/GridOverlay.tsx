import { useEffect, useRef, useState } from 'react'

interface Props {
  imageUrl: string
}

const MIN_SCALE = 1
const MAX_SCALE = 12

export function GridOverlay({ imageUrl }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map())
  const pinchStart = useRef<{ dist: number; scale: number; cx: number; cy: number; tx: number; ty: number } | null>(null)
  const panStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null)

  const [scale, setScale] = useState(1)
  const [tx, setTx] = useState(0)
  const [ty, setTy] = useState(0)

  // Reset when the image source changes
  useEffect(() => {
    setScale(1); setTx(0); setTy(0)
  }, [imageUrl])

  function clampPan(nextScale: number, x: number, y: number) {
    const vp = viewportRef.current
    if (!vp) return { x, y }
    const w = vp.clientWidth
    const h = vp.clientHeight
    // Allowed pan = half the overflow on each axis
    const maxX = (w * (nextScale - 1)) / 2
    const maxY = (h * (nextScale - 1)) / 2
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    }
  }

  function applyZoom(nextScale: number, focalX: number, focalY: number) {
    const vp = viewportRef.current
    if (!vp) return
    const rect = vp.getBoundingClientRect()
    // Focal point relative to viewport centre
    const fx = focalX - rect.left - rect.width / 2
    const fy = focalY - rect.top - rect.height / 2
    const ratio = nextScale / scale
    const nextTx = fx - (fx - tx) * ratio
    const nextTy = fy - (fy - ty) * ratio
    const clamped = clampPan(nextScale, nextTx, nextTy)
    setScale(nextScale)
    setTx(clamped.x)
    setTy(clamped.y)
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault()
    const factor = Math.exp(-e.deltaY * 0.0015)
    const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * factor))
    if (next === scale) return
    applyZoom(next, e.clientX, e.clientY)
  }

  function handlePointerDown(e: React.PointerEvent) {
    const vp = viewportRef.current
    if (!vp) return
    vp.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values())
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      pinchStart.current = {
        dist,
        scale,
        cx: (a.x + b.x) / 2,
        cy: (a.y + b.y) / 2,
        tx,
        ty,
      }
      panStart.current = null
    } else if (pointers.current.size === 1 && scale > 1) {
      panStart.current = { x: e.clientX, y: e.clientY, tx, ty }
    }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointers.current.size === 2 && pinchStart.current) {
      const [a, b] = Array.from(pointers.current.values())
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      const start = pinchStart.current
      const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, start.scale * (dist / start.dist)))
      const vp = viewportRef.current
      if (!vp) return
      const rect = vp.getBoundingClientRect()
      const fx = start.cx - rect.left - rect.width / 2
      const fy = start.cy - rect.top - rect.height / 2
      const ratio = next / start.scale
      const nextTx = fx - (fx - start.tx) * ratio
      const nextTy = fy - (fy - start.ty) * ratio
      const clamped = clampPan(next, nextTx, nextTy)
      setScale(next)
      setTx(clamped.x)
      setTy(clamped.y)
    } else if (pointers.current.size === 1 && panStart.current) {
      const dx = e.clientX - panStart.current.x
      const dy = e.clientY - panStart.current.y
      const clamped = clampPan(scale, panStart.current.tx + dx, panStart.current.ty + dy)
      setTx(clamped.x)
      setTy(clamped.y)
    }
  }

  function handlePointerEnd(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinchStart.current = null
    if (pointers.current.size === 0) panStart.current = null
  }

  function handleDoubleClick(e: React.MouseEvent) {
    const next = scale > 1.5 ? 1 : 3
    applyZoom(next, e.clientX, e.clientY)
  }

  function reset() {
    setScale(1); setTx(0); setTy(0)
  }

  return (
    <div
      ref={viewportRef}
      className="image-viewport"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onDoubleClick={handleDoubleClick}
      style={{ touchAction: 'none' }}
    >
      <div
        className="image-transform"
        style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})` }}
      >
        <img
          src={imageUrl}
          alt="Crochet reference"
          className="reference-image"
          draggable={false}
        />
      </div>
      {scale > 1 && (
        <button
          type="button"
          className="zoom-reset-btn"
          onClick={reset}
          aria-label="Reset zoom"
        >
          Reset zoom
        </button>
      )}
    </div>
  )
}
