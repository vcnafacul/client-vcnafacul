import React, { ComponentProps } from "react";
import { IoMdClose } from "react-icons/io";
import OutsideClickHandler from "react-outside-click-handler";

export interface ModalProps {
  handleClose?: () => void;
}

interface ModalTemplateProps extends ComponentProps<"div"> {
  children: React.ReactNode;
  outSideClose?: boolean;
  isOpen: boolean;
  handleClose: () => void;
}

function ModalTemplate({
  children,
  handleClose,
  outSideClose = false,
  isOpen,
  ...props
}: ModalTemplateProps) {

  return !isOpen ? null : (
    <div
      className="fixed top-0 left-0 z-50 bg-black bg-opacity-30 w-screen h-screen overflow-y-auto 
        scrollbar-hide"
      {...props}
    >
      <div className="w-full h-full flex justify-center items-center">
        {outSideClose ? (
          <OutsideClickHandler
            onOutsideClick={() => {
              handleClose!();
            }}
          >
            <div className="flex flex-col bg-white w-fit p-4 rounded-md">
              <IoMdClose
                onClick={handleClose}
                className="self-end cursor-pointer w-5 h-5"
              />
              {React.cloneElement(children as React.ReactElement, {
                handleClose,
              })}
            </div>
          </OutsideClickHandler>
        ) : (
          <div className="flex flex-col bg-white w-fit p-4 rounded-md">
            <IoMdClose
              onClick={handleClose}
              className="self-end cursor-pointer w-5 h-5"
            />
            {React.cloneElement(children as React.ReactElement, {
              handleClose,
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ModalTemplate;
