import { useRef, useState } from 'react'

interface Props {
  onImageLoad: (dataUrl: string) => void
  imageUrl: string | null
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']

export function ImageUpload({ onImageLoad, imageUrl }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  function handleFile(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Unsupported file type. Please upload a PNG, JPG, or WEBP image.')
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) onImageLoad(e.target.result as string)
    }
    reader.readAsDataURL(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        onChange={handleChange}
        style={{ display: 'none' }}
        aria-label="Upload image file"
      />
      {!imageUrl ? (
        <div
          className="upload-zone"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          role="button"
          tabIndex={0}
          aria-label="Upload a crochet reference image — click or drag and drop"
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <span className="upload-icon" aria-hidden="true">🖼️</span>
          <p>Drop an image here or <strong>click to upload</strong></p>
          <p className="upload-hint">PNG, JPG, WEBP supported</p>
        </div>
      ) : (
        <button
          className="btn btn-secondary"
          onClick={() => inputRef.current?.click()}
          aria-label="Replace current reference image"
        >
          Replace image
        </button>
      )}
      {error && <p className="error" role="alert">{error}</p>}
    </div>
  )
}
