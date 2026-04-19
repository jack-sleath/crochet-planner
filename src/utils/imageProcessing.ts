type RGB = [number, number, number]

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

  // K-means++ initialisation
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

  // Iterate until stable (max 12 rounds)
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
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      // Downsample to cols × rows (one pixel per grid cell)
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

      const palette = kMeans(pixels, maxColors)

      for (let i = 0; i < data.length; i += 4) {
        const c = palette[nearestIndex([data[i], data[i + 1], data[i + 2]], palette)]
        data[i] = c[0]; data[i + 1] = c[1]; data[i + 2] = c[2]
      }
      ctx.putImageData(imageData, 0, 0)

      resolve(canvas.toDataURL())
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = imageUrl
  })
}
