interface Props {
  imagePreview: string | ArrayBuffer;
}

export function ImagePreview({ imagePreview }: Props) {
  return (
    <div className="w-full max-h-64 flex justify-center items-center overflow-hidden">
      <img className="max-h-60" src={imagePreview as string} />
    </div>
  );
}
