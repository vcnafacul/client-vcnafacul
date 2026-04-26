type OutputFormat = "image/jpeg" | "image/png";

const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  target?: { width: number; height: number },
  format: OutputFormat = "image/jpeg"
): Promise<File> => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const outWidth = target?.width ?? pixelCrop.width;
  const outHeight = target?.height ?? pixelCrop.height;

  const canvas = document.createElement("canvas");
  canvas.width = outWidth;
  canvas.height = outHeight;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas 2D context is not available");
  }
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outWidth,
    outHeight
  );

  const ext = format === "image/png" ? "png" : "jpg";
  return new Promise<File>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(
        new File([blob!], `cropped-image.${ext}`, { type: format }),
      );
    }, format);
  });
};

export default getCroppedImg;
