interface ModalImageProps {
  image: string;
}

function ModalImage({ image }: ModalImageProps) {
  return (
    <img
        className="md:min-h-[75vh] md:max-h-[85vh] w-full md:w-fit max-w-[90%]"
        src={image}
      />
  );
}

export default ModalImage;
