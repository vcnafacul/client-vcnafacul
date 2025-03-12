import ModalTemplate from "@/components/templates/modalTemplate";

interface ModalImageProps {
  image: string;
  isOpen: boolean;
  handleClose: () => void;
}

function ModalImage({ image, isOpen, handleClose }: ModalImageProps) {
  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white p-2 rounded-md"
    >
      <img
        className="md:min-h-[45vh] md:max-h-[65vh] w-full md:w-fit max-w-[90%]"
        src={image}
      />
    </ModalTemplate>
  );
}

export default ModalImage;
