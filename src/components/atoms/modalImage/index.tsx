import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ModalImageProps {
  image: string;
  isOpen: boolean;
  handleClose: () => void;
}

// tickets/059 D21: pré-visualização de imagem; sem título visível, o título fica só para leitor de tela.
function ModalImage({ image, isOpen, handleClose }: ModalImageProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(aberto) => !aberto && handleClose()}>
      <DialogContent size="lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="sr-only">Imagem ampliada</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex items-center justify-center">
          <img
            className="max-h-full max-w-full object-contain"
            src={image}
            alt="Imagem ampliada"
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

export default ModalImage;
