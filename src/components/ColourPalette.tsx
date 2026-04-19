import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { CameraColourPicker } from './CameraColourPicker'

function parseHex(value: string): string | null {
  const cleaned = value.trim().replace(/^#/, '')
  if (/^[0-9a-fA-F]{6}$/.test(cleaned)) return `#${cleaned.toLowerCase()}`
  if (/^[0-9a-fA-F]{3}$/.test(cleaned)) {
    const [r, g, b] = cleaned.split('')
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  return null
}

export function ColourPalette() {
  const [palette, setPalette] = useLocalStorage<string[]>('crochet-palette', [])
  const [picked, setPicked] = useState('#7c6b4a')
  const [hexInput, setHexInput] = useState('#7c6b4a')
  const [hexValid, setHexValid] = useState(true)
  const [cameraOpen, setCameraOpen] = useState(false)

  function setColor(hex: string) {
    setPicked(hex)
    setHexInput(hex)
    setHexValid(true)
  }

  function handleHexChange(value: string) {
    setHexInput(value)
    const parsed = parseHex(value)
    if (parsed) {
      setPicked(parsed)
      setHexValid(true)
    } else {
      setHexValid(false)
    }
  }

  function addColour() {
    if (hexValid && !palette.includes(picked)) {
      setPalette([...palette, picked])
    }
  }

  function removeColour(hex: string) {
    setPalette(palette.filter((c) => c !== hex))
  }

  return (
    <section className="palette-section" aria-label="Colour palette">
      <h2>Colour Palette</h2>
      <div className="palette-picker">
        <input
          type="color"
          value={picked}
          onChange={(e) => setColor(e.target.value)}
          aria-label="Pick a colour"
          className="colour-input"
        />
        <input
          type="text"
          value={hexInput}
          onChange={(e) => handleHexChange(e.target.value)}
          placeholder="#rrggbb"
          className={`hex-text-input${hexValid ? '' : ' hex-text-input--invalid'}`}
          aria-label="Hex colour code"
          maxLength={7}
          spellCheck={false}
        />
        <button
          className="btn-icon"
          onClick={() => setCameraOpen(true)}
          aria-label="Pick colour from camera"
          title="Pick colour from camera"
        >
          📷
        </button>
      </div>
      <button
        className="btn btn-primary btn-add-colour"
        onClick={addColour}
        disabled={!hexValid}
        aria-label={`Add colour ${picked} to palette`}
      >
        Add colour
      </button>

      {cameraOpen && (
        <CameraColourPicker onPick={setColor} onClose={() => setCameraOpen(false)} />
      )}

      {palette.length === 0 ? (
        <p className="palette-empty">No colours added yet. Pick one above.</p>
      ) : (
        <ul className="swatches" role="list">
          {palette.map((hex) => (
            <li key={hex} className="swatch">
              <span
                className="swatch-colour"
                style={{ backgroundColor: hex }}
                aria-label={`Colour ${hex}`}
              />
              <span className="swatch-hex">{hex}</span>
              <button
                className="swatch-remove"
                onClick={() => removeColour(hex)}
                aria-label={`Remove colour ${hex} from palette`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
