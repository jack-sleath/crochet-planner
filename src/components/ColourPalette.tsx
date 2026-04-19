import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

export function ColourPalette() {
  const [palette, setPalette] = useLocalStorage<string[]>('crochet-palette', [])
  const [picked, setPicked] = useState('#7c6b4a')

  function addColour() {
    if (!palette.includes(picked)) {
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
          onChange={(e) => setPicked(e.target.value)}
          aria-label="Pick a colour"
          className="colour-input"
        />
        <button
          className="btn btn-primary"
          onClick={addColour}
          aria-label={`Add colour ${picked} to palette`}
        >
          Add colour
        </button>
      </div>
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
