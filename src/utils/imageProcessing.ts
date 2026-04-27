type RGB = [number, number, number]

function hexToRgb(hex: string): RGB {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

function colorDist(a: RGB, b: RGB): number {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
}

function nearestIndex(pixel: RGB, palette: RGB[]): number {
  let minDist = Infinity
  let idx = 0
  for (let i = 0; i < palette.length; i++) {
    const d = colorDist(pixel, palette[i])
    if (d < minDist) { minDist = d; idx = i }
  }
  return idx
}

function kMeans(pixels: RGB[], k: number): RGB[] {
  const clampedK = Math.min(k, pixels.length)

  const centroids: RGB[] = [[...pixels[Math.floor(Math.random() * pixels.length)]]]
  while (centroids.length < clampedK) {
    const dists = pixels.map(p => Math.min(...centroids.map(c => colorDist(p, c))))
    const total = dists.reduce((a, b) => a + b, 0)
    if (total === 0) {
      while (centroids.length < clampedK) centroids.push([...centroids[0]])
      break
    }
    let rand = Math.random() * total
    let chosen = pixels[pixels.length - 1]
    for (let i = 0; i < pixels.length; i++) {
      rand -= dists[i]
      if (rand <= 0) { chosen = pixels[i]; break }
    }
    centroids.push([...chosen])
  }

  for (let iter = 0; iter < 12; iter++) {
    const sums: [number, number, number, number][] = Array.from({ length: clampedK }, () => [0, 0, 0, 0])
    for (const p of pixels) {
      const i = nearestIndex(p, centroids)
      sums[i][0] += p[0]; sums[i][1] += p[1]; sums[i][2] += p[2]; sums[i][3]++
    }
    let changed = false
    for (let i = 0; i < clampedK; i++) {
      if (sums[i][3] > 0) {
        const next: RGB = [
          Math.round(sums[i][0] / sums[i][3]),
          Math.round(sums[i][1] / sums[i][3]),
          Math.round(sums[i][2] / sums[i][3]),
        ]
        if (colorDist(next, centroids[i]) > 0) changed = true
        centroids[i] = next
      }
    }
    if (!changed) break
  }

  return centroids
}

export function processImage(
  imageUrl: string,
  cols: number,
  rows: number,
  maxColors: number,
  userPalette: string[] = [],
  showGrid = false,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = cols
      canvas.height = rows
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) { reject(new Error('Canvas context unavailable')); return }

      ctx.drawImage(img, 0, 0, cols, rows)
      const imageData = ctx.getImageData(0, 0, cols, rows)
      const { data } = imageData

      const pixels: RGB[] = []
      for (let i = 0; i < data.length; i += 4) {
        pixels.push([data[i], data[i + 1], data[i + 2]])
      }

      const palette = userPalette.length > 0
        ? userPalette.map(hexToRgb)
        : kMeans(pixels, maxColors)

      const hexGrid: string[] = pixels.map(p => {
        const [r, g, b] = palette[nearestIndex(p, palette)]
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
      })

      const parts: string[] = [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cols} ${rows}" width="${img.naturalWidth}" height="${img.naturalHeight}" shape-rendering="crispEdges">`,
      ]

      // Pixel colour rects (run-length encoded per row); collect run-length labels
      const runLabels: Array<{ x: number; y: number; n: number }> = []
      for (let row = 0; row < rows; row++) {
        let spanStart = 0
        let spanColor = hexGrid[row * cols]
        for (let col = 1; col <= cols; col++) {
          const hex = col < cols ? hexGrid[row * cols + col] : ''
          if (hex !== spanColor) {
            const length = col - spanStart
            parts.push(`<rect x="${spanStart}" y="${row}" width="${length}" height="1" fill="${spanColor}"/>`)
            if (length >= 2) runLabels.push({ x: spanStart + length / 2, y: row + 0.5, n: length })
            spanStart = col
            spanColor = hex
          }
        }
      }

      if (showGrid) {
        // Grid lines — single path covering all cell boundaries
        let d = ''
        for (let col = 0; col <= cols; col++) d += `M${col},0V${rows}`
        for (let row = 0; row <= rows; row++) d += `M0,${row}H${cols}`
        parts.push(`<path d="${d}" stroke="rgba(255,255,255,0.65)" stroke-width="0.04" fill="none"/>`)

        // Edge numbers — grouped to share style attributes
        parts.push(
          `<g font-family="system-ui,sans-serif" font-weight="bold" font-size="0.38"` +
          ` text-anchor="middle" dominant-baseline="middle"` +
          ` stroke="rgba(0,0,0,0.55)" stroke-width="0.07" paint-order="stroke" fill="rgba(255,255,255,0.95)">`
        )
        // Top + bottom: column numbers
        for (let col = 0; col < cols; col++) {
          const x = col + 0.5
          const n = col + 1
          parts.push(`<text x="${x}" y="0.5">${n}</text>`)
          parts.push(`<text x="${x}" y="${rows - 0.5}">${n}</text>`)
        }
        // Left + right: row numbers (skip corners already covered above)
        for (let row = 1; row < rows - 1; row++) {
          const y = row + 0.5
          const n = row + 1
          parts.push(`<text x="0.5" y="${y}">${n}</text>`)
          parts.push(`<text x="${cols - 0.5}" y="${y}">${n}</text>`)
        }
        // Run-length labels at colour changes
        for (const { x, y, n } of runLabels) {
          parts.push(`<text x="${x}" y="${y}">${n}</text>`)
        }
        parts.push('</g>')
      }

      parts.push('</svg>')
      resolve(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(parts.join(''))}`)
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = imageUrl
  })
}
