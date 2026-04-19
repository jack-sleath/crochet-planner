import { useEffect, useRef, useState } from 'react'

interface Props {
  onPick: (hex: string) => void
  onClose: () => void
}

export function CameraColourPicker({ onPick, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)
  const [sampledColor, setSampledColor] = useState('#888888')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera not supported in this browser.')
      return
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' } } })
      .then((stream) => {
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      })
      .catch(() => setError('Camera access denied or unavailable.'))

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    const SAMPLE = 11

    function tick() {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState < 2 || video.videoWidth === 0) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      canvas.width = SAMPLE
      canvas.height = SAMPLE
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return

      ctx.drawImage(
        video,
        (video.videoWidth - SAMPLE) / 2,
        (video.videoHeight - SAMPLE) / 2,
        SAMPLE, SAMPLE,
        0, 0, SAMPLE, SAMPLE,
      )
      const { data } = ctx.getImageData(0, 0, SAMPLE, SAMPLE)
      const n = SAMPLE * SAMPLE
      let r = 0, g = 0, b = 0
      for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i + 1]; b += data[i + 2] }
      setSampledColor(
        `#${Math.round(r / n).toString(16).padStart(2, '0')}` +
        `${Math.round(g / n).toString(16).padStart(2, '0')}` +
        `${Math.round(b / n).toString(16).padStart(2, '0')}`,
      )
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div
      className="camera-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Camera colour picker"
    >
      <div className="camera-modal" onClick={(e) => e.stopPropagation()}>
        <div className="camera-viewport">
          {error ? (
            <p className="camera-error">{error}</p>
          ) : (
            <video ref={videoRef} className="camera-video" autoPlay playsInline muted />
          )}
          {!error && <div className="camera-reticle" aria-hidden="true" />}
        </div>
        <canvas ref={canvasRef} hidden />
        <div className="camera-preview">
          <span
            className="camera-swatch"
            style={{ backgroundColor: sampledColor }}
            aria-label={`Sampled colour ${sampledColor}`}
          />
          <span className="camera-hex-label">{sampledColor}</span>
        </div>
        <div className="camera-actions">
          <button
            className="btn btn-primary"
            onClick={() => { onPick(sampledColor); onClose() }}
          >
            Use this colour
          </button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
