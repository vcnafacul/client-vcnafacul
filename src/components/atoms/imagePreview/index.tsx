interface Props {
  imagePreview: string | ArrayBuffer;
}

export function ImagePreview({ imagePreview }: Props) {
  return (
    <div className="w-full flex justify-center items-center overflow-hidden">
      <img className="max-h-72" src={imagePreview as string} />
    </div>
  );
}
