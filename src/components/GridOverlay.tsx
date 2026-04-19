import { useEffect, useRef } from 'react'

interface Props {
  imageUrl: string
  rows: number
  cols: number
  visible: boolean
}

export function GridOverlay({ imageUrl, rows, cols, visible }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  // Keep latest props in a ref so ResizeObserver callback stays fresh
  const propsRef = useRef({ rows, cols, visible })
  propsRef.current = { rows, cols, visible }

  const drawGridRef = useRef<() => void>(() => {})

  drawGridRef.current = function drawGrid() {
    const canvas = canvasRef.current
    const img = imgRef.current
    const { rows: r, cols: c, visible: v } = propsRef.current

    if (!canvas || !img) return

    const w = img.clientWidth
    const h = img.clientHeight
    if (w === 0 || h === 0) return

    canvas.width = w
    canvas.height = h

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, w, h)
    if (!v) return

    const cellW = w / c
    const cellH = h / r

    ctx.strokeStyle = 'rgba(255,255,255,0.65)'
    ctx.lineWidth = 1

    for (let col = 0; col <= c; col++) {
      ctx.beginPath()
      ctx.moveTo(col * cellW, 0)
      ctx.lineTo(col * cellW, h)
      ctx.stroke()
    }
    for (let row = 0; row <= r; row++) {
      ctx.beginPath()
      ctx.moveTo(0, row * cellH)
      ctx.lineTo(w, row * cellH)
      ctx.stroke()
    }

    const fontSize = Math.max(8, Math.min(13, Math.floor(Math.min(cellW, cellH) * 0.38)))
    ctx.font = `bold ${fontSize}px system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    for (let row = 0; row < r; row++) {
      for (let col = 0; col < c; col++) {
        const n = row * c + col + 1
        const x = col * cellW + cellW / 2
        const y = row * cellH + cellH / 2
        ctx.fillStyle = 'rgba(0,0,0,0.55)'
        ctx.fillText(String(n), x + 1, y + 1)
        ctx.fillStyle = 'rgba(255,255,255,0.95)'
        ctx.fillText(String(n), x, y)
      }
    }
  }

  // Redraw when props change
  useEffect(() => {
    drawGridRef.current()
  }, [rows, cols, visible, imageUrl])

  // Redraw on container resize
  useEffect(() => {
    const observer = new ResizeObserver(() => drawGridRef.current())
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="image-container">
      <img
        ref={imgRef}
        src={imageUrl}
        alt="Crochet reference"
        className="reference-image"
        onLoad={() => drawGridRef.current()}
      />
      <canvas ref={canvasRef} className="grid-canvas" aria-hidden="true" />
    </div>
  )
}
