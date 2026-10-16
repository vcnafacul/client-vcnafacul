import React, { ComponentProps } from "react";
import { IoMdClose } from "react-icons/io";

export interface ModalProps {
  handleClose?: () => void;
}

interface ModalTemplateProps extends ComponentProps<"div"> {
  children: React.ReactNode;
  isOpen: boolean;
  handleClose: () => void;
  className?: string;
  closer?: boolean;
}

function ModalTemplate({
  children,
  handleClose,
  isOpen,
  className,
  closer = true,
  ...props
}: ModalTemplateProps) {
  return !isOpen ? null : (
    /*
      ⚠️ Altura da área VISÍVEL (`dvh`), não `h-screen`: no celular o `100vh`
      inclui o espaço atrás da barra do navegador, o modal centralizava nesse
      espaço maior e a parte de baixo ficava escondida, sem como rolar até ela
      — o botão Confirmar da chamada aparecia cortado (Oppo A58, Moto Edge 70).
    */
    <div
      className="fixed inset-0 z-50 bg-black/65 h-screen supports-[height:100dvh]:h-dvh overflow-y-auto 
        scrollbar-hide"
      {...props}
    >
      <div className="min-h-full w-full flex justify-center items-start py-4 md:py-8 px-2 md:px-4">
        <div className={`my-auto ${className}`}>
          <div className="flex justify-end shrink-0">
            {closer && (
              <IoMdClose
                onClick={handleClose}
                className="self-end md:mt-0 cursor-pointer w-6 h-6"
              />
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default ModalTemplate;
