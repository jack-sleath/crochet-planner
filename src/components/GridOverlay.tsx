interface Props {
  imageUrl: string
}

export function GridOverlay({ imageUrl }: Props) {
  return (
    <div className="image-container">
      <img
        src={imageUrl}
        alt="Crochet reference"
        className="reference-image"
      />
    </div>
  )
}
