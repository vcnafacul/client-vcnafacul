interface ModalImageProps {
  image: string;
}

function ModalImage({ image }: ModalImageProps) {
  return (
    <img
      className="md:min-h-[45vh] md:max-h-[65vh] w-full md:w-fit max-w-[90%]"
      src={image}
    />
  );
}

export default ModalImage;
