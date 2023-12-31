import ModalTemplate, { ModalProps } from "../../templates/modalTemplate"

interface ModalImageProps extends ModalProps {
    image: string;
}

function ModalImage({ image, handleClose } : ModalImageProps) {
    return (
        <ModalTemplate onClick={handleClose} className="w-screen h-screen fixed top-0 left-0 z-50 bg-opacity-75 bg-black flex justify-center items-center">
            <img className="md:h-screen md:max-h-[75%] w-full md:w-fit max-w-[90%]" src={image} />
        </ModalTemplate>
    )
}

export default ModalImage