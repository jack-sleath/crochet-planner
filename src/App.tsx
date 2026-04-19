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
  const [maxColors, setMaxColors] = useState(8)
  const [gridVisible, setGridVisible] = useState(true)
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!imageUrl) { setProcessedUrl(null); return }
    let cancelled = false
    processImage(imageUrl, cols, rows, maxColors)
      .then((url) => { if (!cancelled) setProcessedUrl(url) })
      .catch(() => {})
    return () => { cancelled = true }
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
                <span className="field-label-header">
                  Rows <span className="field-value">{rows}</span>
                </span>
                <input
                  type="range"
                  min={5}
                  max={250}
                  value={rows}
                  onChange={(e) => setRows(Number(e.target.value))}
                  className="range-input"
                  aria-label="Number of grid rows"
                />
              </label>
              <label className="field-label">
                <span className="field-label-header">
                  Columns <span className="field-value">{cols}</span>
                </span>
                <input
                  type="range"
                  min={5}
                  max={250}
                  value={cols}
                  onChange={(e) => setCols(Number(e.target.value))}
                  className="range-input"
                  aria-label="Number of grid columns"
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
