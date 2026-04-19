import { useState, useEffect } from 'react'
import { ImageUpload } from './components/ImageUpload'
import { GridOverlay } from './components/GridOverlay'
import { ColourPalette } from './components/ColourPalette'
import { processImage } from './utils/imageProcessing'
import './index.css'

export function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [aspectRatio, setAspectRatio] = useState<number | null>(null) // width / height
  const [gridSize, setGridSize] = useState(20) // controls cols; rows derived from aspect ratio
  const [maxColors, setMaxColors] = useState(8)
  const [gridVisible, setGridVisible] = useState(true)
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)

  const cols = gridSize
  const rows = aspectRatio
    ? Math.min(250, Math.max(5, Math.round(gridSize / aspectRatio)))
    : gridSize

  // Detect aspect ratio whenever a new image is loaded
  useEffect(() => {
    if (!imageUrl) { setAspectRatio(null); setProcessedUrl(null); return }
    const img = new Image()
    img.onload = () => setAspectRatio(img.naturalWidth / img.naturalHeight)
    img.src = imageUrl
  }, [imageUrl])

  // Process image only once aspect ratio is known (avoids a wasted run with wrong dimensions)
  useEffect(() => {
    if (!imageUrl || aspectRatio === null) { setProcessedUrl(null); return }
    let cancelled = false
    processImage(imageUrl, cols, rows, maxColors)
      .then((url) => { if (!cancelled) setProcessedUrl(url) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [imageUrl, aspectRatio, cols, rows, maxColors])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Crochet Planner</h1>
      </header>
      <main className="app-main">
        <aside className="sidebar" aria-label="Controls">
          <section aria-label="Image upload">
            <h2>Reference Image</h2>
            <ImageUpload onImageLoad={setImageUrl} imageUrl={imageUrl} />
          </section>

          {imageUrl && (
            <section aria-label="Grid settings">
              <h2>Grid</h2>
              <label className="field-label">
                <span className="field-label-header">
                  Grid size <span className="field-value">{cols} × {rows}</span>
                </span>
                <input
                  type="range"
                  min={5}
                  max={250}
                  value={gridSize}
                  onChange={(e) => setGridSize(Number(e.target.value))}
                  className="range-input"
                  aria-label="Grid size (columns × rows, maintaining image aspect ratio)"
                />
              </label>
              <label className="field-label">
                <span className="field-label-header">
                  Max colours <span className="field-value">{maxColors}</span>
                </span>
                <input
                  type="range"
                  min={2}
                  max={16}
                  value={maxColors}
                  onChange={(e) => setMaxColors(Number(e.target.value))}
                  className="range-input"
                  aria-label="Maximum number of colours in the pixelated image"
                />
              </label>
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={gridVisible}
                  onChange={(e) => setGridVisible(e.target.checked)}
                  aria-label="Toggle grid overlay visibility"
                />
                Show grid
              </label>
            </section>
          )}

          <ColourPalette />
        </aside>

        <div className="canvas-area">
          {imageUrl ? (
            <GridOverlay
              imageUrl={processedUrl ?? imageUrl}
              rows={rows}
              cols={cols}
              visible={gridVisible}
            />
          ) : (
            <div className="canvas-placeholder" aria-label="Image preview area">
              <span aria-hidden="true" style={{ fontSize: '3rem' }}>🧶</span>
              <p>Upload an image to get started</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
