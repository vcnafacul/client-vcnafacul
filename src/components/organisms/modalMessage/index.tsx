import React from "react";
import Text from "../../atoms/text";
import Button from "../../molecules/button";
import ModalTemplate, { ModalProps } from "../../templates/modalTemplate";

export interface ModalMessageProps extends ModalProps {
  text?: string;
  children?: React.ReactNode;
  isOpen: boolean;
}

function ModalMessage({
  text,
  children,
  handleClose,
  isOpen,
}: ModalMessageProps) {
  return (
    <ModalTemplate isOpen={isOpen} handleClose={handleClose!}>
      <div className="px-4 md:max-w-[700px] rounded-2xl flex flex-col gap-4">
        <Text size="secondary" className="font-black m-0 text-start">
          {text}
        </Text>
        {children}
        <div className="flex gap-2 justify-end">
          <Button
            size="small"
            typeStyle="primary"
            hover
            onClick={() => {
              handleClose!();
            }}
          >
            Confirmar
          </Button>
        </div>
      </div>
    </ModalTemplate>
  );
}

export default ModalMessage;
