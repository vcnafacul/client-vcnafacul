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
}

function ModalTemplate({
  children,
  handleClose,
  isOpen,
  className,
  ...props
}: ModalTemplateProps) {
  return !isOpen ? null : (
    <div
      className="fixed top-0 left-0 z-50 bg-black/80 w-screen h-screen overflow-y-auto 
        scrollbar-hide"
      {...props}
    >
      <div className="w-full h-full flex justify-center items-center p-1">
        <div className={className}>
          <div className="flex justify-end">
            <IoMdClose
              onClick={handleClose}
              className="self-end md:mt-0 cursor-pointer w-6 h-6"
            />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default ModalTemplate;
