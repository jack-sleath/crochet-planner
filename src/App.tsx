import { useState, useEffect } from 'react'
import { ImageUpload } from './components/ImageUpload'
import { GridOverlay } from './components/GridOverlay'
import { ColourPalette } from './components/ColourPalette'
import { processImage } from './utils/imageProcessing'
import './index.css'

export function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [rows, setRows] = useState(10)
  const [cols, setCols] = useState(10)
  const [maxColors, setMaxColors] = useState(16)
  const [gridVisible, setGridVisible] = useState(true)
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)

  function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n))
  }

  useEffect(() => {
    if (!imageUrl) { setProcessedUrl(null); return }
    processImage(imageUrl, cols, rows, maxColors)
      .then(setProcessedUrl)
      .catch(() => {})
  }, [imageUrl, cols, rows, maxColors])

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
                Rows
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={rows}
                  onChange={(e) => setRows(clamp(Number(e.target.value), 1, 100))}
                  className="number-input"
                  aria-label="Number of grid rows"
                />
              </label>
              <label className="field-label">
                Columns
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={cols}
                  onChange={(e) => setCols(clamp(Number(e.target.value), 1, 100))}
                  className="number-input"
                  aria-label="Number of grid columns"
                />
              </label>
              <label className="field-label">
                Max colours
                <input
                  type="number"
                  min={2}
                  max={64}
                  value={maxColors}
                  onChange={(e) => setMaxColors(clamp(Number(e.target.value), 2, 64))}
                  className="number-input"
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
          {processedUrl ? (
            <GridOverlay
              imageUrl={processedUrl}
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
